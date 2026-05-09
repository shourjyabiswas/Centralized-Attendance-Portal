import { apiFetch } from './api'

export async function getLeaveRecipients() {
  try {
    const result = await apiFetch('/api/v1/leaves/recipients', {
      cache: false,
    })
    return { data: result.data || { teachers: [], hods: [] }, error: null }
  } catch (err) {
    return { data: { teachers: [], hods: [] }, error: err }
  }
}

export async function getMyLeaveApplications() {
  try {
    const result = await apiFetch('/api/v1/leaves/applications', {
      cache: false,
    })
    return { data: result.data || [], error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export async function createLeaveApplication(payload) {
  try {
    const formData = new FormData()
    formData.append('recipientProfileId', payload.recipientProfileId)
    formData.append('subject', payload.subject)
    formData.append('message', payload.message)
    formData.append('fromDate', payload.fromDate)
    formData.append('toDate', payload.toDate || payload.fromDate)

    if (payload.attachment) {
      formData.append('attachment', payload.attachment)
    }

    const result = await apiFetch('/api/v1/leaves/applications', {
      method: 'POST',
      body: formData,
      cache: false,
    })

    return { data: result.data || null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function updateLeaveApplicationStatus(id, payload) {
  try {
    const result = await apiFetch(`/api/v1/leaves/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      cache: false,
    })

    return { data: result.data || null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}
