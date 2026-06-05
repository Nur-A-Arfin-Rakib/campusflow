import { useEffect, useState, useRef, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Card, Button, Badge, DayBadge, Modal, Input, Select, Spinner, EmptyState } from '../components/ui'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const emptyForm = { dayName:'Sunday', startTime:'09:00', endTime:'09:45', course:'', teacher:'', room:'', levelTerm:'1-1', section:'A', semester:'', department:'' }

export default function Routine() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const printRef = useRef()

  const [routine, setRoutine]       = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [conflicts, setConflicts]   = useState([])
  const [teachers, setTeachers]     = useState([])
  const [courses, setCourses]       = useState([])
  const [rooms, setRooms]           = useState([])
  const [semesters, setSemesters]   = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [filterDay, setFilterDay]   = useState('All')
  const [filterSem, setFilterSem]   = useState('')
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')

  const LIMIT = 15

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterSem) params.set('semester', filterSem)
    if (filterDay !== 'All') params.set('day', filterDay)
    if (search) params.set('search', search)
    params.set('page', page)
    params.set('limit', LIMIT)

    Promise.all([
      api.get(`/routine?${params}`),
      api.get('/teachers'),
      api.get('/courses'),
      api.get('/rooms'),
      api.get('/semesters'),
      api.get('/departments'),
      isAdmin ? api.get(`/routine/conflicts${filterSem ? `?semester=${filterSem}` : ''}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([r, t, c, rm, s, d, cf]) => {
      setRoutine(r.data.data || r.data)
      setTotal(r.data.total || 0)
      setTeachers(t.data.data || t.data)
      setCourses(c.data.data || c.data)
      setRooms(rm.data.data || rm.data)
      setSemesters(s.data)
      setDepartments(d.data)
      setConflicts(cf.data)
    }).finally(() => setLoading(false))
  }, [filterSem, filterDay, search, page, isAdmin])

  useEffect(() => { load() }, [load])

  const handleSearch = e => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = r => {
    setEditing(r._id)
    setForm({
      dayName: r.dayName, startTime: r.startTime, endTime: r.endTime,
      course: r.course?._id||'', teacher: r.teacher?._id||'',
      room: r.room?._id||'', levelTerm: r.levelTerm, section: r.section,
      semester: r.semester?._id||'', department: r.department?._id||'',
    })
    setModal(true)
  }

  const save = async () => {
    const required = ['course','teacher','room','semester','dayName','startTime','endTime','levelTerm','section']
    for (const f of required) {
      if (!form[f]) { toast.error(`Please fill: ${f}`); return }
    }
    if (form.startTime >= form.endTime) { toast.error('End time must be after start time'); return }
    setSaving(true)
    try {
      if (editing) await api.put(`/routine/${editing}`, form)
      else await api.post('/routine', form)
      toast.success(editing ? 'Class updated!' : 'Class added!')
      setModal(false); load()
    } catch (err) {
      const msg = err.response?.data?.conflicts?.join('\n') || err.response?.data?.message || 'Error'
      toast.error('⚡ ' + msg)
    } finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this class?')) return
    await api.delete(`/routine/${id}`)
    toast.success('Deleted'); load()
  }

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const conflictIds = new Set(conflicts.flatMap(c => [c.a._id, c.b._id]))
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5 fade-up">
      {/* Conflict Banner */}
      {conflicts.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 pulse-ring">
          <span className="animate-pulse text-red-400 text-lg">⚡</span>
          <p className="text-red-400 text-sm flex-1">
            <strong>{conflicts.length} conflict(s) detected</strong> — highlighted rows need attention
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-white/30 text-sm">🔍</span>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search course..."
            className="bg-transparent text-[13px] text-white placeholder-white/25 outline-none w-36" />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              className="text-white/30 hover:text-white text-xs">✕</button>
          )}
        </form>

        {/* Day filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All',...DAYS.slice(0,5)].map(d => (
            <button key={d} onClick={() => { setFilterDay(d); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterDay === d ? 'bg-[#6c63ff] text-white border-[#6c63ff]' : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
              }`}>
              {d === 'All' ? 'All' : d.slice(0,3)}
            </button>
          ))}
        </div>

        {/* Semester filter */}
        <select value={filterSem} onChange={e => { setFilterSem(e.target.value); setPage(1) }}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 outline-none">
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrint}>🖨 Print</Button>
          <Button variant="ghost" size="sm" onClick={() => window.open('/routine/public','_blank')}>🔗 Public</Button>
          {isAdmin && <Button size="sm" onClick={openAdd}>➕ Add Class</Button>}
        </div>
      </div>

      {/* Printable Table */}
      <div ref={printRef}>
        <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>
        <div className="print:p-4">
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold">CampusFlow — Class Routine</h1>
            <p className="text-gray-500 text-sm">{semesters.find(s=>s._id===filterSem)?.name || 'All Semesters'} | Printed: {new Date().toLocaleDateString()}</p>
          </div>

          <Card>
            {loading ? <Spinner /> : routine.length === 0
              ? <EmptyState message="No classes found" icon="📅" />
              : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03] print:bg-gray-100">
                      {['Day','Time','Course','Teacher','Room','Section','Level','Status',''].map((h,i) => (
                        <th key={h} className={`text-left text-[10px] text-white/25 print:text-gray-500 uppercase tracking-wider px-4 py-3 font-semibold ${i===8?'no-print':''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {routine.map(r => {
                      const hasConflict = conflictIds.has(r._id)
                      return (
                        <tr key={r._id}
                          className={`border-t border-white/[0.05] transition-colors ${hasConflict ? 'bg-red-500/5' : 'hover:bg-white/[0.02]'}`}>
                          <td className="px-4 py-3"><DayBadge day={r.dayName} /></td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-xs text-white/70 w-fit">
                              🕐 {r.startTime}–{r.endTime}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[13px] text-white font-medium">{r.course?.courseTitle||'—'}</div>
                            <div className="text-[11px] text-white/30">{r.course?.courseCode}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#f472b6] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                                {r.teacher?.shortName?.[0]}
                              </div>
                              <span className="text-[13px] text-white/70">{r.teacher?.shortName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge color="purple">🚪 {r.room?.roomNo}</Badge></td>
                          <td className="px-4 py-3"><Badge color="teal">{r.section}</Badge></td>
                          <td className="px-4 py-3 text-[12px] text-white/40">{r.levelTerm}</td>
                          <td className="px-4 py-3">
                            {hasConflict ? <Badge color="red">⚡ Conflict</Badge> : <span className="text-[11px] text-emerald-400">✓ OK</span>}
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 no-print">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10">✏</button>
                                <button onClick={() => del(r._id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs text-red-400 hover:bg-red-500/20">🗑</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            }
          </Card>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">Showing {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT,total)} of {total} classes</p>
          <div className="flex items-center gap-2">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/50 disabled:opacity-30 hover:bg-white/10 transition-colors">
              ← Prev
            </button>
            {Array.from({length: Math.min(totalPages,5)}, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page===p ? 'bg-[#6c63ff] text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'}`}>
                {p}
              </button>
            ))}
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/50 disabled:opacity-30 hover:bg-white/10 transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Class' : 'Add New Class'}>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Day" value={form.dayName} onChange={e => setForm(p=>({...p,dayName:e.target.value}))}>
            {DAYS.map(d=><option key={d}>{d}</option>)}
          </Select>
          <Select label="Semester *" value={form.semester} onChange={e => setForm(p=>({...p,semester:e.target.value}))}>
            <option value="">Select semester</option>
            {semesters.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
          <Input label="Start Time *" type="time" value={form.startTime} onChange={e=>setForm(p=>({...p,startTime:e.target.value}))} />
          <Input label="End Time *" type="time" value={form.endTime} onChange={e=>setForm(p=>({...p,endTime:e.target.value}))} />
          <Select label="Course *" value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))}>
            <option value="">Select course</option>
            {courses.map(c=><option key={c._id} value={c._id}>{c.courseCode} — {c.courseTitle}</option>)}
          </Select>
          <Select label="Teacher *" value={form.teacher} onChange={e=>setForm(p=>({...p,teacher:e.target.value}))}>
            <option value="">Select teacher</option>
            {teachers.map(t=><option key={t._id} value={t._id}>{t.shortName} — {t.fullName}</option>)}
          </Select>
          <Select label="Room *" value={form.room} onChange={e=>setForm(p=>({...p,room:e.target.value}))}>
            <option value="">Select room</option>
            {rooms.map(r=><option key={r._id} value={r._id}>Room {r.roomNo}</option>)}
          </Select>
          <Select label="Department" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))}>
            <option value="">Select dept</option>
            {departments.map(d=><option key={d._id} value={d._id}>{d.shortName}</option>)}
          </Select>
          <Input label="Level-Term *" value={form.levelTerm} onChange={e=>setForm(p=>({...p,levelTerm:e.target.value}))} placeholder="1-1" />
          <Select label="Section *" value={form.section} onChange={e=>setForm(p=>({...p,section:e.target.value}))}>
            {['A','B','C','D'].map(s=><option key={s}>{s}</option>)}
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.07]">
          <Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving?'Saving...':editing?'Update':'Save Class'}</Button>
        </div>
      </Modal>
    </div>
  )
}
