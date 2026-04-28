import { apiFetch } from './api'

const CACHE_TTL_MS = 2 * 60 * 1000
const STALE_WINDOW_MS = 5 * 60 * 1000

export async function getMyStudentSchedule() {
  try {
    const result = await apiFetch('/api/v1/schedules/student', {
      cache: true,
      cacheTtlMs: CACHE_TTL_MS,
      staleWindowMs: STALE_WINDOW_MS,
      staleWhileRevalidate: true,
    })
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export async function getMyTeacherSchedule() {
  try {
    const result = await apiFetch('/api/v1/schedules/teacher', {
      cache: true,
      cacheTtlMs: CACHE_TTL_MS,
      staleWindowMs: STALE_WINDOW_MS,
      staleWhileRevalidate: true,
    })
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export async function getTodaySchedule(role) {
  try {
    const result = await apiFetch(`/api/v1/schedules/today?role=${role}`, {
      cache: true,
      cacheTtlMs: CACHE_TTL_MS,
      staleWindowMs: STALE_WINDOW_MS,
      staleWhileRevalidate: true,
    })
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}