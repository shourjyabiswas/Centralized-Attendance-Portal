import { apiFetch } from './api'

export async function getStudentContacts() {
  try {
    const result = await apiFetch('/api/v1/contacts/student')
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}
