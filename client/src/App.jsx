import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Routine from './pages/Routine'
import Teachers from './pages/Teachers'
import Analytics from './pages/Analytics'
import AuditLog from './pages/AuditLog'
import PublicRoutine from './pages/PublicRoutine'
import Profile from './pages/Profile'
import { Courses, Rooms, Departments, Semesters, Users } from './pages/CrudPages'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[#6c63ff] rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#22222e', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.1)' }
        }}/>
        <Routes>
          <Route path="/login"                    element={<Login />} />
          <Route path="/forgot-password"          element={<ForgotPassword />} />
          <Route path="/reset-password/:token"    element={<ResetPassword />} />
          <Route path="/routine/public"           element={<PublicRoutine />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="routine"     element={<Routine />} />
            <Route path="teachers"    element={<PrivateRoute roles={['admin']}><Teachers /></PrivateRoute>} />
            <Route path="courses"     element={<PrivateRoute roles={['admin']}><Courses /></PrivateRoute>} />
            <Route path="rooms"       element={<PrivateRoute roles={['admin']}><Rooms /></PrivateRoute>} />
            <Route path="departments" element={<PrivateRoute roles={['admin']}><Departments /></PrivateRoute>} />
            <Route path="semesters"   element={<PrivateRoute roles={['admin']}><Semesters /></PrivateRoute>} />
            <Route path="analytics"   element={<Analytics />} />
            <Route path="audit"       element={<PrivateRoute roles={['admin']}><AuditLog /></PrivateRoute>} />
            <Route path="users"       element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
            <Route path="profile"     element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
