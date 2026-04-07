import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, isSupabaseConfigured } from '@/lib/supabase-server'
import Sidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isLoginPage = pathname === '/admin/login'

  if (!isLoginPage && isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')
  }

  // Render login page without sidebar/header
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-admin-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C2333',
            color: '#E2E8F0',
            border: '1px solid #2D3748',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#1C2333' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#1C2333' },
          },
        }}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 admin-scroll">
          {children}
        </main>
      </div>
    </div>
  )
}
