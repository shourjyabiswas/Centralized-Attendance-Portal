import AppLayout from '../../components/shared/AppLayout'

const courses = [
  { id: 1, code: 'CS301', name: 'Data Structures', section: 'CSE 3rd A', students: 58, classes: 24, conducted: 18 },
  { id: 2, code: 'CS302', name: 'Algorithms', section: 'CSE 3rd B', students: 54, classes: 24, conducted: 16 },
  { id: 3, code: 'IT201', name: 'DBMS', section: 'IT 2nd A', students: 60, classes: 20, conducted: 15 },
  { id: 4, code: 'CS401', name: 'Computer Networks', section: 'CSE 4th A', students: 52, classes: 22, conducted: 20 },
]

export default function TeacherCourses() {
  return (
    <AppLayout title="My Courses">
      <div style={{ width: '100%' }} className="flex flex-col gap-8">

        <p className="text-sm text-gray-400 dark:text-gray-500">
          {courses.length} courses assigned this semester
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                    {c.code}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">
                    {c.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {c.section}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {c.students} students
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                  <span>Classes conducted</span>
                  <span>{c.conducted}/{c.classes}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${(c.conducted / c.classes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}