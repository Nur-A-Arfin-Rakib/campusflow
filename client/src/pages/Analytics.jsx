import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card, Spinner } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#6c63ff','#2dd4bf','#f472b6','#fbbf24','#60a5fa','#34d399']

export default function Analytics() {
  const [routine, setRoutine] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/routine'), api.get('/teachers')])
      .then(([r, t]) => { setRoutine(r.data?.data || r.data); setTeachers(t.data?.data || t.data) })
      .finally(() => setLoading(false))
  }, [])

  const dayData = ['Sunday','Monday','Tuesday','Wednesday','Thursday'].map(d => ({
    day: d.slice(0,3), classes: routine.filter(r => r.dayName === d).length
  }))

  const teacherLoad = teachers.map(t => ({
    name: t.shortName,
    classes: routine.filter(r => r.teacher?._id === t._id || r.teacher === t._id).length
  })).filter(t => t.classes > 0).sort((a,b) => b.classes - a.classes).slice(0, 8)

  const sectionData = [...new Set(routine.map(r => r.section))].map(s => ({
    name: `Section ${s}`, value: routine.filter(r => r.section === s).length
  }))

  if (loading) return <Spinner />

  return (
    <div className="space-y-5 fade-up">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5 text-center">
          <div className="font-display font-bold text-4xl text-white mb-1">{routine.length}</div>
          <div className="text-white/30 text-sm">Total Classes</div>
        </div>
        <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5 text-center">
          <div className="font-display font-bold text-4xl text-[#2dd4bf] mb-1">{teachers.length}</div>
          <div className="text-white/30 text-sm">Total Teachers</div>
        </div>
        <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5 text-center">
          <div className="font-display font-bold text-4xl text-[#f472b6] mb-1">
            {[...new Set(routine.map(r => r.section))].length}
          </div>
          <div className="text-white/30 text-sm">Sections</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-bold text-white text-[14px] mb-4">Classes per Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dayData} barSize={32}>
              <XAxis dataKey="day" stroke="#ffffff15" tick={{ fill:'#ffffff40', fontSize:12 }} />
              <YAxis stroke="#ffffff15" tick={{ fill:'#ffffff40', fontSize:11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background:'#18181f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff' }} cursor={{ fill:'rgba(108,99,255,0.1)' }} />
              <Bar dataKey="classes" radius={[6,6,0,0]}>
                {dayData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold text-white text-[14px] mb-4">Classes by Section</h3>
          {sectionData.length === 0
            ? <div className="flex items-center justify-center h-52 text-white/20 text-sm">No data</div>
            : <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sectionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {sectionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'#18181f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff' }} />
                <Legend wrapperStyle={{ color:'rgba(255,255,255,0.4)', fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-display font-bold text-white text-[14px] mb-4">Teacher Workload</h3>
        {teacherLoad.length === 0
          ? <div className="flex items-center justify-center h-40 text-white/20 text-sm">No data</div>
          : <div className="space-y-3">
            {teacherLoad.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-[12px] text-white/40 text-right">{t.name}</div>
                <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(t.classes / Math.max(...teacherLoad.map(x=>x.classes))) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <div className="w-8 text-[12px] text-white/30">{t.classes}</div>
              </div>
            ))}
          </div>
        }
      </Card>
    </div>
  )
}
