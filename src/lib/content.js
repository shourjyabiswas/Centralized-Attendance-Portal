import { supabase } from './supabase'
import { getMyTeacherProfile } from './profile'

// Upload a file to Supabase Storage and save metadata to content_items
export async function uploadContent(classSectionId, file, title, description, type) {
  const { data: teacherProfile } = await getMyTeacherProfile()
  if (!teacherProfile) return { data: null, error: new Error('No teacher profile') }

  // Upload file to storage
  const fileExt = file.name.split('.').pop()
  const filePath = `${classSectionId}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from(type === 'note' ? 'notes' : 'assignments')
    .upload(filePath, file)

  if (uploadError) return { data: null, error: uploadError }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(type === 'note' ? 'notes' : 'assignments')
    .getPublicUrl(filePath)

  // Save metadata
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      class_section_id: classSectionId,
      uploaded_by: teacherProfile.id,
      type,
      title,
      description,
      file_url: publicUrl,
    })
    .select()
    .single()

  return { data, error }
}

// Get all content items for a class section
export async function getContentForSection(classSectionId, type = null) {
  let query = supabase
    .from('content_items')
    .select('*')
    .eq('class_section_id', classSectionId)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  return { data, error }
}

// Get all content items across all sections a student is enrolled in
export async function getContentForStudent(type = null) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: new Error('Not logged in') }

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('class_section_id')
    .eq('student_id', (await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    ).data?.id)

  if (!enrollments?.length) return { data: [], error: null }

  const sectionIds = enrollments.map((e) => e.class_section_id)

  let query = supabase
    .from('content_items')
    .select(`
      *,
      class_sections (
        courses ( name, code )
      )
    `)
    .in('class_section_id', sectionIds)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  return { data, error }
}

// Delete a content item and its file from storage
export async function deleteContent(contentId, fileUrl, type) {
  const filePath = fileUrl.split('/').slice(-2).join('/')

  await supabase.storage
    .from(type === 'note' ? 'notes' : 'assignments')
    .remove([filePath])

  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', contentId)

  return { error }
}