import { Router } from 'express'

const router = Router()

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const VALID_SESSION_TYPES = ['regular', 'randomized', 'lecture', 'lab', 'tutorial']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  if (minutes > 0) return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
  return `${displayHours} ${period}`
}

// Did the student attend? present + late both count. Only absent does not.
function wasAttended(status) {
  return status === 'present' || status === 'late'
}

// Enrich a teacher group with aggregate stats
function enrichTeacher(teacher) {
  const total = teacher.records.length
  const attended = teacher.records.filter(r => wasAttended(r.status)).length
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
  return { ...teacher, attended, total, percentage }
}

// Enrich a subject with per-teacher stats + overall rollup
function enrichSubject(subject) {
  const teachers = subject.teachers.map(enrichTeacher)
  const totalRecords = teachers.reduce((acc, t) => acc + t.total, 0)
  const totalAttended = teachers.reduce((acc, t) => acc + t.attended, 0)
  const overallPercentage = totalRecords > 0
    ? Math.round((totalAttended / totalRecords) * 100)
    : 0
  return { ...subject, teachers, overallPercentage }
}

// Shared helper: get the logged-in student's profile row, or null
async function getStudentProfile(supabase, userId) {
  const { data } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', userId)
    .single()
  return data ?? null
}

// Shared core: build full attendance detail per subject + teacher for a session type.
// Used by both /details/:type and /summary/:type to avoid duplicated logic.
async function buildAttendanceDetails(supabase, studentId, sessionType) {
  // Get all enrolled class sections with course info
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      class_section_id,
      class_sections (
        id,
        courses ( name, code )
      )
    `)
    .eq('student_id', studentId)

  if (enrollError || !enrollments?.length) return []

  const classSectionIds = enrollments.map(e => e.class_section_id)

  // ── Single query: all sessions of the requested type across all enrolled sections ──
  const { data: sessions, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select(`
      id,
      class_section_id,
      session_date,
      session_type,
      teacher_id,
      teacher_profiles (
        id,
        profiles ( full_name )
      )
    `)
    .in('class_section_id', classSectionIds)
    .eq('session_type', sessionType)
    .order('session_date', { ascending: false })

  if (sessionError || !sessions?.length) return []

  // ── Single query: all attendance records for this student across those sessions ──
  const sessionIds = sessions.map(s => s.id)
  const { data: records } = await supabase
    .from('attendance_records')
    .select('session_id, status')
    .eq('student_id', studentId)
    .in('session_id', sessionIds)

  // Build O(1) lookup: session_id → status
  const recordMap = {}
  records?.forEach(r => { recordMap[r.session_id] = r.status })

  // ── Single query: schedules for all enrolled sections (for time display) ──
  const { data: schedules } = await supabase
    .from('schedules')
    .select('class_section_id, day_of_week, start_time, end_time')
    .in('class_section_id', classSectionIds)

  // Build O(1) lookup: class_section_id + day → { start, end }
  const scheduleMap = {}
  schedules?.forEach(s => {
    const key = `${s.class_section_id}__${s.day_of_week}`
    scheduleMap[key] = { start: s.start_time, end: s.end_time }
  })

  // Build O(1) lookup: class_section_id → course info
  const courseMap = {}
  enrollments.forEach(e => {
    courseMap[e.class_section_id] = e.class_sections?.courses ?? null
  })

  // Group sessions by class_section, then by teacher
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const subjectMap = {}

  for (const session of sessions) {
    const { class_section_id, teacher_id } = session
    const course = courseMap[class_section_id]
    if (!course) continue

    if (!subjectMap[class_section_id]) {
      subjectMap[class_section_id] = {
        subjectCode: course.code,
        subjectName: course.name,
        teachers: {},
      }
    }

    const teacherName = session.teacher_profiles?.profiles?.full_name ?? 'Unknown'

    if (!subjectMap[class_section_id].teachers[teacher_id]) {
      const nameParts = teacherName.split(' ').filter(Boolean)
      const initials = nameParts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
      subjectMap[class_section_id].teachers[teacher_id] = {
        name: teacherName,
        initials,
        records: [],
      }
    }

    const dateObj = new Date(session.session_date + 'T00:00:00')
    const dayOfWeek = DAY_NAMES[dateObj.getDay()]
    const dateStr = `${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getDate()}`

    const scheduleKey = `${class_section_id}__${dayOfWeek}`
    const schedule = scheduleMap[scheduleKey]
    const timeStr = schedule
      ? `${formatTime(schedule.start)}–${formatTime(schedule.end)}`
      : ''

    subjectMap[class_section_id].teachers[teacher_id].records.push({
      date: dateStr,
      time: timeStr,
      status: recordMap[session.id] ?? 'absent',
    })
  }

  // Convert nested maps → arrays and enrich with stats
  return Object.values(subjectMap)
    .map(subject => enrichSubject({
      ...subject,
      teachers: Object.values(subject.teachers),
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName))
}

// ─── TEACHER: SESSION MANAGEMENT ─────────────────────────────────────────────

// POST /api/v1/attendance/sessions — create a new attendance session
router.post('/sessions', async (req, res) => {
  try {
    const { classSectionId, sessionType = 'regular' } = req.body

    // Validate session type
    if (!VALID_SESSION_TYPES.includes(sessionType)) {
      return res.status(400).json({ error: `Invalid session type. Must be one of: ${VALID_SESSION_TYPES.join(', ')}` })
    }

    // Get teacher profile
    const { data: teacherProfile } = await req.supabase
      .from('teacher_profiles')
      .select('id')
      .eq('profile_id', req.user.id)
      .single()

    if (!teacherProfile) return res.status(403).json({ error: 'No teacher profile found' })

    // Verify this teacher is assigned to the class section
    const { data: assignment } = await req.supabase
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', teacherProfile.id)
      .eq('class_section_id', classSectionId)
      .single()

    if (!assignment) {
      return res.status(403).json({ error: 'You are not assigned to this class section' })
    }

    // Block duplicate sessions for the same date
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await req.supabase
      .from('attendance_sessions')
      .select('id')
      .eq('class_section_id', classSectionId)
      .eq('session_date', today)
      .single()

    if (existing) {
      return res.status(409).json({ data: existing, error: 'Session already exists for today' })
    }

    const { data, error } = await req.supabase
      .from('attendance_sessions')
      .insert({
        class_section_id: classSectionId,
        teacher_id: teacherProfile.id,
        session_date: today,
        session_type: sessionType,
      })
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.status(201).json({ data })
  } catch (err) {
    console.error('POST /attendance/sessions error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/v1/attendance/sessions/:id/records — submit attendance records
router.post('/sessions/:id/records', async (req, res) => {
  try {
    const { attendanceMap } = req.body
    const sessionId = req.params.id

    // Validate statuses
    const VALID_STATUSES = ['present', 'absent', 'late']
    const invalid = Object.entries(attendanceMap ?? {})
      .find(([, status]) => !VALID_STATUSES.includes(status))
    if (invalid) {
      return res.status(400).json({ error: `Invalid status "${invalid[1]}" for student ${invalid[0]}` })
    }

    // Verify the session belongs to this teacher
    const { data: teacherProfile } = await req.supabase
      .from('teacher_profiles')
      .select('id')
      .eq('profile_id', req.user.id)
      .single()

    if (!teacherProfile) return res.status(403).json({ error: 'No teacher profile found' })

    const { data: session } = await req.supabase
      .from('attendance_sessions')
      .select('teacher_id')
      .eq('id', sessionId)
      .single()

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.teacher_id !== teacherProfile.id) {
      return res.status(403).json({ error: 'You do not own this session' })
    }

    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      session_id: sessionId,
      student_id: studentId,
      status,
    }))

    const { data, error } = await req.supabase
      .from('attendance_records')
      .upsert(records, { onConflict: 'session_id,student_id' })
      .select()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('POST /attendance/sessions/:id/records error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── TEACHER: VIEWING DATA ────────────────────────────────────────────────────

// GET /api/v1/attendance/sections/:id/sessions — all sessions for a section
router.get('/sections/:id/sessions', async (req, res) => {
  try {
    // Verify requester is a teacher assigned to this section
    const { data: teacherProfile } = await req.supabase
      .from('teacher_profiles')
      .select('id')
      .eq('profile_id', req.user.id)
      .single()

    if (!teacherProfile) return res.status(403).json({ error: 'No teacher profile found' })

    const { data: assignment } = await req.supabase
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', teacherProfile.id)
      .eq('class_section_id', req.params.id)
      .single()

    if (!assignment) {
      return res.status(403).json({ error: 'You are not assigned to this class section' })
    }

    const { data, error } = await req.supabase
      .from('attendance_sessions')
      .select('*')
      .eq('class_section_id', req.params.id)
      .order('session_date', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /attendance/sections/:id/sessions error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/attendance/sessions/:id/records — full roster for a session
router.get('/sessions/:id/records', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('attendance_records')
      .select(`
        *,
        student_profiles (
          id,
          roll_number,
          profiles ( full_name )
        )
      `)
      .eq('session_id', req.params.id)
      .order('student_profiles(roll_number)', { ascending: true })

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ data })
  } catch (err) {
    console.error('GET /attendance/sessions/:id/records error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── STUDENT: ATTENDANCE DATA ─────────────────────────────────────────────────

// GET /api/v1/attendance/summary — overall summary across all enrolled sections
// Fixed: single join query instead of N+1, counts 'late' as attended
router.get('/summary', async (req, res) => {
  try {
    const studentProfile = await getStudentProfile(req.supabase, req.user.id)
    if (!studentProfile) return res.json({ data: [] })

    // Single query — join records → sessions → class_sections → courses
    const { data: records, error } = await req.supabase
      .from('attendance_records')
      .select(`
        status,
        attendance_sessions (
          class_section_id,
          class_sections (
            courses ( name, code )
          )
        )
      `)
      .eq('student_id', studentProfile.id)

    if (error) return res.status(400).json({ error: error.message })

    // Aggregate in JS — zero extra round-trips
    const map = {}
    for (const record of records ?? []) {
      const session = record.attendance_sessions
      const key = session?.class_section_id
      const course = session?.class_sections?.courses
      if (!key || !course) continue

      if (!map[key]) {
        map[key] = {
          classSectionId: key,
          courseName: course.name,
          courseCode: course.code,
          total: 0,
          attended: 0,
        }
      }

      map[key].total++
      // Fix: late counts as attended, consistent with lib/attendance.js
      if (wasAttended(record.status)) map[key].attended++
    }

    const data = Object.values(map).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0,
    }))

    return res.json({ data })
  } catch (err) {
    console.error('GET /attendance/summary error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/attendance/details/:type — full details grouped by subject + teacher
// Fixed: single batch query, no N+1, type validated, late counted
router.get('/details/:type', async (req, res) => {
  try {
    const sessionType = req.params.type

    // Validate session type
    if (!VALID_SESSION_TYPES.includes(sessionType)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_SESSION_TYPES.join(', ')}` })
    }

    const studentProfile = await getStudentProfile(req.supabase, req.user.id)
    if (!studentProfile) return res.json({ data: [] })

    const data = await buildAttendanceDetails(req.supabase, studentProfile.id, sessionType)
    return res.json({ data })
  } catch (err) {
    console.error('GET /attendance/details/:type error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/attendance/summary/:type — compact summary for dashboard rings
// Fixed: reuses buildAttendanceDetails, no duplicated logic
router.get('/summary/:type', async (req, res) => {
  try {
    const sessionType = req.params.type

    // Validate session type
    if (!VALID_SESSION_TYPES.includes(sessionType)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_SESSION_TYPES.join(', ')}` })
    }

    const studentProfile = await getStudentProfile(req.supabase, req.user.id)
    if (!studentProfile) return res.json({ data: [] })

    const details = await buildAttendanceDetails(req.supabase, studentProfile.id, sessionType)

    // Strip down to just what the dashboard rings need
    const data = details.map(s => ({
      name: s.subjectName,
      code: s.subjectCode,
      percentage: s.overallPercentage,
    }))

    return res.json({ data })
  } catch (err) {
    console.error('GET /attendance/summary/:type error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router