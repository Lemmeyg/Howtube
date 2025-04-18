import { SidebarNav } from '@/components/layout/sidebar-nav'

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
  },
  {
    title: "JSON Schemas",
    href: "/admin/schemas",
  },
  {
    title: "System Prompts",
    href: "/admin/prompts",
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={adminNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
} 