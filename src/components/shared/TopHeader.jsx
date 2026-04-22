import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function TopHeader({ title }) {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/auth'
  }

  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-gray-800 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
          {user?.email}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignOut}
            className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg font-medium transition-colors border border-red-100 dark:border-red-900/30"
          >
            Sign out
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center border border-blue-100 dark:border-blue-900">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}