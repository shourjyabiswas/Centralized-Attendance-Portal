import { supabase } from './supabase'
import { apiFetch } from './api'

const CACHE_TTL_MS = 2 * 60 * 1000
const STALE_WINDOW_MS = 5 * 60 * 1000

export async function getTeacherAssignedCourses() {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) return { error: 'Not authenticated' }

    const result = await apiFetch(`/api/v1/admin/teacher-assignments?teacherId=${user.user.id}`, {
      cache: true,
      cacheTtlMs: CACHE_TTL_MS,
      staleWindowMs: STALE_WINDOW_MS,
      staleWhileRevalidate: true,
    })

    return { data: result.data || [], error: null }
  } catch (err) {
    console.error('Error fetching teacher assignments:', err)
    return { data: [], error: err.message }
  }
}
