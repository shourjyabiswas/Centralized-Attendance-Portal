import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import BottomNav from './BottomNav'

export default function AppLayout({ title, children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopHeader title={title} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-20 md:pb-6 box-border">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}