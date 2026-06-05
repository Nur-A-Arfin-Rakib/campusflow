import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(45,212,191,0.06) 0%, transparent 60%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-xl"
            style={{ background: 'linear-gradient(135deg,#6c63ff,#2dd4bf)', boxShadow: '0 0 30px rgba(108,99,255,0.3)' }}>CF</div>
          <h1 className="font-display font-bold text-white text-2xl">CampusFlow</h1>
          <p className="text-white/30 text-sm mt-1">Class Routine Management System</p>
        </div>
        <div className="bg-[#111118] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-5">Sign In</h2>
          <form onSubmit={handle} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/30 uppercase tracking-wider">Email</label>
              <input type="email" required placeholder="admin@gmail.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/20 outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-white/30 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[#a78bfa] hover:underline">Forgot password?</Link>
              </div>
              <input type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/20 outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-white/20 text-center">Demo: admin@gmail.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
