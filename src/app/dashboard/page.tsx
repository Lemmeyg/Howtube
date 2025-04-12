"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit2,
  Eye,
  FileText,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/api/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Mock data for documents
const documents = [
  {
    id: 1,
    title: "Introduction to Biology",
    thumbnail: "/placeholder.svg?height=200&width=350",
    status: "Published",
    date: "2023-04-15",
  },
  {
    id: 2,
    title: "Advanced Mathematics: Calculus",
    thumbnail: "/placeholder.svg?height=200&width=350",
    status: "Draft",
    date: "2023-05-22",
  },
  {
    id: 3,
    title: "Chemistry Lab Safety Procedures",
    thumbnail: "/placeholder.svg?height=200&width=350",
    status: "Published",
    date: "2023-03-10",
  },
]

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [url, setUrl] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Successfully signed out!")
      router.push("/auth/sign-in")
    } catch (error) {
      toast.error("Error signing out.")
      console.error("Error:", error)
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-youtube-red" />
            <span className="text-xl font-light">HowTube</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Account Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-red-500">
                  <X className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Search and Add New */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <img
                      src={doc.thumbnail}
                      alt={doc.title}
                      className="w-full h-48 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{doc.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {doc.date}
                      </span>
                      <span className={`flex items-center gap-1 ${
                        doc.status === "Published" ? "text-green-500" : "text-orange-500"
                      }`}>
                        {doc.status === "Published" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Edit2 className="h-4 w-4" />
                        )}
                        {doc.status}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-youtube-red" />
              <span className="text-xl font-light">HowTube</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="container py-8">
            <div className="flex flex-col gap-4">
              <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
} 