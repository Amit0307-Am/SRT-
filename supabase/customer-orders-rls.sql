-- Apply this patch if the live project rejects anonymous customer order creation.
-- It preserves admin-only reads/updates and does not expose customer order history.

drop policy if exists public_create_orders on public.orders;
create policy public_create_orders
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists public_create_order_items on public.order_items;
create policy public_create_order_items
on public.order_items
for insert
to anon, authenticated
with check (true);

-- Customer checkout uses the existing schema-compatible COD value to mean
-- Pay on Delivery — Cash or UPI. Payment remains pending until admin confirms it.
