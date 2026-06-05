// Reusable UI Components

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#111118] border border-white/[0.07] rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-lg font-medium transition-all cursor-pointer border-none'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  const variants = {
    primary: 'bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white shadow-lg shadow-[#6c63ff]/25 hover:-translate-y-0.5',
    ghost: 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, color = 'purple' }) {
  const colors = {
    purple: 'bg-[#6c63ff]/15 text-[#a78bfa]',
    teal:   'bg-[#2dd4bf]/15 text-[#2dd4bf]',
    pink:   'bg-[#f472b6]/15 text-[#f472b6]',
    amber:  'bg-[#fbbf24]/15 text-[#fbbf24]',
    green:  'bg-emerald-500/15 text-emerald-400',
    red:    'bg-red-500/15 text-red-400',
    blue:   'bg-blue-500/15 text-blue-400',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${colors[color] || colors.purple}`}>
      {children}
    </span>
  )
}

export function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] text-white/30 uppercase tracking-wider font-medium">{label}</label>}
      <input
        className={`px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/20 outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all ${className}`}
        {...props}
      />
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] text-white/30 uppercase tracking-wider font-medium">{label}</label>}
      <select
        className={`px-3 py-2 bg-[#18181f] border border-white/[0.08] rounded-lg text-[13px] text-white outline-none focus:border-[#6c63ff] transition-all ${className}`}
        {...props}>
        {children}
      </select>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#111118] border border-white/[0.1] rounded-2xl w-full max-w-lg shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
          <h2 className="font-display font-bold text-white text-[15px]">{title}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function StatCard({ icon, value, label, change, changeType = 'up', color = 'purple' }) {
  const colors = {
    purple: 'bg-[#6c63ff]/15',
    teal:   'bg-[#2dd4bf]/15',
    pink:   'bg-[#f472b6]/15',
    amber:  'bg-[#fbbf24]/15',
  }
  return (
    <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <div className="font-display font-bold text-white text-3xl leading-none mb-1">{value}</div>
      <div className="text-[12px] text-white/30">{label}</div>
      {change && (
        <div className={`text-[11px] mt-2 ${changeType === 'up' ? 'text-emerald-400' : changeType === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>
          {change}
        </div>
      )}
    </div>
  )
}

export function EmptyState({ message = 'No data found', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/20">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm">{message}</div>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[#6c63ff] rounded-full animate-spin" />
    </div>
  )
}

const DAY_COLORS = {
  Sunday: 'amber', Monday: 'blue', Tuesday: 'green',
  Wednesday: 'purple', Thursday: 'pink', Friday: 'teal', Saturday: 'red'
}
export function DayBadge({ day }) {
  return <Badge color={DAY_COLORS[day] || 'purple'}>{day}</Badge>
}
