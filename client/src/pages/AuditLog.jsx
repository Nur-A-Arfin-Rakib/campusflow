import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Card, Badge, Spinner, EmptyState } from '../components/ui'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit').then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  const actionColor = { CREATE:'green', UPDATE:'amber', DELETE:'red' }
  const actionIcon  = { CREATE:'➕', UPDATE:'✏', DELETE:'🗑' }

  if (loading) return <Spinner />
  return (
    <div className="space-y-5 fade-up">
      <Card>
        {logs.length === 0 ? <EmptyState message="No audit logs yet" icon="🛡" /> :
          <table className="w-full">
            <thead><tr className="bg-white/[0.03]">
              {['Action','Model','User','Details','Time'].map(h => (
                <th key={h} className="text-left text-[10px] text-white/25 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs
                        ${log.action==='CREATE'?'bg-emerald-500/15':log.action==='DELETE'?'bg-red-500/15':'bg-amber-500/15'}`}>
                        {actionIcon[log.action] || '?'}
                      </div>
                      <Badge color={actionColor[log.action] || 'purple'}>{log.action}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-white/60">{log.model}</td>
                  <td className="px-5 py-3 text-[12px] text-white/60">{log.user?.name || 'System'}</td>
                  <td className="px-5 py-3 text-[11px] text-white/30 max-w-xs truncate">{log.details || '—'}</td>
                  <td className="px-5 py-3 text-[11px] text-white/25">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>
    </div>
  )
}
