import { apiFetch } from './api'

export async function getMyStudentSchedule() {
  try {
    const result = await apiFetch('/api/v1/schedule/student')
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export async function getMyTeacherSchedule() {
  try {
    const result = await apiFetch('/api/v1/schedule/teacher')
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export async function getTodaySchedule(role) {
  try {
    const result = await apiFetch(`/api/v1/schedule/today?role=${role}`)
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}