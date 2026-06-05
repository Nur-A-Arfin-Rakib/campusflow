import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Card, Button, Modal, Input, Select, Spinner, EmptyState } from '../components/ui'

const empty = { shortName:'', fullName:'', designation:'', department:'', email:'' }

export default function Teachers() {
  const [data, setData] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/teachers'), api.get('/departments')])
      .then(([t, d]) => { setData(t.data); setDepartments(d.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = t => { setEditing(t._id); setForm({ shortName: t.shortName, fullName: t.fullName, designation: t.designation, department: t.department?._id || '', email: t.email || '' }); setModal(true) }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) await api.put(`/teachers/${editing}`, form)
      else await api.post('/teachers', form)
      toast.success(editing ? 'Updated!' : 'Teacher added!')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this teacher?')) return
    await api.delete(`/teachers/${id}`)
    toast.success('Deleted'); load()
  }

  const F = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <Spinner />
  return (
    <div className="space-y-5 fade-up">
      <div className="flex justify-end">
        <Button onClick={openAdd}>➕ Add Teacher</Button>
      </div>
      <Card>
        {data.length === 0 ? <EmptyState message="No teachers added" icon="👨‍🏫" /> :
          <table className="w-full">
            <thead><tr className="bg-white/[0.03]">
              {['Short','Full Name','Designation','Department','Email',''].map(h => (
                <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.map(t => (
                <tr key={t._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#2dd4bf] flex items-center justify-center text-white text-xs font-bold">
                      {t.shortName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-white font-medium">{t.fullName}</td>
                  <td className="px-5 py-3 text-[12px] text-white/50">{t.designation}</td>
                  <td className="px-5 py-3 text-[12px] text-white/50">{t.department?.shortName || '—'}</td>
                  <td className="px-5 py-3 text-[12px] text-white/50">{t.email || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(t)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10">✏</button>
                      <button onClick={() => del(t._id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs text-red-400 hover:bg-red-500/20">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Short Name *" value={form.shortName} onChange={e => F('shortName', e.target.value)} placeholder="ARR" />
          <Input label="Full Name *" value={form.fullName} onChange={e => F('fullName', e.target.value)} placeholder="John Doe" />
          <Input label="Designation *" value={form.designation} onChange={e => F('designation', e.target.value)} placeholder="Lecturer, CSE" />
          <Select label="Department *" value={form.department} onChange={e => F('department', e.target.value)}>
            <option value="">Select</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.shortName} — {d.name}</option>)}
          </Select>
          <Input label="Email" className="col-span-2" value={form.email} onChange={e => F('email', e.target.value)} placeholder="teacher@university.edu" />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.07]">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Teacher'}</Button>
        </div>
      </Modal>
    </div>
  )
}
