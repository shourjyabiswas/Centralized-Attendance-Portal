import { apiFetch } from './api'

// Upload marks for multiple students in a section
// marksArray = [{ studentId, marksObtained, maxMarks }]
export async function uploadExamMarks(classSectionId, examName, marksArray) {
  try {
    const result = await apiFetch('/api/v1/marks/upload', {
      method: 'POST',
      body: JSON.stringify({ classSectionId, examName, marksArray }),
    })
    return { data: result.data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Get all exam marks for a specific section
export async function getMarksForSection(classSectionId) {
  try {
    const result = await apiFetch(`/api/v1/marks/sections/${classSectionId}`)
    return { data: result.data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Get current student's own marks across all sections
export async function getMyMarks() {
  try {
    const result = await apiFetch('/api/v1/marks/mine')
    return { data: result.data, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

// Get class average for a specific exam in a section
export async function getClassAverage(classSectionId, examName) {
  try {
    const result = await apiFetch(`/api/v1/marks/average/${classSectionId}/${examName}`)
    return { average: result.average, error: null }
  } catch (err) {
    return { average: 0, error: err }
  }
}