"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

export function YouTubeUrlForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'initializing' | 'downloading' | 'uploading' | 'transcribing' | 'processing' | 'completed' | 'error'>('idle')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (currentVideoId) {
      const channel = supabase
        .channel('video-status')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'videos',
            filter: `id=eq.${currentVideoId}`,
          },
          (payload) => {
            const status = payload.new.status
            const progress = payload.new.progress || 0
            const error = payload.new.error_message

            setStatus(status)
            setProgress(progress)

            if (status === 'completed') {
              toast.success('Video processing completed!')
              setTimeout(() => {
                setCurrentVideoId(null)
                setLoading(false)
                setProgress(0)
                setStatus('idle')
              }, 2000)
            } else if (status === 'error') {
              toast.error(`Error: ${error}`)
              setCurrentVideoId(null)
              setLoading(false)
              setProgress(0)
              setStatus('error')
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [currentVideoId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      setLoading(true)
      setStatus('initializing')
      setProgress(0)

      const response = await fetch('/api/videos/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl: url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video')
      }

      setCurrentVideoId(data.video.id)
      setUrl("")
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to process video')
      setStatus('error')
      setProgress(0)
      setLoading(false)
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'initializing':
        return 'Initializing...'
      case 'downloading':
        return 'Downloading video audio...'
      case 'uploading':
        return 'Uploading to transcription service...'
      case 'transcribing':
        return 'Transcribing audio...'
      case 'processing':
        return 'Processing transcription...'
      case 'completed':
        return 'Processing complete!'
      case 'error':
        return 'An error occurred'
      default:
        return 'Submit a YouTube URL to process'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Process YouTube Video</CardTitle>
        <CardDescription>{getStatusMessage()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={loading || !url.trim()}
                className="min-w-[100px]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Process'
                )}
              </Button>
            </div>
          </div>
          {(loading || status !== 'idle') && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% - {getStatusMessage()}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 