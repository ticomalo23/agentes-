'use client'
import { useEffect, useState } from 'react'
import type { Car } from '@prisma/client'

const empty = {
  make: '', model: '', year: 2020, trim: '', dailyPrice: 50,
  city: '', state: 'AR', mileage: 0, transmission: 'Automatic', fuel: 'Gas',
  seats: 5, doors: 4, imageUrl: '', images: [] as string[], description: '', features: [] as string[], available: true
}

type Props = {
  initial?: Partial<Car>
  onSaved: () => void
  adminPassword: string
}

export default function CarForm({ initial, onSaved, adminPassword }: Props){
  const [form, setForm] = useState<any>({ ...empty, ...initial })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm({ ...empty, ...initial })
  }, [initial])

  const save = async () => {
    if (!adminPassword){
      setError('Enter the admin password above to save changes.')
      return
    }
    setBusy(true); setError(null)
    try {
      const isEdit = Boolean(initial && (initial as any).id)
      const url = isEdit ? `/api/cars/${(initial as any).id}` : '/api/cars'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          dailyPrice: Number(form.dailyPrice),
          mileage: Number(form.mileage),
          seats: Number(form.seats),
          doors: Number(form.doors)
        })
      })
      if (!res.ok) throw new Error(await res.text())
      onSaved()
    } catch (e: any) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="label">Make</label>
        <input className="input" value={form.make} onChange={e=>setForm({...form, make:e.target.value})}/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="label">Model</label>
          <input className="input" value={form.model} onChange={e=>setForm({...form, model:e.target.value})}/>
        </div>
        <div>
          <label className="label">Year</label>
          <input type="number" className="input" value={form.year} onChange={e=>setForm({...form, year:e.target.value})}/>
        </div>
        <div>
          <label className="label">Trim</label>
          <input className="input" value={form.trim ?? ''} onChange={e=>setForm({...form, trim:e.target.value})}/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="label">Daily Price (USD)</label>
          <input type="number" className="input" value={form.dailyPrice} onChange={e=>setForm({...form, dailyPrice:e.target.value})}/>
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/>
        </div>
        <div>
          <label className="label">State (2 letters)</label>
          <input className="input" maxLength={2} value={form.state} onChange={e=>setForm({...form, state:e.target.value.toUpperCase()})}/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="label">Mileage</label>
          <input type="number" className="input" value={form.mileage} onChange={e=>setForm({...form, mileage:e.target.value})}/>
        </div>
        <div>
          <label className="label">Transmission</label>
          <select className="input" value={form.transmission} onChange={e=>setForm({...form, transmission:e.target.value})}>
            <option>Automatic</option>
            <option>Manual</option>
          </select>
        </div>
        <div>
          <label className="label">Fuel</label>
          <select className="input" value={form.fuel} onChange={e=>setForm({...form, fuel:e.target.value})}>
            <option>Gas</option>
            <option>Hybrid</option>
            <option>Electric</option>
            <option>Diesel</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="label">Seats</label>
          <input type="number" className="input" value={form.seats} onChange={e=>setForm({...form, seats:e.target.value})}/>
        </div>
        <div>
          <label className="label">Doors</label>
          <input type="number" className="input" value={form.doors} onChange={e=>setForm({...form, doors:e.target.value})}/>
        </div>
        <div className="md:col-span-2">
          <label className="label">Main Image URL</label>
          <input className="input" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})}/>
        </div>
      </div>
      <div>
        <label className="label">Gallery (comma-separated URLs)</label>
        <input className="input" value={(form.images || []).join(',')} onChange={e=>setForm({...form, images:e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})}/>
      </div>
      <div>
        <label className="label">Features (comma-separated)</label>
        <input className="input" value={(form.features || []).join(',')} onChange={e=>setForm({...form, features:e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})}/>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={4} value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
      </div>
      <div className="flex items-center gap-2">
        <input id="available" type="checkbox" checked={form.available} onChange={e=>setForm({...form, available:e.target.checked})} />
        <label htmlFor="available" className="label">Available</label>
      </div>
      <button onClick={save} disabled={busy || !adminPassword} className="btn">{busy ? 'Saving...' : 'Save'}</button>
      {!adminPassword && <p className="text-xs text-neutral-500">Enter the admin password above to enable saving.</p>}
    </div>
  )
}
