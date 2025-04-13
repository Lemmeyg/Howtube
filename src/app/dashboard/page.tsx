"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { YouTubeUrlForm } from "@/components/video-processing/url-submission-form"

interface Video {
  id: string
  youtube_url: string
  status: string
  transcription: string | null
  created_at: string
  error_message: string | null
}

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetchVideos()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('videos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        () => {
          fetchVideos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchVideos = async () => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setVideos(videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter(video => 
    video.youtube_url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-light">HowTube</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* YouTube URL Submission Form */}
        <div className="mb-8 flex justify-center">
          <YouTubeUrlForm />
        </div>

        {/* Search */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading videos...</p>
          ) : filteredVideos.length === 0 ? (
            <p>No videos found. Try submitting a YouTube URL above.</p>
          ) : (
            filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 break-all">{video.youtube_url}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      video.status === "completed" ? "text-green-500" : 
                      video.status === "error" ? "text-red-500" : 
                      "text-orange-500"
                    }`}>
                      {video.status === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : video.status === "error" ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      {video.status}
                    </span>
                  </div>
                  {video.error_message && (
                    <p className="mt-2 text-sm text-red-500">{video.error_message}</p>
                  )}
                </CardContent>
                {video.status === "completed" && (
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
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
} 