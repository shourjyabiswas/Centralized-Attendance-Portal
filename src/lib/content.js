import { apiFetch } from './api'

// Upload a file and save metadata via the backend
export async function uploadContent(classSectionId, file, title, description, type) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('classSectionId', classSectionId)
    formData.append('title', title)
    formData.append('description', description || '')
    formData.append('type', type)

    const result = await apiFetch('/api/v1/content/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type — browser sets it with FormData boundary
    })
    return { data: result.data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Get all content items for a class section
export async function getContentForSection(classSectionId, type = null) {
  try {
    let url = `/api/v1/content/sections/${classSectionId}`
    if (type) url += `?type=${type}`
    const result = await apiFetch(url)
    return { data: result.data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Get all content items across all sections a student is enrolled in
export async function getContentForStudent(type = null) {
  try {
    let url = '/api/v1/content/student'
    if (type) url += `?type=${type}`
    const result = await apiFetch(url)
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

// Delete a content item and its file from storage
export async function deleteContent(contentId, fileUrl, type) {
  try {
    await apiFetch(`/api/v1/content/${contentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ fileUrl, type }),
    })
    return { error: null }
  } catch (err) {
    return { error: err }
  }
}