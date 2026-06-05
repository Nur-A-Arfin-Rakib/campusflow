import { useEffect, useState } from 'react'
import { StatCard, Card, Badge, DayBadge, Spinner } from '../components/ui'
import api from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [routine, setRoutine] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/routine'),
      api.get('/teachers'),
      api.get('/rooms'),
      api.get('/routine/conflicts').catch(() => ({ data: [] })),
      api.get('/audit').catch(() => ({ data: [] })),
    ]).then(([r, t, rm, c, a]) => {
      setRoutine((r.data?.data || r.data).slice(0, 6))
      setConflicts(c.data)
      setAudit(a.data.slice(0, 5))
      setStats({
        classes: r.data.length,
        teachers: t.data.length,
        rooms: rm.data.length,
        conflicts: c.data.length,
      })
    }).finally(() => setLoading(false))
  }, [])

  const dayData = ['Sunday','Monday','Tuesday','Wednesday','Thursday'].map(d => ({
    day: d.slice(0,3),
    classes: routine.filter(r => r.dayName === d).length
  }))

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 fade-up">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="📅" value={stats?.classes ?? 0} label="Total Classes" change="↑ This semester" color="purple" />
        <StatCard icon="👨‍🏫" value={stats?.teachers ?? 0} label="Active Teachers" change="Active" changeType="up" color="teal" />
        <StatCard icon="🚪" value={stats?.rooms ?? 0} label="Rooms in Use" color="pink" />
        <StatCard icon="⚡" value={stats?.conflicts ?? 0} label="Conflicts"
          change={stats?.conflicts > 0 ? '⚠ Needs attention' : '✓ All clear'}
          changeType={stats?.conflicts > 0 ? 'down' : 'up'} color="amber" />
      </div>

      {/* Conflict Alert */}
      {conflicts.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 pulse-ring">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-red-400 text-sm flex-1">
            <strong>{conflicts.length} conflict(s) detected</strong> — go to Routine page to resolve
          </p>
        </div>
      )}

      {/* Chart + Recent */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-5">
          <h3 className="font-display font-bold text-white text-[14px] mb-4">Classes per Day</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData} barSize={28}>
              <XAxis dataKey="day" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff' }}
                cursor={{ fill: 'rgba(108,99,255,0.1)' }}
              />
              <Bar dataKey="classes" radius={[6,6,0,0]}>
                {dayData.map((_, i) => <Cell key={i} fill={['#6c63ff','#2dd4bf','#f472b6','#fbbf24','#60a5fa'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold text-white text-[14px] mb-4">Recent Activity</h3>
          {audit.length === 0
            ? <p className="text-white/20 text-sm text-center py-4">No activity yet</p>
            : <div className="space-y-3">
              {audit.map(log => (
                <div key={log._id} className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0
                    ${log.action==='CREATE' ? 'bg-emerald-500/15' : log.action==='DELETE' ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
                    {log.action==='CREATE' ? '➕' : log.action==='DELETE' ? '🗑' : '✏'}
                  </div>
                  <div>
                    <p className="text-[12px] text-white/70">{log.action} {log.model}</p>
                    <p className="text-[10px] text-white/25">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          }
        </Card>
      </div>

      {/* Recent Routine */}
      <Card>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
          <h3 className="font-display font-bold text-white text-[14px]">Recent Classes</h3>
        </div>
        {routine.length === 0
          ? <p className="text-white/20 text-sm text-center py-8">No classes added yet</p>
          : <table className="w-full">
            <thead>
              <tr className="bg-white/[0.03]">
                {['Day','Time','Course','Teacher','Room','Section'].map(h => (
                  <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routine.map(r => (
                <tr key={r._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-5 py-3"><DayBadge day={r.dayName} /></td>
                  <td className="px-5 py-3 text-[13px] text-white/60">{r.startTime}–{r.endTime}</td>
                  <td className="px-5 py-3">
                    <div className="text-[13px] text-white font-medium">{r.course?.courseTitle || '—'}</div>
                    <div className="text-[11px] text-white/30">{r.course?.courseCode}</div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-white/60">{r.teacher?.shortName}</td>
                  <td className="px-5 py-3"><Badge color="purple">🚪 {r.room?.roomNo}</Badge></td>
                  <td className="px-5 py-3"><Badge color="teal">{r.section}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>
    </div>
  )
}
