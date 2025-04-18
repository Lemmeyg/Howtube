"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { YouTubeUrlForm } from "@/components/video-processing/url-submission-form"
import { VideoList } from "@/components/video/video-list"

interface Video {
  id: string
  youtube_url: string
  status: string
  transcription: string | null
  created_at: string
  error_message: string | null
  progress: number
}

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/sign-in')
          return
        }

        const { data: videos, error } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setVideos(videos || [])
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()

    // Subscribe to video updates
    const channel = supabase
      .channel('videos')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos'
        },
        (payload) => {
          setVideos(prevVideos => 
            prevVideos.map(video => 
              video.id === payload.new.id ? { ...video, ...payload.new } : video
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
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
                <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/dashboard/subscription')}>
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        <div className="space-y-8">
          <YouTubeUrlForm />
          {loading ? (
            <div>Loading videos...</div>
          ) : (
            <VideoList videos={videos} />
          )}
        </div>
      </main>
    </div>
  )
} 