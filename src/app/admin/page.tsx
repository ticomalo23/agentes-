'use client'
import useSWR from 'swr'
import CarForm from '@/components/CarForm'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminPage(){
  const [password, setPassword] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const { data, mutate } = useSWR('/api/cars', fetcher)

  const remove = async (id:number) => {
    if (!password){
      alert('Enter the admin password first.')
      return
    }
    if (!confirm('Delete car?')) return
    const res = await fetch(`/api/cars/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password }})
    if (res.ok) mutate()
    else alert(await res.text())
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin — Car Inventory</h1>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input className="input max-w-xs" type="password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} />
        <span className="text-xs text-neutral-500">Password must match the `ADMIN_PASSWORD` env variable.</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-semibold mb-3">{selected ? 'Edit car' : 'Add new car'}</h2>
          <CarForm initial={selected || undefined} onSaved={()=>{ setSelected(null); mutate(); }} adminPassword={password} />
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Your cars</h2>
          <div className="space-y-2">
            {(data?.cars || []).map((c:any)=> (
              <div key={c.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <div className="font-medium">{c.year} {c.make} {c.model}</div>
                  <div className="text-sm text-neutral-500">${c.dailyPrice}/day • {c.city}, {c.state}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn" onClick={()=>setSelected(c)}>Edit</button>
                  <button className="btn bg-red-600 hover:bg-red-700 disabled:opacity-50" disabled={!password} onClick={()=>remove(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
