import { Routes, Route, Navigate } from 'react-router-dom'

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminDepartments from '../pages/admin/AdminDepartments'
import AdminCourses from '../pages/admin/AdminCourses'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminAttendance from '../pages/admin/AdminAttendance'
import AdminAlerts from '../pages/admin/AdminAlerts'
import AdminSchedule from '../pages/admin/AdminSchedule'
import AdminAssignCourses from '../pages/admin/AdminAssignCourses'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="departments" element={<AdminDepartments />} />
      <Route path="courses" element={<AdminCourses />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="attendance" element={<AdminAttendance />} />
      <Route path="alerts" element={<AdminAlerts />} />
      <Route path="schedule" element={<AdminSchedule />} />
      <Route path="assign-courses" element={<AdminAssignCourses />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}