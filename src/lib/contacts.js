import { apiFetch } from './api'

const CACHE_TTL_MS = 2 * 60 * 1000
const STALE_WINDOW_MS = 5 * 60 * 1000

export async function getStudentContacts() {
  try {
    const result = await apiFetch('/api/v1/contacts/student', {
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
