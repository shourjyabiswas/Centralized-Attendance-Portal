import { useState } from 'react'
import AppLayout from '../../components/shared/AppLayout'

const courses = [
  { id: 1, name: 'Data Structures', section: 'CSE 3rd A' },
  { id: 2, name: 'Algorithms', section: 'CSE 3rd B' },
  { id: 3, name: 'DBMS', section: 'IT 2nd A' },
]

const students = [
  { id: 1, name: 'Aritro Bag', roll: '22052001' },
  { id: 2, name: 'Soham Das', roll: '22052002' },
  { id: 3, name: 'Priya Sharma', roll: '22052003' },
  { id: 4, name: 'Rahul Gupta', roll: '22052004' },
  { id: 5, name: 'Ananya Roy', roll: '22052005' },
  { id: 6, name: 'Debjit Sen', roll: '22052006' },
]

export default function TeacherAttendance() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [attendance, setAttendance] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function toggle(studentId, status) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  function handleSubmit() {
    // Will wire to Supabase later
    setSubmitted(true)
  }

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length

  return (
    <AppLayout title="Attendance">
      <div style={{ width: '100%' }} className="flex flex-col gap-8">

        {/* Course selector */}
        {!selectedCourse && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Select a course to take attendance
            </p>
            <div className="flex flex-col gap-3">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-left hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {c.section}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attendance marking */}
        {selectedCourse && !submitted && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                  {selectedCourse.name}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {selectedCourse.section} · {new Date().toDateString()}
                </p>
              </div>
              <button
                onClick={() => { setSelectedCourse(null); setAttendance({}) }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Change
              </button>
            </div>

            {/* Mark all row */}
            <div className="flex gap-2">
              <button
                onClick={() => students.forEach((s) => toggle(s.id, 'present'))}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900"
              >
                Mark all present
              </button>
              <button
                onClick={() => students.forEach((s) => toggle(s.id, 'absent'))}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900"
              >
                Mark all absent
              </button>
            </div>

            {/* Student list */}
            <div className="flex flex-col gap-2">
              {students.map((s) => {
                const status = attendance[s.id]
                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-gray-800 dark:text-white font-medium">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {s.roll}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggle(s.id, 'present')}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          status === 'present'
                            ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                            : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-green-200'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => toggle(s.id, 'absent')}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          status === 'absent'
                            ? 'bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800'
                            : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-red-200'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary + submit */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-green-500 font-semibold">{presentCount} present</span>
                {' · '}
                <span className="text-red-400 font-semibold">
                  {Object.values(attendance).filter((v) => v === 'absent').length} absent
                </span>
                {' · '}
                {students.length - Object.keys(attendance).length} unmarked
              </p>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(attendance).length < students.length}
                className="text-sm px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Success state */}
        {submitted && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 flex items-center justify-center text-green-500 text-lg">
              ✓
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Attendance submitted
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {presentCount} of {students.length} students marked present
            </p>
            <button
              onClick={() => { setSubmitted(false); setSelectedCourse(null); setAttendance({}) }}
              className="mt-2 text-xs text-blue-500 hover:underline"
            >
              Take another class
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}