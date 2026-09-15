-- Secure customer order creation for Cafe SRT.
-- Review this migration before running it in the Supabase SQL Editor.
-- It replaces direct anonymous table inserts with one validated atomic RPC.

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('UPI', 'COD', 'pay_on_delivery'));

create or replace function public.create_customer_order(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_address text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_maps_url text default null,
  p_items jsonb default '[]'::jsonb
)
returns table(id uuid, order_number text, verified_total numeric)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  item jsonb;
  addon_id uuid;
  product_row public.products%rowtype;
  variant_row public.product_variants%rowtype;
  addon_row public.addons%rowtype;
  addon_price_row public.addon_prices%rowtype;
  order_id_value uuid;
  order_number_value text;
  item_product_id uuid;
  item_variant_id uuid;
  item_quantity integer;
  base_unit_price numeric;
  addon_total numeric;
  unit_total numeric;
  line_total numeric;
  order_total numeric := 0;
  addon_ids uuid[];
  addon_snapshots jsonb;
begin
  if nullif(trim(p_customer_name), '') is null then raise exception 'Customer name is required'; end if;
  if nullif(trim(p_customer_phone), '') is null then raise exception 'Customer phone is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'At least one order item is required'; end if;

  order_number_value := 'SRT' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    order_number, customer_name, customer_phone, delivery_address,
    latitude, longitude, maps_url, payment_method, payment_status,
    order_status, subtotal, total
  ) values (
    order_number_value, trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_delivery_address), ''),
    p_latitude, p_longitude, nullif(trim(p_maps_url), ''), 'pay_on_delivery', 'pending',
    'New', 0, 0
  ) returning id into order_id_value;

  for item in select value from jsonb_array_elements(p_items)
  loop
    item_product_id := (item->>'product_id')::uuid;
    item_variant_id := nullif(item->>'variant_id', '')::uuid;
    item_quantity := (item->>'quantity')::integer;
    if item_quantity is null or item_quantity < 1 then raise exception 'Quantity must be positive'; end if;

    select * into product_row from public.products
    where id = item_product_id and is_active = true and is_available = true;
    if not found then raise exception 'Product is unavailable'; end if;

    if item_variant_id is not null then
      select * into variant_row from public.product_variants
      where id = item_variant_id and product_id = product_row.id and is_available = true;
      if not found then raise exception 'Invalid or unavailable product variant'; end if;
      if variant_row.price is null then raise exception 'Selected variant has no price'; end if;
      base_unit_price := variant_row.price;
    else
      if product_row.has_variants then raise exception 'A variant is required for this product'; end if;
      if product_row.base_price is null then raise exception 'Product price must be confirmed on WhatsApp'; end if;
      base_unit_price := product_row.base_price;
    end if;

    addon_total := 0;
    addon_snapshots := '[]'::jsonb;
    addon_ids := array(select value::text::uuid from jsonb_array_elements_text(coalesce(item->'addon_ids', '[]'::jsonb)));
    foreach addon_id in array addon_ids
    loop
      select a.* into addon_row from public.addons a
      join public.product_addons pa on pa.addon_id = a.id
      where pa.product_id = product_row.id and pa.addon_id = addon_id and a.is_active = true;
      if not found then raise exception 'Invalid add-on for selected product'; end if;
      if item_variant_id is null then raise exception 'A variant is required for add-on pricing'; end if;
      select ap.* into addon_price_row from public.addon_prices ap
      where ap.addon_id = addon_id and lower(ap.variant_name) = lower(variant_row.name);
      if not found or addon_price_row.price is null then raise exception 'Add-on price is unavailable'; end if;
      addon_total := addon_total + addon_price_row.price;
      addon_snapshots := addon_snapshots || jsonb_build_array(jsonb_build_object('name', addon_row.name, 'price', addon_price_row.price));
    end loop;

    unit_total := base_unit_price + addon_total;
    line_total := unit_total * item_quantity;
    order_total := order_total + line_total;

    insert into public.order_items (
      order_id, product_id, product_name_snapshot, variant_name,
      unit_price, quantity, addons_snapshot, line_total
    ) values (
      order_id_value, product_row.id, product_row.name,
      case when item_variant_id is null then null else variant_row.name end,
      unit_total, item_quantity, addon_snapshots, line_total
    );
  end loop;

  update public.orders set subtotal = order_total, total = order_total where id = order_id_value;
  return query select order_id_value, order_number_value, order_total;
end;
$$;

revoke all on function public.create_customer_order(text, text, text, double precision, double precision, text, jsonb) from public;
grant execute on function public.create_customer_order(text, text, text, double precision, double precision, text, jsonb) to anon, authenticated;

drop policy if exists public_create_orders on public.orders;
drop policy if exists public_create_order_items on public.order_items;

-- Keep order history private and admin-controlled.
-- Existing admin select/update policies remain unchanged.
