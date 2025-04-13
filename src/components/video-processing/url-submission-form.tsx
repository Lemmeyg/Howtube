"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function YouTubeUrlForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
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
            const error = payload.new.error_message

            switch (status) {
              case 'transcribing':
                toast.loading('Transcribing video...', { id: currentVideoId })
                break
              case 'completed':
                toast.success('Video processing completed!', { id: currentVideoId })
                setCurrentVideoId(null)
                setLoading(false)
                break
              case 'error':
                toast.error(`Error: ${error}`, { id: currentVideoId })
                setCurrentVideoId(null)
                setLoading(false)
                break
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
    setLoading(true)

    try {
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

      setCurrentVideoId(data.videoId)
      toast.loading('Processing video...', { id: data.videoId })
      setUrl("")
    } catch (error) {
      toast.error(error.message)
      console.error('Error submitting video:', error)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Submit YouTube Video</CardTitle>
        <CardDescription>Enter a YouTube URL to process</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              pattern="^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Submit Video"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 