import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SidebarNav } from '@/components/layout/sidebar-nav'

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
  },
  {
    title: "Prompts",
    href: "/admin/prompts",
  },
  {
    title: "JSON Schema",
    href: "/admin/json-schema",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
  },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/sign-in')
  }

  // Check if user is admin
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!user?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav items={adminNavItems} className="w-64 border-r" />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
} 