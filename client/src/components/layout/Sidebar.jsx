import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',   icon: '⊞', roles: ['admin','teacher','student'] },
  { to: '/routine',     label: 'Routine',      icon: '📅', roles: ['admin','teacher','student'] },
  { to: '/teachers',    label: 'Teachers',     icon: '👨‍🏫', roles: ['admin'] },
  { to: '/courses',     label: 'Courses',      icon: '📚', roles: ['admin'] },
  { to: '/rooms',       label: 'Rooms',        icon: '🚪', roles: ['admin'] },
  { to: '/departments', label: 'Departments',  icon: '🏛', roles: ['admin'] },
  { to: '/semesters',   label: 'Semesters',    icon: '📆', roles: ['admin'] },
  { to: '/analytics',   label: 'Analytics',    icon: '📊', roles: ['admin','teacher'] },
  { to: '/audit',       label: 'Audit Log',    icon: '🛡', roles: ['admin'] },
  { to: '/users',       label: 'Users',        icon: '👥', roles: ['admin'] },
  { to: '/profile',     label: 'My Profile',   icon: '⚙', roles: ['admin','teacher','student'] },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const visible = navItems.filter(n => n.roles.includes(user?.role))

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed left-0 top-0 bottom-0 w-60 bg-[#111118] border-r border-white/[0.07]
        flex flex-col z-50 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#6c63ff,#2dd4bf)' }}>CF</div>
            <div>
              <div className="font-display font-bold text-white text-[15px] leading-tight">CampusFlow</div>
              <div className="text-[10px] text-white/30 tracking-widest uppercase">Routine Manager</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white text-lg">✕</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <div className="text-[10px] text-white/25 tracking-widest uppercase px-2 py-2 mt-1">Menu</div>
          {visible.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-all ${
                  isActive
                    ? 'bg-[rgba(108,99,255,0.18)] text-[#a78bfa] font-medium'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`
              }>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.07] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#6c63ff,#f472b6)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-white font-medium truncate">{user?.name}</div>
            <div className="text-[11px] text-white/30 capitalize">{user?.role}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }}
            className="text-white/25 hover:text-red-400 transition-colors text-sm" title="Logout">⏻</button>
        </div>
      </aside>
    </>
  )
}
