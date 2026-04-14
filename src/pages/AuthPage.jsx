import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle, handleAuthCallback } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  // Handle the OAuth callback redirect
  useEffect(() => {
    const isCallback = window.location.pathname === '/auth/callback'
    if (!isCallback) return

    async function processCallback() {
      const { user, error } = await handleAuthCallback()
      if (error) {
        setError(error.message)
        return
      }
      if (user) {
        navigate('/onboarding', { replace: true })
      }
    }

    processCallback()
  }, [navigate])

  // If already logged in, redirect based on role
  useEffect(() => {
    if (loading) return
    if (user && role) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, role, loading, navigate])

  async function handleGoogleSignIn() {
    setError(null)
    setSigningIn(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setSigningIn(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center gap-6">

        {/* College name */}
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            Heritage Institute of Technology
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Attendance Portal
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

        {/* Domain notice */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Sign in with your college Google account
          <br />
          <span className="font-mono text-gray-500 dark:text-gray-400">
            @heritage.it.edu
          </span>
        </p>

        {/* Google sign in button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google SVG icon */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {signingIn ? 'Redirecting...' : 'Continue with Google'}
          </span>
        </button>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-500 text-center">
            {error}
          </p>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-300 dark:text-gray-600 text-center">
          Only @heritage.it.edu accounts are permitted
        </p>
      </div>
    </div>
  )
}