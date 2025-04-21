import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Youtube, FileJson, Globe } from "lucide-react"

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
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <nav className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/json-schema">
              <FileJson className="mr-2 h-4 w-4" />
              JSON Schemas
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/public-videos">
              <Globe className="mr-2 h-4 w-4" />
              Public Videos
            </Link>
          </Button>
        </nav>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 