import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { sendEmail } from '../lib/email.js'

const router = Router()

const REMINDER_DELAY_HOURS = 3
const SPECIAL_CODES = new Set(['LIB', 'REM', 'LUNCH'])

function toIstDateString(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function getIstDayName(dateString) {
  const date = new Date(`${dateString}T00:00:00+05:30`)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  }).format(date)
}

function parseTimeSlotEnd(timeSlot) {
  if (!timeSlot || typeof timeSlot !== 'string') return null
  const parts = timeSlot.split('-')
  if (parts.length !== 2) return null
  const end = parts[1].trim()
  if (!/^\d{1,2}:\d{2}$/.test(end)) return null
  const [hours, minutes] = end.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

router.post('/attendance-reminders', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required for cron reminders.' })
    }

    const todayIst = toIstDateString(new Date())
    const minDate = toIstDateString(new Date(Date.now() - 24 * 60 * 60 * 1000))

    const { data: sessions, error } = await supabaseAdmin
      .from('attendance_sessions')
      .select(`
        id,
        class_section_id,
        teacher_id,
        session_date,
        time_slot,
        attendance_records ( id ),
        class_sections (
          id,
          section,
          year_of_study,
          department,
          courses ( id, name, code, semester, department, type )
        ),
        teacher_profiles (
          id,
          profiles ( full_name, email )
        )
      `)
      .gte('session_date', minDate)
      .lte('session_date', todayIst)
      .order('session_date', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const candidateSessions = (sessions || []).filter((session) => {
      if (session.attendance_records && session.attendance_records.length > 0) return false
      const endTime = parseTimeSlotEnd(session.time_slot)
      if (!endTime) return false

      const endTimestamp = new Date(`${session.session_date}T${endTime}:00+05:30`)
      if (Number.isNaN(endTimestamp.getTime())) return false

      const deadline = new Date(endTimestamp.getTime() + REMINDER_DELAY_HOURS * 60 * 60 * 1000)
      return Date.now() >= deadline.getTime()
    })

    if (candidateSessions.length === 0) {
      return res.json({ sent: 0, skipped: 0, total: 0 })
    }

    const sessionIds = candidateSessions.map((s) => s.id)
    const { data: logRows, error: logError } = await supabaseAdmin
      .from('attendance_reminder_logs')
      .select('session_id')
      .in('session_id', sessionIds)

    if (logError) {
      return res.status(500).json({ error: logError.message })
    }

    const loggedSessionIds = new Set((logRows || []).map((row) => row.session_id))
    let sentCount = 0
    let skippedCount = 0

    for (const session of candidateSessions) {
      if (loggedSessionIds.has(session.id)) {
        skippedCount++
        continue
      }

      const course = session.class_sections?.courses
      const courseCode = (course?.code || '').trim().toUpperCase()
      if (SPECIAL_CODES.has(courseCode)) {
        skippedCount++
        continue
      }

      const teacher = session.teacher_profiles
      const teacherName = teacher?.profiles?.full_name || 'Teacher'
      const teacherEmail = teacher?.profiles?.email
      if (!teacherEmail) {
        skippedCount++
        continue
      }

      const dayName = getIstDayName(session.session_date)
      const { data: scheduleRow } = await supabaseAdmin
        .from('class_schedules')
        .select('room_number')
        .eq('class_section_id', session.class_section_id)
        .eq('day', dayName)
        .eq('time_slot', session.time_slot)
        .maybeSingle()

      const roomNumber = scheduleRow?.room_number || 'TBA'
      const section = session.class_sections?.section || 'N/A'
      const year = session.class_sections?.year_of_study || 'N/A'
      const department = session.class_sections?.department || course?.department || 'N/A'
      const semester = course?.semester || 'N/A'

      const emailResult = await sendEmail({
        to: teacherEmail,
        subject: `Attendance Reminder: ${course?.name || 'Class'} (${courseCode || 'N/A'})`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Attendance Reminder</h2>
            <p>Hello <strong>${teacherName}</strong>,</p>
            <p>This is a reminder that attendance has not been submitted for the class below, and 3 hours have passed since it ended.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 10px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Course:</strong> ${course?.name || 'N/A'} (${courseCode || 'N/A'})</p>
              <p style="margin: 6px 0 0 0;"><strong>Department:</strong> ${department}</p>
              <p style="margin: 6px 0 0 0;"><strong>Year / Semester:</strong> ${year} / ${semester}</p>
              <p style="margin: 6px 0 0 0;"><strong>Section:</strong> ${section}</p>
              <p style="margin: 6px 0 0 0;"><strong>Room:</strong> ${roomNumber}</p>
              <p style="margin: 6px 0 0 0;"><strong>Class Date:</strong> ${session.session_date} (${dayName})</p>
              <p style="margin: 6px 0 0 0;"><strong>Time Slot:</strong> ${session.time_slot}</p>
            </div>
            <p>Please submit the attendance as soon as possible.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">This is an automated reminder from the Centralized Attendance Portal.</p>
          </div>
        `,
      })

      if (emailResult?.success) {
        const { error: insertError } = await supabaseAdmin
          .from('attendance_reminder_logs')
          .insert({
            session_id: session.id,
            teacher_id: session.teacher_id,
            class_section_id: session.class_section_id,
            reminder_type: 'attendance_missing_3h',
          })

        if (insertError) {
          console.error('[reminder] Log insert failed:', insertError)
        }

        sentCount++
      } else {
        console.error('[reminder] Email failed:', emailResult?.error || 'Unknown error')
      }
    }

    return res.json({ sent: sentCount, skipped: skippedCount, total: candidateSessions.length })
  } catch (err) {
    console.error('POST /cron/attendance-reminders error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
