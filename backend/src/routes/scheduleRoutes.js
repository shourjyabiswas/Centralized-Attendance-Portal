import { Router } from 'express'

const router = Router()
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

router.get('/student', async (req, res) => {
  try {
    const { data: sp } = await req.supabase.from('student_profiles').select('id').eq('profile_id', req.user.id).single()
    if (!sp) return res.json({ data: [] })
    const { data: enr } = await req.supabase.from('enrollments').select('class_section_id').eq('student_id', sp.id)
    if (!enr?.length) return res.json({ data: [] })
    const ids = enr.map(e => e.class_section_id)
    const { data, error } = await req.supabase.from('schedules').select('*, class_sections (section, courses (name, code))').in('class_section_id', ids).order('start_time', { ascending: true })
    if (error) return res.status(400).json({ error: error.message })
    const sorted = data?.sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week))
    return res.json({ data: sorted })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.get('/teacher', async (req, res) => {
  try {
    const { data: tp } = await req.supabase.from('teacher_profiles').select('id').eq('profile_id', req.user.id).single()
    if (!tp) return res.json({ data: [] })
    const { data: asgn } = await req.supabase.from('teacher_assignments').select('class_section_id').eq('teacher_id', tp.id)
    if (!asgn?.length) return res.json({ data: [] })
    const ids = asgn.map(a => a.class_section_id)
    const { data, error } = await req.supabase.from('schedules').select('*, class_sections (section, courses (name, code))').in('class_section_id', ids).order('start_time', { ascending: true })
    if (error) return res.status(400).json({ error: error.message })
    const sorted = data?.sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week))
    return res.json({ data: sorted })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.get('/today', async (req, res) => {
  try {
    const role = req.query.role || 'student'
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = days[new Date().getDay()]
    // Internally call the appropriate schedule fetcher
    let allData = []
    if (role === 'teacher') {
      const { data: tp } = await req.supabase.from('teacher_profiles').select('id').eq('profile_id', req.user.id).single()
      if (tp) {
        const { data: asgn } = await req.supabase.from('teacher_assignments').select('class_section_id').eq('teacher_id', tp.id)
        if (asgn?.length) {
          const ids = asgn.map(a => a.class_section_id)
          const { data } = await req.supabase.from('schedules').select('*, class_sections (section, courses (name, code))').in('class_section_id', ids).order('start_time', { ascending: true })
          allData = data || []
        }
      }
    } else {
      const { data: sp } = await req.supabase.from('student_profiles').select('id').eq('profile_id', req.user.id).single()
      if (sp) {
        const { data: enr } = await req.supabase.from('enrollments').select('class_section_id').eq('student_id', sp.id)
        if (enr?.length) {
          const ids = enr.map(e => e.class_section_id)
          const { data } = await req.supabase.from('schedules').select('*, class_sections (section, courses (name, code))').in('class_section_id', ids).order('start_time', { ascending: true })
          allData = data || []
        }
      }
    }
    const todayOnly = allData.filter(s => s.day_of_week === today)
    return res.json({ data: todayOnly })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

export default router
