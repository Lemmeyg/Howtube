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

// Define status type for better type safety
type ProcessingStatus = 'idle' | 'initializing' | 'downloading' | 'uploading' | 'transcribing' | 'processing' | 'completed' | 'error'

// Define interface for video payload
interface VideoPayload {
  new: {
    id: string
    status: ProcessingStatus
    progress: number
    error_message?: string
  }
  old: {
    id: string
    status: ProcessingStatus
    progress: number
    error_message?: string
  }
  commit_timestamp: string
  eventType: 'UPDATE'
  schema: string
  table: string
}

export function YouTubeUrlForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!currentVideoId) return

    // Set up SSE connection
    const eventSource = new EventSource(`/api/videos/status?videoId=${currentVideoId}`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received status update:', data);
      
      setStatus(data.status as ProcessingStatus);
      setProgress(data.progress);

      if (data.status === 'completed') {
        toast.success('Video processing completed!', {
          duration: 5000,
          description: 'You can now view the processed video in your dashboard.'
        });
        setTimeout(() => {
          resetForm();
          eventSource.close();
        }, 2000);
      } else if (data.status === 'error') {
        toast.error('Processing Error', {
          duration: 5000,
          description: 'An unexpected error occurred'
        });
        resetForm();
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      toast.error('Connection Error', {
        duration: 5000,
        description: 'Lost connection to server. Retrying...'
      });
      
      // The EventSource will automatically try to reconnect
      setStatus('error');
    };

    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    return () => {
      console.log('Cleaning up SSE connection');
      eventSource.close();
    };
  }, [currentVideoId]);

  const resetForm = () => {
    setCurrentVideoId(null)
    setLoading(false)
    setProgress(0)
    setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return

    try {
      setLoading(true)
      setStatus('initializing')
      setProgress(0)

      const response = await fetch('/api/videos/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl: trimmedUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video')
      }

      console.log('Video processing started:', data.video.id)
      setCurrentVideoId(data.video.id)
      setUrl("")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process video'
      toast.error('Processing Error', {
        duration: 5000,
        description: errorMessage
      })
      resetForm()
    }
  }

  const getStatusMessage = (status: ProcessingStatus): string => {
    const messages: Record<ProcessingStatus, string> = {
      idle: 'Submit a YouTube URL to process',
      initializing: 'Initializing...',
      downloading: 'Downloading video audio...',
      uploading: 'Uploading to transcription service...',
      transcribing: 'Transcribing audio...',
      processing: 'Processing transcription...',
      completed: 'Processing complete!',
      error: 'An error occurred'
    }
    return messages[status]
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Process YouTube Video</CardTitle>
        <CardDescription>{getStatusMessage(status)}</CardDescription>
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
                required
                aria-label="YouTube video URL"
                pattern="^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+"
                title="Please enter a valid YouTube video URL"
              />
              <Button 
                type="submit" 
                disabled={loading || !url.trim()}
                className="min-w-[100px]"
                aria-label={loading ? 'Processing video' : 'Process video'}
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
              <Progress 
                value={progress} 
                className="h-2" 
                aria-label="Processing progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% - {getStatusMessage(status)}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 