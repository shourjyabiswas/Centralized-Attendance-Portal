import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function TopHeader({ title }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth', { replace: true })
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
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center border border-blue-100 dark:border-blue-900">
            {initials}
          </button>
          <div className="absolute right-0 top-10 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm py-1 hidden group-hover:block z-50">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}