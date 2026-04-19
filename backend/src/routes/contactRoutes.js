import { Router } from 'express'

const router = Router()

// GET /api/v1/contacts/student — mock data for now
router.get('/student', async (req, res) => {
  return res.json({
    data: [
      {
        subjectId: 'S001',
        subjectName: 'Object Oriented Programming',
        type: 'Lecture',
        teachers: [
          { id: 'T001', name: 'Dr. Alan Turing', email: 'alan.turing@example.com', phone: '+1 234 567 8900', role: 'Primary Instructor' }
        ]
      },
      {
        subjectId: 'S003',
        subjectName: 'Database Management Systems',
        type: 'Lecture',
        teachers: [
          { id: 'T004', name: 'Edgar F. Codd', email: 'edgar.codd@example.com', phone: '', role: 'Professor' }
        ]
      }
    ]
  })
})

export default router
