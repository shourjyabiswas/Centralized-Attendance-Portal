import { useState } from 'react'
import AppLayout from '../../components/shared/AppLayout'

const notes = [
  { id: 1, title: 'Linked Lists — Lecture 5', course: 'Data Structures', date: 'Apr 10, 2026', type: 'note' },
  { id: 2, title: 'Sorting Algorithms Slides', course: 'Algorithms', date: 'Apr 8, 2026', type: 'note' },
  { id: 3, title: 'ER Diagram Reference Sheet', course: 'DBMS', date: 'Apr 5, 2026', type: 'note' },
]

export default function TeacherNotes() {
  const [dragging, setDragging] = useState(false)

  return (
    <AppLayout title="Notes">
      <div style={{ width: '100%' }} className="flex flex-col gap-8">

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false) }}
          className={`border-2 border-dashed rounded-2xl px-6 py-10 flex flex-col items-center gap-3 transition-colors ${
            dragging
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-lg">
            ↑
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Drag and drop files here, or{' '}
            <label className="text-blue-500 cursor-pointer hover:underline">
              browse
              <input type="file" className="hidden" multiple />
            </label>
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600">
            PDF, DOCX, PPTX up to 20MB
          </p>
        </div>

        {/* Uploaded notes */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Uploaded notes
          </h2>
          <div className="flex flex-col gap-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-400 text-xs font-mono">
                    PDF
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {n.course} · {n.date}
                    </p>
                  </div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-500 transition-colors">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}