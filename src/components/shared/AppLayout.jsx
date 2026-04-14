import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import BottomNav from './BottomNav'

export default function AppLayout({ title, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopHeader title={title} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}