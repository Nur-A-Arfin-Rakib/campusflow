import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Card, Button, Input } from '../components/ui'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = async e => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setSaving(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg space-y-5 fade-up">
      {/* Profile Info */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
               style={{ background: 'linear-gradient(135deg,#6c63ff,#f472b6)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-xl">{user?.name}</h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#6c63ff]/15 text-[#a78bfa] mt-1 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/[0.03] rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">Member Since</div>
            <div className="text-white font-medium">{new Date(user?.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">Account Status</div>
            <div className="text-emerald-400 font-medium">Active</div>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-white text-[15px] mb-5">Change Password</h3>
        <form onSubmit={handleChange} className="space-y-3">
          <Input
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
            placeholder="••••••••"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
            placeholder="Min 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="Repeat new password"
            required
          />
          <div className="pt-2">
            <Button type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Changing...' : '🔒 Change Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
