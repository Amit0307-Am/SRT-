import { supabase } from './supabase'
import type { Addon, Category, Order, Product } from './types'

export async function getAdminMembership(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

export async function isCurrentUserAdmin(userId: string) {
  const { data, error } = await getAdminMembership(userId)
  if (error) throw error
  return Boolean(data)
}

export async function fetchOrders() {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Order[]
}

export async function fetchAdminMenu() {
  const [categories, products, variants, addons, addonPrices, relations] = await Promise.all([
    supabase.from('categories').select('*').order('display_order'),
    supabase.from('products').select('*').order('display_order'),
    supabase.from('product_variants').select('*').order('display_order'),
    supabase.from('addons').select('*').order('name'),
    supabase.from('addon_prices').select('*'),
    supabase.from('product_addons').select('*'),
  ])
  const error = categories.error || products.error || variants.error || addons.error || addonPrices.error || relations.error
  if (error) throw error
  return {
    categories: (categories.data ?? []) as Category[],
    products: (products.data ?? []) as Product[],
    variants: variants.data ?? [],
    addons: (addons.data ?? []) as Addon[],
    addonPrices: addonPrices.data ?? [],
    relations: relations.data ?? [],
  }
}