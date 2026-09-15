import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, Variant } from '../lib/types'
import type { fetchAdminMenu } from '../lib/admin'

export type AdminMenuData = Awaited<ReturnType<typeof fetchAdminMenu>>

type Props = { data: AdminMenuData | null; refresh: () => void }
type VariantDraft = { name: string; price: string; is_available: boolean }

const emptyVariants = (): VariantDraft[] => [
  { name: 'Small', price: '', is_available: true },
  { name: 'Medium', price: '', is_available: true },
  { name: 'Large', price: '', is_available: true },
]

function variantsFromProduct(_product: Product, variants: Variant[]): VariantDraft[] {
  return variants.length ? variants.map((variant) => ({ name: variant.name, price: variant.price == null ? '' : String(variant.price), is_available: variant.is_available })) : emptyVariants()
}

export default function MenuManagement({ data, refresh }: Props) {
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  if (!data) return <div className="state-panel">Loading menuâ€¦</div>

  const visibleProducts = data.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchesCategory = category === 'All' || data.categories.find((item) => item.id === product.category_id)?.name === category
    return matchesSearch && matchesCategory
  })

  const archive = async (product: Product) => {
    if (!window.confirm(`Remove ${product.name} from the menu?`)) return
    const { error: updateError } = await supabase.from('products').update({ is_active: false }).eq('id', product.id)
    if (updateError) setError(updateError.message)
    else { setSuccess('Product removed from menu.'); refresh() }
  }

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const categoryId = String(form.get('category_id') ?? '')
    if (!name || !categoryId) { setError('Product name and category are required.'); return }
    const hasVariants = form.get('has_variants') === 'on'
    const product = {
      name,
      slug: String(form.get('slug') || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category_id: categoryId,
      description: String(form.get('description') ?? '').trim() || null,
      base_price: form.get('base_price') ? Number(form.get('base_price')) : null,
      has_variants: hasVariants,
      is_available: form.get('is_available') === 'on',
      is_featured: form.get('is_featured') === 'on',
      is_special: form.get('is_special') === 'on',
      is_active: true,
    }
    const { data: saved, error: productError } = editing
      ? await supabase.from('products').update(product).eq('id', editing.id).select().single()
      : await supabase.from('products').insert(product).select().single()
    if (productError || !saved) { setError(productError?.message ?? 'Product could not be saved.'); return }

    const variants = hasVariants ? ['Small', 'Medium', 'Large'].map((name) => ({ name, price: form.get(`variant_${name}`) ? Number(form.get(`variant_${name}`)) : null, is_available: form.get(`variant_available_${name}`) === 'on' })) : []
    if (editing) await supabase.from('product_variants').delete().eq('product_id', editing.id)
    if (variants.length) {
      const { error: variantError } = await supabase.from('product_variants').insert(variants.map((variant, index) => ({ ...variant, product_id: saved.id, display_order: index + 1 })))
      if (variantError) { setError(variantError.message); return }
    }
    setEditing(null); setShowAdd(false); setSuccess(editing ? 'Product updated.' : 'Product added.'); setError(''); refresh()
  }

  return <>
    <div className="admin-toolbar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{data.categories.map((item) => <option key={item.id}>{item.name}</option>)}</select><button className="primary-btn" onClick={() => { setEditing(null); setShowAdd(true); setError('') }}>Add Product</button></div>
    {success && <div className="state-panel">{success}</div>}{error && <div className="state-panel error-state">{error}</div>}
    {(editing || showAdd) && <ProductForm product={editing} data={data} variants={editing ? variantsFromProduct(editing, data.variants.filter((item) => item.product_id === editing.id)) : emptyVariants()} onCancel={() => { setEditing(null); setShowAdd(false) }} onSave={saveProduct} />}
    <div className="admin-table">{visibleProducts.map((product) => <div className="admin-row" key={product.id}><div><strong>{product.name}</strong><span>{data.categories.find((item) => item.id === product.category_id)?.name} Â· {product.is_available ? 'Available' : 'Out of Stock'}</span></div><div>{data.variants.filter((item) => item.product_id === product.id).map((item) => <span className="price-chip" key={item.id}>{item.name} {item.price == null ? 'Ask' : `â‚¹${item.price}`}</span>)}</div><button className="tertiary-btn" onClick={() => { setEditing(product); setShowAdd(false); setError('') }}>Edit</button><button className="secondary-btn" onClick={() => archive(product)}>Remove from Menu</button></div>)}</div>
  </>
}

function ProductForm({ product, data, variants, onCancel, onSave }: { product: Product | null; data: AdminMenuData; variants: VariantDraft[]; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="edit-panel" onSubmit={onSave}><h2>{product ? 'Edit Product' : 'Add Product'}</h2><label>Name<input name="name" defaultValue={product?.name ?? ''} required /></label><label>Slug<input name="slug" defaultValue={product?.slug ?? ''} /></label><label>Category<select name="category_id" defaultValue={product?.category_id ?? data.categories[0]?.id}>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Description<textarea name="description" defaultValue={product?.description ?? ''} /></label><label>Base Price<input name="base_price" type="number" min="0" step="1" defaultValue={product?.base_price ?? ''} /></label><label><input name="has_variants" type="checkbox" defaultChecked={product?.has_variants} /> Has size variants</label><div className="variant-editor">{variants.map((variant) => <div className="variant-editor-row" key={variant.name}><strong>{variant.name}</strong><input name={`variant_${variant.name}`} type="number" min="0" step="1" placeholder="Price" defaultValue={variant.price} /><label><input name={`variant_available_${variant.name}`} type="checkbox" defaultChecked={variant.is_available} /> Available</label></div>)}</div><label><input name="is_available" type="checkbox" defaultChecked={product?.is_available ?? true} /> Available</label><label><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured} /> Featured</label><label><input name="is_special" type="checkbox" defaultChecked={product?.is_special} /> SRT Special</label><div className="form-actions"><button className="primary-btn">Save Product</button><button type="button" className="tertiary-btn" onClick={onCancel}>Cancel</button></div></form>
}

