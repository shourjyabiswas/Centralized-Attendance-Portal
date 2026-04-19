import { useState, useEffect } from 'react'
import AppLayout from '../../components/shared/AppLayout'
import { apiFetch } from '../../lib/api'

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'EE', name: 'Electrical Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CE', name: 'Civil Engineering' },
]

export default function AdminDepartments() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      const data = await apiFetch('/api/v1/admin/stats')
      setStats(data.data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Departments">
        <div style={{ width: '100%' }} className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Departments">
      <div style={{ width: '100%' }} className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Department Overview</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Departmental statistics and distribution</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.code}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{dept.code}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{dept.name}</p>
                </div>
                <span className="text-2xl font-bold text-blue-500">📚</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">—</p>
                  <p className="text-gray-400 dark:text-gray-500">Students</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">—</p>
                  <p className="text-gray-400 dark:text-gray-500">Teachers</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">—</p>
                  <p className="text-gray-400 dark:text-gray-500">Courses</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl px-5 py-4">
            <p className="text-xs text-blue-600 dark:text-blue-400">Total Students</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats?.totalStudents || 0}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl px-5 py-4">
            <p className="text-xs text-green-600 dark:text-green-400">Total Teachers</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats?.totalTeachers || 0}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl px-5 py-4">
            <p className="text-xs text-amber-600 dark:text-amber-400">Total Courses</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.totalCourses || 0}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
