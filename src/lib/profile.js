import { supabase } from './supabase'

export async function getMyStudentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not logged in') }

  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      *,
      profiles (
        full_name,
        email,
        college_name
      )
    `)
    .eq('profile_id', user.id)
    .single()

  return { data, error }
}

export async function getMyTeacherProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not logged in') }

  const { data, error } = await supabase
    .from('teacher_profiles')
    .select(`
      *,
      profiles (
        full_name,
        email,
        college_name
      )
    `)
    .eq('profile_id', user.id)
    .single()

  return { data, error }
}

// Get all class sections assigned to the current teacher
export async function getMyAssignedSections() {
  const { data: teacherProfile } = await getMyTeacherProfile()
  if (!teacherProfile) return { data: [], error: new Error('No teacher profile') }

  const { data, error } = await supabase
    .from('teacher_assignments')
    .select(`
      *,
      class_sections (
        *,
        courses (
          id,
          code,
          name,
          department,
          semester
        )
      )
    `)
    .eq('teacher_id', teacherProfile.id)

  return { data, error }
}

// Get all class sections a student is enrolled in
export async function getMyEnrolledSections() {
  const { data: studentProfile } = await getMyStudentProfile()
  if (!studentProfile) return { data: [], error: new Error('No student profile') }

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      class_sections (
        *,
        courses (
          id,
          code,
          name,
          department,
          semester
        )
      )
    `)
    .eq('student_id', studentProfile.id)

  return { data, error }
}

// Get all students enrolled in a specific class section
export async function getStudentsInSection(classSectionId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      student_profiles (
        id,
        roll_number,
        year_of_study,
        section,
        department,
        profiles (
          full_name,
          email
        )
      )
    `)
    .eq('class_section_id', classSectionId)
    .order('created_at', { ascending: true })

  return { data, error }
}