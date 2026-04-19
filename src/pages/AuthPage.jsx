import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, handleAuthCallback } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const isCallback = window.location.pathname === '/auth/callback'
    if (!isCallback) return
    async function processCallback() {
      const { user, error } = await handleAuthCallback()
      if (error) { setError(error.message); return }
      if (user) navigate('/onboarding', { replace: true })
    }
    processCallback()
  }, [navigate])

  useEffect(() => {
    if (loading) return
    if (user && role) navigate('/dashboard', { replace: true })
  }, [user, role, loading, navigate])

  async function handleEmailAuth() {
    setError(null)
    setMessage(null)
    if (!email.trim() || !password.trim()) return setError('Please fill in all fields.')
    if (tab === 'signup' && !fullName.trim()) return setError('Please enter your full name.')
    setSubmitting(true)

    if (tab === 'login') {
      const { error } = await signInWithEmail(email.trim(), password)
      if (error) { setError(error.message); setSubmitting(false); return }
      navigate('/dashboard', { replace: true })
    } else {
      const { error } = await signUpWithEmail(email.trim(), password, fullName.trim())
      if (error) { setError(error.message); setSubmitting(false); return }
      setMessage('Account created! Check your email to confirm, then log in.')
      setTab('login')
    }
    setSubmitting(false)
  }

  async function handleGoogleSignIn() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            Heritage Institute of Technology
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Attendance Portal</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setMessage(null) }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {t === 'login' ? 'Log in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          {tab === 'signup' && (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@heritageit.edu.in"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}
          {message && <p className="text-xs text-green-500">{message}</p>}

          <button
            onClick={handleEmailAuth}
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Please wait...' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <span className="text-xs text-gray-300 dark:text-gray-600">or</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Continue with Google
          </span>
        </button>

        <p className="text-xs text-gray-300 dark:text-gray-600 text-center">
          Only @heritageit.edu.in accounts are permitted
        </p>
      </div>
    </div>
  )
}