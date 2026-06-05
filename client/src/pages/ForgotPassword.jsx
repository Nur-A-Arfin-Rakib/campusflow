import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
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
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="font-display font-bold text-white text-lg mb-2">Check your email</h2>
              <p className="text-white/40 text-sm">If that email exists, a reset link was sent. Check your inbox (and spam).</p>
              <Link to="/login" className="block mt-5 text-[#a78bfa] text-sm hover:underline">← Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-white text-lg mb-1">Forgot Password</h2>
              <p className="text-white/30 text-sm mb-5">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handle} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-white/30 uppercase tracking-wider">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/20 outline-none focus:border-[#6c63ff] transition-all" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="block text-center mt-4 text-white/30 text-sm hover:text-white/60">← Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
