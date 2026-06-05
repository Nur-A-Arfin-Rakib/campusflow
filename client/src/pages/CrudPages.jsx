import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Card, Button, Modal, Input, Select, Spinner, EmptyState, Badge } from '../components/ui'

function useCRUD(endpoint, deps = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); api.get(endpoint).then(r => setData(r.data?.data || r.data)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, deps)
  return { data, loading, reload: load }
}

// ─── COURSES ────────────────────────────────────────────────────────────────
export function Courses() {
  const { data, loading, reload } = useCRUD('/courses')
  const { data: depts } = useCRUD('/departments')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ courseCode:'', courseTitle:'', theory:0, sessional:0, credit:0, department:'' })
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setEditing(null); setForm({ courseCode:'', courseTitle:'', theory:0, sessional:0, credit:0, department:'' }); setModal(true) }
  const openEdit = c => { setEditing(c._id); setForm({ courseCode:c.courseCode, courseTitle:c.courseTitle, theory:c.theory, sessional:c.sessional, credit:c.credit, department:c.department?._id||'' }); setModal(true) }
  const save = async () => {
    setSaving(true)
    try {
      editing ? await api.put(`/courses/${editing}`, form) : await api.post('/courses', form)
      toast.success(editing ? 'Updated!' : 'Course added!'); setModal(false); reload()
    } catch(e) { toast.error(e.response?.data?.message || 'Error') } finally { setSaving(false) }
  }
  const del = async id => { if(!confirm('Delete?')) return; await api.delete(`/courses/${id}`); toast.success('Deleted'); reload() }
  const F = (k,v) => setForm(p=>({...p,[k]:v}))

  if (loading) return <Spinner />
  return (
    <div className="space-y-5 fade-up">
      <div className="flex justify-end"><Button onClick={openAdd}>➕ Add Course</Button></div>
      <Card>
        {data.length === 0 ? <EmptyState message="No courses added" icon="📚" /> :
          <table className="w-full">
            <thead><tr className="bg-white/[0.03]">
              {['Code','Title','Theory','Sessional','Credit','Dept',''].map(h=>(
                <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
              ))}</tr></thead>
            <tbody>{data.map(c=>(
              <tr key={c._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-5 py-3"><Badge color="purple">{c.courseCode}</Badge></td>
                <td className="px-5 py-3 text-[13px] text-white">{c.courseTitle}</td>
                <td className="px-5 py-3 text-[12px] text-white/50">{c.theory}h</td>
                <td className="px-5 py-3 text-[12px] text-white/50">{c.sessional}h</td>
                <td className="px-5 py-3"><Badge color="teal">{c.credit} cr</Badge></td>
                <td className="px-5 py-3 text-[12px] text-white/50">{c.department?.shortName||'—'}</td>
                <td className="px-5 py-3"><div className="flex gap-1.5">
                  <button onClick={()=>openEdit(c)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-center hover:bg-white/10">✏</button>
                  <button onClick={()=>del(c._id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-center hover:bg-red-500/20">🗑</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Course':'Add Course'}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Course Code *" value={form.courseCode} onChange={e=>F('courseCode',e.target.value)} placeholder="CSE2205" />
          <Input label="Course Title *" value={form.courseTitle} onChange={e=>F('courseTitle',e.target.value)} placeholder="Database Management" />
          <Input label="Theory Hours" type="number" value={form.theory} onChange={e=>F('theory',+e.target.value)} />
          <Input label="Sessional Hours" type="number" value={form.sessional} onChange={e=>F('sessional',+e.target.value)} />
          <Input label="Credit *" type="number" step="0.25" value={form.credit} onChange={e=>F('credit',+e.target.value)} />
          <Select label="Department *" value={form.department} onChange={e=>F('department',e.target.value)}>
            <option value="">Select</option>
            {depts.map(d=><option key={d._id} value={d._id}>{d.shortName}</option>)}
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.07]">
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving?'Saving...':editing?'Update':'Add Course'}</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── ROOMS ──────────────────────────────────────────────────────────────────
export function Rooms() {
  const { data, loading, reload } = useCRUD('/rooms')
  const { data: depts } = useCRUD('/departments')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ roomNo:'', building:'', capacity:40, department:'' })
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setEditing(null); setForm({ roomNo:'', building:'', capacity:40, department:'' }); setModal(true) }
  const openEdit = r => { setEditing(r._id); setForm({ roomNo:r.roomNo, building:r.building||'', capacity:r.capacity, department:r.department?._id||'' }); setModal(true) }
  const save = async () => {
    setSaving(true)
    try {
      editing ? await api.put(`/rooms/${editing}`, form) : await api.post('/rooms', form)
      toast.success(editing?'Updated!':'Room added!'); setModal(false); reload()
    } catch(e) { toast.error(e.response?.data?.message||'Error') } finally { setSaving(false) }
  }
  const del = async id => { if(!confirm('Delete?'))return; await api.delete(`/rooms/${id}`); toast.success('Deleted'); reload() }
  const F = (k,v) => setForm(p=>({...p,[k]:v}))

  if (loading) return <Spinner />
  return (
    <div className="space-y-5 fade-up">
      <div className="flex justify-end"><Button onClick={openAdd}>➕ Add Room</Button></div>
      <Card>
        {data.length===0?<EmptyState message="No rooms added" icon="🚪"/>:
          <table className="w-full">
            <thead><tr className="bg-white/[0.03]">
              {['Room No','Building','Capacity','Department',''].map(h=>(
                <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
              ))}</tr></thead>
            <tbody>{data.map(r=>(
              <tr key={r._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-5 py-3"><Badge color="purple">🚪 {r.roomNo}</Badge></td>
                <td className="px-5 py-3 text-[13px] text-white/60">{r.building||'—'}</td>
                <td className="px-5 py-3 text-[13px] text-white/60">{r.capacity}</td>
                <td className="px-5 py-3 text-[12px] text-white/50">{r.department?.shortName||'—'}</td>
                <td className="px-5 py-3"><div className="flex gap-1.5">
                  <button onClick={()=>openEdit(r)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-center hover:bg-white/10">✏</button>
                  <button onClick={()=>del(r._id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-center hover:bg-red-500/20">🗑</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Room':'Add Room'}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Room No *" value={form.roomNo} onChange={e=>F('roomNo',e.target.value)} placeholder="309" />
          <Input label="Building" value={form.building} onChange={e=>F('building',e.target.value)} placeholder="Main Building" />
          <Input label="Capacity" type="number" value={form.capacity} onChange={e=>F('capacity',+e.target.value)} />
          <Select label="Department" value={form.department} onChange={e=>F('department',e.target.value)}>
            <option value="">None</option>
            {depts.map(d=><option key={d._id} value={d._id}>{d.shortName}</option>)}
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.07]">
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving?'Saving...':editing?'Update':'Add Room'}</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export function Departments() {
  const { data, loading, reload } = useCRUD('/departments')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', shortName:'' })
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setEditing(null); setForm({ name:'', shortName:'' }); setModal(true) }
  const openEdit = d => { setEditing(d._id); setForm({ name:d.name, shortName:d.shortName }); setModal(true) }
  const save = async () => {
    setSaving(true)
    try {
      editing ? await api.put(`/departments/${editing}`,form) : await api.post('/departments',form)
      toast.success(editing?'Updated!':'Department added!'); setModal(false); reload()
    } catch(e) { toast.error('Error') } finally { setSaving(false) }
  }
  const del = async id => { if(!confirm('Delete?'))return; await api.delete(`/departments/${id}`); toast.success('Deleted'); reload() }

  if (loading) return <Spinner />
  return (
    <div className="space-y-5 fade-up">
      <div className="flex justify-end"><Button onClick={openAdd}>➕ Add Department</Button></div>
      <Card>
        {data.length===0?<EmptyState message="No departments added" icon="🏛"/>:
          <table className="w-full">
            <thead><tr className="bg-white/[0.03]">
              {['Short Name','Full Name',''].map(h=>(
                <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
              ))}</tr></thead>
            <tbody>{data.map(d=>(
              <tr key={d._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-5 py-3"><Badge color="teal">{d.shortName}</Badge></td>
                <td className="px-5 py-3 text-[13px] text-white">{d.name}</td>
                <td className="px-5 py-3"><div className="flex gap-1.5">
                  <button onClick={()=>openEdit(d)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-center hover:bg-white/10">✏</button>
                  <button onClick={()=>del(d._id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-center hover:bg-red-500/20">🗑</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Department':'Add Department'}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Short Name *" value={form.shortName} onChange={e=>setForm(p=>({...p,shortName:e.target.value}))} placeholder="CSE" />
          <Input label="Full Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Computer Science & Engineering" />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.07]">
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving?'Saving...':editing?'Update':'Add'}</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── SEMESTERS ───────────────────────────────────────────────────────────────
export function Semesters() {
  const { data, loading, reload } = useCRUD('/semesters')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', year:2026, term:'Summer', isActive:false })
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setEditing(null); setForm({ name:'', year:2026, term:'Summer', isActive:false }); setModal(true) }
  const openEdit = s => { setEditing(s._id); setForm({ name:s.name, year:s.year, term:s.term, isActive:s.isActive }); setModal(true) }
  const save = async () => {
    setSaving(true)
    const payload = { ...form, name: form.name || `${form.term} ${form.year}` }
    try {
      editing ? await api.put(`/semesters/${editing}`,payload) : await api.post('/semesters',payload)
      toast.success(editing?'Updated!':'Semester added!'); setModal(false); reload()
    } catch(e) { toast.error('Error') } finally { setSaving(false) }
  }
  const del = async id => { if(!confirm('Delete?'))return; await api.delete(`/semesters/${id}`); toast.success('Deleted'); reload() }
  const F = (k,v) => setForm(p=>({...p,[k]:v}))

  if (loading) return <Spinner />
  return (
    <div className="space-y-5 fade-up">
      <div className="flex justify-end"><Button onClick={openAdd}>➕ Add Semester</Button></div>
      <Card>
        {data.length===0?<EmptyState message="No semesters added" icon="📆"/>:
          <table className="w-full">
            <thead><tr className="bg-white/[0.03]">
              {['Name','Term','Year','Status',''].map(h=>(
                <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
              ))}</tr></thead>
            <tbody>{data.map(s=>(
              <tr key={s._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-[13px] text-white font-medium">{s.name}</td>
                <td className="px-5 py-3"><Badge color="blue">{s.term}</Badge></td>
                <td className="px-5 py-3 text-[13px] text-white/60">{s.year}</td>
                <td className="px-5 py-3">{s.isActive?<Badge color="green">Active</Badge>:<span className="text-[11px] text-white/25">Archived</span>}</td>
                <td className="px-5 py-3"><div className="flex gap-1.5">
                  <button onClick={()=>openEdit(s)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-center hover:bg-white/10">✏</button>
                  <button onClick={()=>del(s._id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-center hover:bg-red-500/20">🗑</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Semester':'Add Semester'}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Name (optional)" value={form.name} onChange={e=>F('name',e.target.value)} placeholder="Summer 2026" />
          <Select label="Term *" value={form.term} onChange={e=>F('term',e.target.value)}>
            {['Spring','Summer','Fall'].map(t=><option key={t}>{t}</option>)}
          </Select>
          <Input label="Year *" type="number" value={form.year} onChange={e=>F('year',+e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/30 uppercase tracking-wider">Active?</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e=>F('isActive',e.target.checked)} className="w-4 h-4 accent-[#6c63ff]" />
              <span className="text-[13px] text-white/60">Mark as active semester</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.07]">
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving?'Saving...':editing?'Update':'Add'}</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export function Users() {
  const { data, loading, reload } = useCRUD('/users')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = data.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const openRoleEdit = u => { setEditingUser(u); setNewRole(u.role) }

  const saveRole = async () => {
    if (!editingUser || newRole === editingUser.role) { setEditingUser(null); return }
    setSaving(true)
    try {
      await api.put(`/users/${editingUser._id}`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      setEditingUser(null)
      reload()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive })
      toast.success(u.isActive ? 'User deactivated' : 'User activated')
      reload()
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  const del = async id => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted')
      reload()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete')
    }
  }

  const roleCounts = data.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})

  if (loading) return <Spinner />

  return (
    <div className="space-y-5 fade-up">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', count: data.length, color: 'purple' },
          { label: 'Admins', count: roleCounts.admin || 0, color: 'teal' },
          { label: 'Students', count: roleCounts.student || 0, color: 'blue' },
        ].map(s => (
          <Card key={s.label} className="text-center py-4">
            <div className="text-2xl font-bold text-white">{s.count}</div>
            <div className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-40">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </Select>
      </div>

      <Card>
        {filtered.length === 0
          ? <EmptyState message={search ? 'No users match your search' : 'No users found'} icon="👥" />
          : (
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.03]">
                  {['User', 'Email', 'Role', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className={`border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#f472b6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-[13px] text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-white/50">{u.email}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => openRoleEdit(u)} title="Click to change role" className="cursor-pointer">
                        <Badge color={u.role === 'admin' ? 'purple' : u.role === 'teacher' ? 'teal' : 'blue'}>
                          {u.role} ✏
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(u)} title={u.isActive ? 'Click to deactivate' : 'Click to activate'}>
                        {u.isActive
                          ? <Badge color="green">Active</Badge>
                          : <span className="text-[11px] text-white/25 border border-white/10 rounded-full px-2 py-0.5">Inactive</span>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-white/30">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => del(u._id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-center hover:bg-red-500/20"
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Change User Role">
        {editingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#f472b6] flex items-center justify-center text-white text-sm font-bold">
                {editingUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-[13px] text-white font-medium">{editingUser.name}</div>
                <div className="text-[11px] text-white/40">{editingUser.email}</div>
              </div>
            </div>
            <Select label="New Role" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </Select>
            <p className="text-[11px] text-white/30">
              ⚠ Admin role gives full system access. Only assign to trusted users.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.07]">
              <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={saveRole} disabled={saving || newRole === editingUser.role}>
                {saving ? 'Saving...' : 'Update Role'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Courses
