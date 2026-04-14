import { supabase } from './supabase'
import { getMyTeacherProfile, getMyStudentProfile } from './profile'

// Create a new attendance session for a class
export async function createAttendanceSession(classSectionId, sessionType = 'regular') {
  const { data: teacherProfile } = await getMyTeacherProfile()
  if (!teacherProfile) return { data: null, error: new Error('No teacher profile') }

  // Check if session already exists for today
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('attendance_sessions')
    .select('id')
    .eq('class_section_id', classSectionId)
    .eq('session_date', today)
    .single()

  if (existing) {
    return { data: existing, error: new Error('Session already exists for today') }
  }

  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert({
      class_section_id: classSectionId,
      teacher_id: teacherProfile.id,
      session_date: today,
      session_type: sessionType,
    })
    .select()
    .single()

  return { data, error }
}

// Submit attendance records for a session
// attendanceMap = { studentProfileId: 'present' | 'absent' | 'late' }
export async function submitAttendanceRecords(sessionId, attendanceMap) {
  const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
    session_id: sessionId,
    student_id: studentId,
    status,
  }))

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'session_id,student_id' })
    .select()

  return { data, error }
}

// Get all sessions for a class section
export async function getSessionsForSection(classSectionId) {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_section_id', classSectionId)
    .order('session_date', { ascending: false })

  return { data, error }
}

// Get attendance records for a specific session
export async function getRecordsForSession(sessionId) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      *,
      student_profiles (
        id,
        roll_number,
        profiles (
          full_name
        )
      )
    `)
    .eq('session_id', sessionId)

  return { data, error }
}

// Get a student's attendance summary across all their enrolled sections
export async function getMyAttendanceSummary() {
  const { data: studentProfile } = await getMyStudentProfile()
  if (!studentProfile) return { data: [], error: new Error('No student profile') }

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      class_section_id,
      class_sections (
        courses ( name, code )
      )
    `)
    .eq('student_id', studentProfile.id)

  if (error) return { data: [], error }

  // For each enrollment, count total sessions and present count
  const summaries = await Promise.all(
    enrollments.map(async (enrollment) => {
      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('class_section_id', enrollment.class_section_id)

      const sessionIds = sessions?.map((s) => s.id) || []

      if (sessionIds.length === 0) {
        return {
          classSectionId: enrollment.class_section_id,
          courseName: enrollment.class_sections.courses.name,
          courseCode: enrollment.class_sections.courses.code,
          totalClasses: 0,
          present: 0,
          percentage: 0,
        }
      }

      const { data: records } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', studentProfile.id)
        .in('session_id', sessionIds)

      const present = records?.filter((r) => r.status === 'present').length || 0

      return {
        classSectionId: enrollment.class_section_id,
        courseName: enrollment.class_sections.courses.name,
        courseCode: enrollment.class_sections.courses.code,
        totalClasses: sessionIds.length,
        present,
        percentage: sessionIds.length > 0
          ? Math.round((present / sessionIds.length) * 100)
          : 0,
      }
    })
  )

  return { data: summaries, error: null }
}

// Calculate safe skips remaining for a student in a section
// Safe skip = how many more classes they can miss and still stay above 75%
export function calculateSafeSkips(totalClasses, presentCount, threshold = 75) {
  const future = totalClasses
  let safeSkips = 0
  let t = totalClasses
  let p = presentCount

  while (true) {
    t += 1
    const pct = (p / t) * 100
    if (pct < threshold) break
    safeSkips += 1
    if (safeSkips > 50) break
  }

  return safeSkips
}

// Predict attendance % after N future absences or presences
export function predictAttendance(totalClasses, presentCount, futurePresent, futureAbsent) {
  const newTotal = totalClasses + futurePresent + futureAbsent
  const newPresent = presentCount + futurePresent
  if (newTotal === 0) return 0
  return Math.round((newPresent / newTotal) * 100)
}