import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const titles = {
  '/dashboard':'Dashboard', '/routine':'Class Routine', '/teachers':'Teachers',
  '/courses':'Courses', '/rooms':'Rooms', '/departments':'Departments',
  '/semesters':'Semesters', '/analytics':'Analytics', '/audit':'Audit Log',
  '/users':'Users', '/profile':'My Profile',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { dark, toggle } = useTheme()
  return (
    <header className="sticky top-0 z-40 h-14 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/[0.07] flex items-center px-4 lg:px-7 gap-4">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden text-white/50 hover:text-white text-xl mr-1">☰</button>
      <h1 className="font-display font-bold text-white text-lg flex-1">{titles[pathname] || 'CampusFlow'}</h1>
      <div className="flex items-center gap-2">
        <button onClick={toggle}
          className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-sm hover:bg-white/10 transition-colors">
          {dark ? '☀' : '🌙'}
        </button>
        <div className="relative">
          <button className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-sm hover:bg-white/10 transition-colors">🔔</button>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0f]" />
        </div>
      </div>
    </header>
  )
}
