import { Router } from 'express'

const router = Router()

// GET /api/v1/profile/me — full profile from profiles table
router.get('/me', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /profile/me error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/profile/role — current user's role
router.get('/role', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single()

    console.log(`[DEBUG /role SSR] user: ${req.user.id}, data:`, data, 'error:', error?.message)

    if (error || !data) return res.json({ data: { role: null } })
    return res.json({ data: { role: data.role } })
  } catch (err) {
    console.error('GET /profile/role error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/profile/student — student profile with joined profile info
router.get('/student', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('student_profiles')
      .select(`
        *,
        profiles (
          full_name,
          email,
          college_name
        )
      `)
      .eq('profile_id', req.user.id)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /profile/student error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/profile/teacher — teacher profile with joined profile info
router.get('/teacher', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('teacher_profiles')
      .select(`
        *,
        profiles (
          full_name,
          email,
          college_name
        )
      `)
      .eq('profile_id', req.user.id)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /profile/teacher error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/profile/assigned-sections — teacher's assigned sections
router.get('/assigned-sections', async (req, res) => {
  try {
    const { data: teacherProfile } = await req.supabase
      .from('teacher_profiles')
      .select('id')
      .eq('profile_id', req.user.id)
      .single()

    if (!teacherProfile) return res.json({ data: [] })

    const { data, error } = await req.supabase
      .from('teacher_assignments')
      .select(`
        *,
        class_sections (
          *,
          courses (
            id, code, name, department, semester
          )
        )
      `)
      .eq('teacher_id', teacherProfile.id)

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /profile/assigned-sections error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/profile/enrolled-sections — student's enrolled sections
router.get('/enrolled-sections', async (req, res) => {
  try {
    const { data: studentProfile } = await req.supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', req.user.id)
      .single()

    if (!studentProfile) return res.json({ data: [] })

    const { data, error } = await req.supabase
      .from('enrollments')
      .select(`
        *,
        class_sections (
          *,
          courses (
            id, code, name, department, semester
          )
        )
      `)
      .eq('student_id', studentProfile.id)

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /profile/enrolled-sections error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/profile/sections/:id/students — students in a section
router.get('/sections/:id/students', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('enrollments')
      .select(`
        *,
        student_profiles (
          id, roll_number, year_of_study, section, department,
          profiles ( full_name, email )
        )
      `)
      .eq('class_section_id', req.params.id)
      .order('created_at', { ascending: true })

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /profile/sections/:id/students error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/v1/profile/dev-role — switch role (dev helper)
router.put('/dev-role', async (req, res) => {
  try {
    const { role } = req.body
    if (!role) return res.status(400).json({ error: 'role is required' })

    const { error } = await req.supabase
      .from('profiles')
      .update({ role })
      .eq('id', req.user.id)

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ success: true })
  } catch (err) {
    console.error('PUT /profile/dev-role error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
