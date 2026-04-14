import AppLayout from '../../components/shared/AppLayout'

const todayClasses = [
  { id: 1, subject: 'Data Structures', section: 'CSE 3rd A', time: '9:00 AM', room: 'R-301', done: false },
  { id: 2, subject: 'Algorithms', section: 'CSE 3rd B', time: '11:00 AM', room: 'R-205', done: false },
  { id: 3, subject: 'DBMS', section: 'IT 2nd A', time: '2:00 PM', room: 'R-102', done: true },
]

const stats = [
  { label: 'Assigned courses', value: '4' },
  { label: 'Classes this week', value: '12' },
  { label: 'Pending assignments', value: '3' },
  { label: 'Low attendance alerts', value: '5' },
]

export default function TeacherDashboard() {
  return (
    <AppLayout title="Dashboard">
      <div style={{ width: '100%' }} className="flex flex-col gap-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4"
            >
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Today's classes */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Today's classes
          </h2>
          <div className="flex flex-col gap-3">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className={`bg-white dark:bg-gray-900 border rounded-2xl px-5 py-4 flex items-center justify-between ${
                  cls.done
                    ? 'border-gray-100 dark:border-gray-800 opacity-50'
                    : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {cls.subject}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {cls.section} · {cls.room}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{cls.time}</span>
                  {cls.done ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                      Done
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Take attendance', desc: 'Mark today\'s class' },
              { label: 'Upload notes', desc: 'Share with students' },
              { label: 'Create assignment', desc: 'From question bank' },
            ].map((a) => (
              <button
                key={a.label}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-left hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {a.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {a.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}