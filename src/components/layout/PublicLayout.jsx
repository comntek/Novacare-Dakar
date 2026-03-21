import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import { MessageCircle } from 'lucide-react'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 pt-[88px] md:pt-[96px]">
        <Outlet />
      </main>
      <PublicFooter />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/221338001234"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-105 active:scale-95"
        title="Contacter sur WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </a>
    </div>
  )
}

export default PublicLayout