create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  base_price numeric(10,2),
  has_variants boolean not null default false,
  is_available boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_special boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price numeric(10,2),
  display_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name)
);

create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addon_prices (
  id uuid primary key default gen_random_uuid(),
  addon_id uuid not null references public.addons(id) on delete cascade,
  variant_name text not null,
  price numeric(10,2),
  unique (addon_id, variant_name)
);

create table if not exists public.product_addons (
  product_id uuid not null references public.products(id) on delete cascade,
  addon_id uuid not null references public.addons(id) on delete cascade,
  primary key (product_id, addon_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  latitude double precision,
  longitude double precision,
  maps_url text,
  payment_method text not null check (payment_method in ('UPI', 'COD')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'verification_pending', 'paid_manual', 'cash_on_delivery')),
  order_status text not null default 'New' check (order_status in ('New', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled')),
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  variant_name text,
  unit_price numeric(10,2),
  quantity integer not null check (quantity > 0),
  addons_snapshot jsonb not null default '[]'::jsonb,
  line_total numeric(10,2) not null default 0
);

create index if not exists products_category_idx on public.products(category_id, is_active, is_available);
create index if not exists variants_product_idx on public.product_variants(product_id);
create index if not exists product_addons_product_idx on public.product_addons(product_id);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists variants_updated_at on public.product_variants;
create trigger variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
drop trigger if exists addons_updated_at on public.addons;
create trigger addons_updated_at before update on public.addons for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.addons enable row level security;
alter table public.addon_prices enable row level security;
alter table public.product_addons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists admin_users_self on public.admin_users;
create policy admin_users_self on public.admin_users for select to authenticated using (user_id = auth.uid());

drop policy if exists public_read_categories on public.categories;
create policy public_read_categories on public.categories for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists admin_manage_categories on public.categories;
create policy admin_manage_categories on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_read_products on public.products;
create policy public_read_products on public.products for select to anon, authenticated using ((is_active = true and is_available = true) or public.is_admin());
drop policy if exists admin_manage_products on public.products;
create policy admin_manage_products on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_read_variants on public.product_variants;
create policy public_read_variants on public.product_variants for select to anon, authenticated using (is_available = true or public.is_admin());
drop policy if exists admin_manage_variants on public.product_variants;
create policy admin_manage_variants on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_read_addons on public.addons;
create policy public_read_addons on public.addons for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists admin_manage_addons on public.addons;
create policy admin_manage_addons on public.addons for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_read_addon_prices on public.addon_prices;
create policy public_read_addon_prices on public.addon_prices for select to anon, authenticated using (exists (select 1 from public.addons a where a.id = addon_id and (a.is_active = true or public.is_admin())));
drop policy if exists admin_manage_addon_prices on public.addon_prices;
create policy admin_manage_addon_prices on public.addon_prices for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_read_product_addons on public.product_addons;
create policy public_read_product_addons on public.product_addons for select to anon, authenticated using (true);
drop policy if exists admin_manage_product_addons on public.product_addons;
create policy admin_manage_product_addons on public.product_addons for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_create_orders on public.orders;
create policy public_create_orders on public.orders for insert to anon, authenticated with check (true);
drop policy if exists admin_read_orders on public.orders;
create policy admin_read_orders on public.orders for select to authenticated using (public.is_admin());
drop policy if exists admin_update_orders on public.orders;
create policy admin_update_orders on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_create_order_items on public.order_items;
create policy public_create_order_items on public.order_items for insert to anon, authenticated with check (true);
drop policy if exists admin_read_order_items on public.order_items;
create policy admin_read_order_items on public.order_items for select to authenticated using (public.is_admin());

insert into public.categories (name, slug, display_order)
values
  ('Pizza', 'pizza', 1), ('Burger', 'burger', 2), ('Sandwich', 'sandwich', 3),
  ('Rolls', 'rolls', 4), ('Fries', 'fries', 5), ('Drinks', 'drinks', 6), ('Other', 'other', 7)
on conflict (slug) do nothing;

insert into public.addons (name, description)
values ('Extra Cheese', 'Creamy extra cheese'), ('Cheese Burst', 'Cheese-filled crust')
on conflict (name) do nothing;

with addon_rows as (
  select id, name from public.addons where name in ('Extra Cheese', 'Cheese Burst')
)
insert into public.addon_prices (addon_id, variant_name, price)
select id, variant_name, price
from addon_rows
cross join (values
  ('Extra Cheese', 'Small', 20::numeric), ('Extra Cheese', 'Medium', 40::numeric), ('Extra Cheese', 'Large', 60::numeric),
  ('Cheese Burst', 'Small', 50::numeric), ('Cheese Burst', 'Medium', 70::numeric), ('Cheese Burst', 'Large', 100::numeric)
) prices(addon_name, variant_name, price)
where addon_rows.name = prices.addon_name
on conflict (addon_id, variant_name) do update set price = excluded.price;

insert into public.products (category_id, name, slug, description, has_variants, is_featured, is_special, display_order)
select c.id, p.name, p.slug, p.description, p.has_variants, p.is_featured, p.is_special, p.display_order
from (values
  ('Pizza', 'Paneer Tikka Pizza', 'paneer-tikka-pizza', null::text, true, true, false, 1),
  ('Pizza', 'SRT Special Pizza', 'srt-special-pizza', null::text, true, false, true, 2),
  ('Pizza', 'Onion Pizza', 'onion-pizza', null::text, true, false, false, 3),
  ('Burger', 'Cheese Burger', 'cheese-burger', 'Ask on WhatsApp', false, true, false, 4),
  ('Sandwich', 'SRT Sandwich', 'srt-sandwich', 'Ask on WhatsApp', false, false, true, 5),
  ('Drinks', 'Cold Coffee', 'cold-coffee', 'Ask on WhatsApp', false, false, false, 6),
  ('Drinks', 'Mocktail', 'mocktail', 'Ask on WhatsApp', false, false, false, 7),
  ('Drinks', 'Tea', 'tea', 'Ask on WhatsApp', false, false, false, 8),
  ('Other', 'Bhel', 'bhel', 'Ask on WhatsApp', false, false, false, 9),
  ('Other', 'Momos', 'momos', 'Ask on WhatsApp', false, false, false, 10)
) p(category_name, name, slug, description, has_variants, is_featured, is_special, display_order)
join public.categories c on c.name = p.category_name
on conflict (slug) do nothing;

with prices(slug, variant_name, price) as (values
  ('paneer-tikka-pizza', 'Small', 160::numeric), ('paneer-tikka-pizza', 'Medium', 210::numeric), ('paneer-tikka-pizza', 'Large', 260::numeric),
  ('srt-special-pizza', 'Small', 300::numeric), ('srt-special-pizza', 'Medium', 400::numeric), ('srt-special-pizza', 'Large', 500::numeric),
  ('onion-pizza', 'Small', 99::numeric), ('onion-pizza', 'Medium', 149::numeric), ('onion-pizza', 'Large', 199::numeric)
)
insert into public.product_variants (product_id, name, price, display_order)
select p.id, prices.variant_name, prices.price, row_number() over (partition by prices.slug order by prices.variant_name)
from prices join public.products p on p.slug = prices.slug
on conflict (product_id, name) do update set price = excluded.price;

insert into public.product_addons (product_id, addon_id)
select p.id, a.id from public.products p cross join public.addons a
where p.category_id = (select id from public.categories where slug = 'pizza')
  and a.name in ('Extra Cheese', 'Cheese Burst')
on conflict do nothing;