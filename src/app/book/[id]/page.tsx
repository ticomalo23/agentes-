'use client'
import { useState } from 'react'

export default function BookPage({ params }: { params: { id: string } }){
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [form, setForm] = useState({ name:'', email:'', phone:'', startDate:'', endDate:'', message:'' })

  const submit = async () => {
    setBusy(true); setErr(null); setOk(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ ...form, carId: Number(params.id) })
      })
      if (!res.ok) throw new Error(await res.text())
      setOk('Request received! We will contact you soon.')
      setForm({ name:'', email:'', phone:'', startDate:'', endDate:'', message:'' })
    } catch(e:any){ setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Booking request</h1>
      {ok && <div className="text-green-600 text-sm">{ok}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <div>
        <label className="label">Full name</label>
        <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="label">Email</label>
          <input className="input" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone || ''} onChange={e=>setForm({...form, phone:e.target.value})} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} />
        </div>
        <div>
          <label className="label">End date</label>
          <input type="date" className="input" value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} />
        </div>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input" rows={4} value={form.message} onChange={e=>setForm({...form, message:e.target.value})} />
      </div>
      <button className="btn" onClick={submit} disabled={busy}>{busy ? 'Sending...' : 'Send request'}</button>
    </div>
  )
}
