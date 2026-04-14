import AppLayout from '../../components/shared/AppLayout'
import AttendanceRings from '../../components/student/AttendanceRings'

export default function StudentDashboard() { 
  // Mock data for lectures
  const lectureData = [
    { name: 'Data Structures', percentage: 95 },
    { name: 'Algorithms', percentage: 88 },
    { name: 'Databases', percentage: 76 },
    { name: 'Operating Systems', percentage: 71 }, // Ineligible (< 75%)
    { name: 'Computer Networks', percentage: 82 }
  ];

  // Mock data for labs
  const labData = [
    { name: 'Data Structures Lab', percentage: 100 },
    { name: 'Algorithms Lab', percentage: 85 },
    { name: 'Databases Lab', percentage: 65 } // Ineligible (< 75%)
  ];

  return (
    <AppLayout title="Student Dashboard">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome Back, Student!</h2>
          <p className="text-gray-500">Here is an overview of your current attendance status across all subjects.</p>
        </div>

        <div className="flex flex-col gap-8 items-start">
          <AttendanceRings title="Lecture Attendance" subjects={lectureData} />
          <AttendanceRings title="Lab Attendance" subjects={labData} />
        </div>
      </div>
    </AppLayout>
  )
}
