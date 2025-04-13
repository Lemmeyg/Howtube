import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const formSchema = z.object({
  youtubeUrl: z.string().url('Please enter a valid YouTube URL'),
})

export function YouTubeUrlForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: '',
    },
  })

  const subscribeToUpdates = async (videoId: string) => {
    const channel = supabase
      .channel(`video-${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`,
        },
        (payload) => {
          const { progress, status, error_message } = payload.new
          setProgress(progress || 0)
          setStatus(status)

          if (status === 'completed') {
            toast({
              title: 'Video Processing Complete',
              description: 'Your video has been successfully processed!',
            })
            setIsSubmitting(false)
            channel.unsubscribe()
          } else if (status === 'error') {
            toast({
              title: 'Error Processing Video',
              description: error_message || 'An unknown error occurred',
              variant: 'destructive',
            })
            setIsSubmitting(false)
            channel.unsubscribe()
          }
        }
      )
      .subscribe()
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setProgress(0)
      setStatus('processing')

      const response = await fetch('/api/videos/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtubeUrl: values.youtubeUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video')
      }

      toast({
        title: 'Processing Started',
        description: 'Your video is being processed. Please wait...',
      })

      await subscribeToUpdates(data.videoId)
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to process video',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="youtubeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          {isSubmitting && (
            <>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {status === 'processing' && 'Processing video...'}
                {status === 'transcribing' && 'Transcribing audio...'}
                {status === 'completed' && 'Processing complete!'}
                {status === 'error' && 'Error processing video'}
              </p>
            </>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Process Video'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 