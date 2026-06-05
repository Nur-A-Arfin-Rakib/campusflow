import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Min 6 characters'); return }
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password })
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token expired or invalid')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-xl"
            style={{ background: 'linear-gradient(135deg,#6c63ff,#2dd4bf)', boxShadow: '0 0 30px rgba(108,99,255,0.3)' }}>CF</div>
          <h1 className="font-display font-bold text-white text-2xl">CampusFlow</h1>
        </div>
        <div className="bg-[#111118] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-5">Reset Password</h2>
          <form onSubmit={handle} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/30 uppercase tracking-wider">New Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters"
                className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/20 outline-none focus:border-[#6c63ff] transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/30 uppercase tracking-wider">Confirm Password</label>
              <input type="password" required value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/20 outline-none focus:border-[#6c63ff] transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}>
              {loading ? 'Resetting...' : '🔒 Reset Password'}
            </button>
          </form>
          <Link to="/login" className="block text-center mt-4 text-white/30 text-sm hover:text-white/60">← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
