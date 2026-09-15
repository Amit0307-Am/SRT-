import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Addon } from '../lib/types'
import type { fetchAdminMenu } from '../lib/admin'

type Props = { data: Awaited<ReturnType<typeof fetchAdminMenu>> | null; refresh: () => void }

export default function AddonManagement({ data, refresh }: Props) {
  const [editing, setEditing] = useState<Addon | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  if (!data) return <div className="state-panel">Loading add-ons…</div>

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    if (!name) { setError('Add-on name is required.'); return }
    const payload = { name, description: String(form.get('description') ?? '').trim() || null, is_active: form.get('is_active') === 'on' }
    const result = editing ? await supabase.from('addons').update(payload).eq('id', editing.id).select().single() : await supabase.from('addons').insert(payload).select().single()
    if (result.error || !result.data) { setError(result.error?.message ?? 'Add-on could not be saved.'); return }
    const addonId = result.data.id
    const prices = ['Small', 'Medium', 'Large'].map((variantName) => ({ addon_id: addonId, variant_name: variantName, price: form.get(`price_${variantName}`) ? Number(form.get(`price_${variantName}`)) : null }))
    await supabase.from('addon_prices').delete().eq('addon_id', addonId)
    const { error: priceError } = await supabase.from('addon_prices').insert(prices)
    if (priceError) { setError(priceError.message); return }
    setEditing(null); setShowAdd(false); setError(''); setSuccess(editing ? 'Add-on updated.' : 'Add-on created.'); refresh()
  }

  return <>
    <div className="admin-toolbar"><button className="primary-btn" onClick={() => { setEditing(null); setShowAdd(true); setError('') }}>Add Add-on</button></div>
    {success && <div className="state-panel">{success}</div>}{error && <div className="state-panel error-state">{error}</div>}
    {(editing || showAdd) && <form className="edit-panel" onSubmit={save}><h2>{editing ? 'Edit Add-on' : 'Add Add-on'}</h2><label>Name<input name="name" defaultValue={editing?.name ?? ''} required /></label><label>Description<textarea name="description" defaultValue={editing?.description ?? ''} /></label><div className="variant-editor">{['Small', 'Medium', 'Large'].map((variantName) => <label className="variant-editor-row" key={variantName}><strong>{variantName}</strong><input name={`price_${variantName}`} type="number" min="0" step="1" defaultValue={editing?.addon_prices?.find((price) => price.variant_name === variantName)?.price ?? data.addonPrices.find((price) => price.addon_id === editing?.id && price.variant_name === variantName)?.price ?? ''} placeholder="Price" /></label>)}</div><label><input name="is_active" type="checkbox" defaultChecked={editing?.is_active ?? true} /> Active</label><div className="form-actions"><button className="primary-btn">Save Add-on</button><button type="button" className="tertiary-btn" onClick={() => { setEditing(null); setShowAdd(false) }}>Cancel</button></div></form>}
    <div className="admin-table">{data.addons.map((addon) => <div className="admin-row" key={addon.id}><div><strong>{addon.name}</strong><span>{addon.is_active ? 'Active' : 'Inactive'}</span></div><div>{data.addonPrices.filter((price) => price.addon_id === addon.id).map((price) => <span className="price-chip" key={price.id}>{price.variant_name} {price.price == null ? 'Ask' : `₹${price.price}`}</span>)}</div><button className="tertiary-btn" onClick={() => { setEditing({ ...addon, addon_prices: data.addonPrices.filter((price) => price.addon_id === addon.id) }); setShowAdd(false); setError('') }}>Edit</button></div>)}</div>
  </>
}
