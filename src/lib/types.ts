export type SizeName = 'Small' | 'Medium' | 'Large'
export type PaymentMethod = 'UPI' | 'COD'
export type OrderStatus = 'New' | 'Accepted' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
export type PaymentStatus = 'pending' | 'verification_pending' | 'paid_manual' | 'cash_on_delivery'

export type Category = { id: string; name: string; slug: string; display_order: number; is_active: boolean }
export type Variant = { id: string; product_id: string; name: string; price: number | null; display_order: number; is_available: boolean }
export type AddonPrice = { id: string; addon_id: string; variant_name: string; price: number | null }
export type Addon = { id: string; name: string; description: string | null; is_active: boolean; addon_prices?: AddonPrice[] }
export type Product = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  base_price: number | null
  has_variants: boolean
  is_available: boolean
  is_active: boolean
  is_featured: boolean
  is_special: boolean
  display_order: number
  category?: Category
  product_variants?: Variant[]
  product_addons?: { addon_id: string; addons?: Addon }[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name_snapshot: string
  variant_name: string | null
  unit_price: number | null
  quantity: number
  addons_snapshot: { name: string; price: number }[]
  line_total: number
}

export type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  delivery_address: string | null
  latitude: number | null
  longitude: number | null
  maps_url: string | null
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  subtotal: number
  total: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}