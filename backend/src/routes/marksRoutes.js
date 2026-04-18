import { Router } from 'express'

const router = Router()

// POST /api/v1/marks/upload
router.post('/upload', async (req, res) => {
  try {
    const { classSectionId, examName, marksArray } = req.body
    const records = marksArray.map(m => ({
      class_section_id: classSectionId,
      student_id: m.studentId,
      exam_name: examName,
      marks_obtained: m.marksObtained,
      max_marks: m.maxMarks,
    }))
    const { data, error } = await req.supabase
      .from('exam_marks')
      .upsert(records, { onConflict: 'class_section_id,student_id,exam_name' })
      .select()
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// GET /api/v1/marks/sections/:id
router.get('/sections/:id', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('exam_marks')
      .select('*, student_profiles ( roll_number, profiles ( full_name ) )')
      .eq('class_section_id', req.params.id)
      .order('exam_name', { ascending: true })
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// GET /api/v1/marks/mine
router.get('/mine', async (req, res) => {
  try {
    const { data: sp } = await req.supabase.from('student_profiles').select('id').eq('profile_id', req.user.id).single()
    if (!sp) return res.json({ data: [] })
    const { data, error } = await req.supabase
      .from('exam_marks')
      .select('*, class_sections ( courses ( name, code ) )')
      .eq('student_id', sp.id)
      .order('recorded_at', { ascending: false })
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// GET /api/v1/marks/average/:sectionId/:examName
router.get('/average/:sectionId/:examName', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('exam_marks')
      .select('marks_obtained, max_marks')
      .eq('class_section_id', req.params.sectionId)
      .eq('exam_name', req.params.examName)
    if (error || !data?.length) return res.json({ average: 0 })
    const avg = data.reduce((sum, r) => sum + (r.marks_obtained / r.max_marks) * 100, 0) / data.length
    return res.json({ average: Math.round(avg) })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

export default router
