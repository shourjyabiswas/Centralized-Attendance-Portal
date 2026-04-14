// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { getRole, getUser, onAuthStateChange } from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(() => localStorage.getItem('role') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { user } = await getUser()
      if (user) {
        setUser(user)
        const cachedRole = localStorage.getItem('role')
        if (cachedRole) {
          setRole(cachedRole)
          setLoading(false)
        }
        const freshRole = await getRole()
        if (freshRole) {
          setRole(freshRole)
          localStorage.setItem('role', freshRole)
        }
      } else {
        localStorage.removeItem('role')
      }
      setLoading(false)
    }

    init()

    const { data: listener } = onAuthStateChange(async (session) => {
      if (session?.user) {
        setUser(session.user)
        const freshRole = await getRole()
        if (freshRole) {
          setRole(freshRole)
          localStorage.setItem('role', freshRole)
        }
      } else {
        setUser(null)
        setRole(null)
        localStorage.removeItem('role')
      }
      setLoading(false)
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return { user, role, loading }
}