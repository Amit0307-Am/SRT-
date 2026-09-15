import { supabase } from './supabase'
import type { Addon, Category, Product } from './types'

export type MenuData = { categories: Category[]; products: Product[]; addons: Addon[] }

export async function fetchMenu(): Promise<MenuData> {
  const [categoryResult, productResult, variantResult, addonResult, addonPriceResult, relationResult] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
    supabase.from('products').select('*').eq('is_active', true).order('display_order'),
    supabase.from('product_variants').select('*').eq('is_available', true).order('display_order'),
    supabase.from('addons').select('*').eq('is_active', true).order('name'),
    supabase.from('addon_prices').select('*'),
    supabase.from('product_addons').select('product_id, addon_id'),
  ])

  const error = categoryResult.error || productResult.error || variantResult.error || addonResult.error || addonPriceResult.error || relationResult.error
  if (error) throw error

  const categories = (categoryResult.data ?? []) as Category[]
  const variants = (variantResult.data ?? []) as Product['product_variants']
  const addons = (addonResult.data ?? []).map((addon) => ({
    ...(addon as Addon),
    addon_prices: (addonPriceResult.data ?? []).filter((price) => price.addon_id === addon.id),
  }))
  const products = (productResult.data ?? []).map((product) => ({
    ...(product as Product),
    category: categories.find((category) => category.id === product.category_id),
    product_variants: variants?.filter((variant) => variant.product_id === product.id) ?? [],
    product_addons: (relationResult.data ?? [])
      .filter((relation) => relation.product_id === product.id)
      .map((relation) => ({ addon_id: relation.addon_id, addons: addons.find((addon) => addon.id === relation.addon_id) })),
  }))

  return { categories, products, addons }
}