import { useEffect, useState } from 'react'
import api from '../lib/api'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday']
const DAY_COLORS = { Sunday:'#fbbf24', Monday:'#60a5fa', Tuesday:'#34d399', Wednesday:'#a78bfa', Thursday:'#f472b6' }

export default function PublicRoutine() {
  const [routine, setRoutine] = useState([])
  const [semesters, setSemesters] = useState([])
  const [filterSem, setFilterSem] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/routine'), api.get('/semesters')])
      .then(([r, s]) => { setRoutine(r.data); setSemesters(s.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = routine.filter(r => {
    if (filterSem && r.semester?._id !== filterSem) return false
    if (filterSection && r.section !== filterSection) return false
    return true
  })

  const sections = [...new Set(routine.map(r => r.section))].sort()

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6" style={{
      backgroundImage: 'radial-gradient(ellipse at 10% 50%, rgba(108,99,255,0.06) 0%, transparent 50%)'
    }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                 style={{ background:'linear-gradient(135deg,#6c63ff,#2dd4bf)' }}>ES</div>
            <div>
              <h1 className="font-display font-bold text-white text-xl">CampusFlow</h1>
              <p className="text-white/30 text-xs">Class Routine — Public View</p>
            </div>
          </div>
          <a href="/login" className="px-4 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors">
            Admin Login →
          </a>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 outline-none">
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 outline-none">
            <option value="">All Sections</option>
            {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
          <button onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors">
            🖨 Print
          </button>
        </div>

        {/* Routine Grid by Day */}
        {loading
          ? <div className="text-white/30 text-center py-16">Loading...</div>
          : DAYS.map(day => {
            const dayClasses = filtered.filter(r => r.dayName === day).sort((a,b) => a.startTime.localeCompare(b.startTime))
            if (dayClasses.length === 0) return null
            return (
              <div key={day} className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[12px] font-semibold px-3 py-1 rounded-full"
                        style={{ color: DAY_COLORS[day], background: `${DAY_COLORS[day]}18` }}>
                    {day}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayClasses.map(r => (
                    <div key={r._id} className="bg-[#111118] border border-white/[0.07] rounded-xl p-4 hover:border-white/15 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-[13px] text-white font-medium">{r.course?.courseTitle}</div>
                          <div className="text-[11px] text-white/30 mt-0.5">{r.course?.courseCode}</div>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                              style={{ color: DAY_COLORS[day], background: `${DAY_COLORS[day]}18` }}>
                          {r.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-[11px] text-white/30">
                        <span>🕐 {r.startTime}–{r.endTime}</span>
                        <span>🚪 {r.room?.roomNo}</span>
                        <span>👨‍🏫 {r.teacher?.shortName}</span>
                      </div>
                      <div className="text-[10px] text-white/20 mt-1">Level {r.levelTerm}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        }

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-white/20">
            <div className="text-4xl mb-3">📅</div>
            <div>No classes found for selected filters</div>
          </div>
        )}
      </div>
    </div>
  )
}
