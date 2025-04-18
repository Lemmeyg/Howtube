"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Prompt {
  id: string
  type: 'system' | 'user' | 'assistant'
  content: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Load prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')

        if (error) throw error

        // Convert array to record by type
        const promptsRecord = data?.reduce((acc, prompt) => ({
          ...acc,
          [prompt.type]: prompt
        }), {} as Record<string, Prompt>)

        setPrompts(promptsRecord || {})
      } catch (error) {
        console.error('Error loading prompts:', error)
        toast({
          title: "Error",
          description: "Failed to load prompts",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPrompts()
  }, [supabase, toast])

  const handleSavePrompt = async (type: 'system' | 'user' | 'assistant') => {
    try {
      const content = prompts[type]?.content || ''
      const name = `${type}_prompt`
      
      if (!content.trim()) {
        toast({
          title: "Error",
          description: "Prompt content cannot be empty",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from('prompts')
        .upsert({
          id: prompts[type]?.id || undefined,
          type,
          content,
          name,
          description: `Default ${type} prompt`,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setPrompts(prev => ({
        ...prev,
        [type]: data as Prompt
      }))

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} prompt saved successfully`,
      })
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading prompts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Prompts</CardTitle>
          <CardDescription>
            Manage the prompts used for processing video transcriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Prompt */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                placeholder="Enter the system prompt..."
                value={prompts.system?.content || ''}
                onChange={(e) => setPrompts(prev => ({
                  ...prev,
                  system: { ...prev.system, content: e.target.value } as Prompt
                }))}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                This prompt sets the behavior and context for the AI system.
              </p>
            </div>
            <Button onClick={() => handleSavePrompt('system')}>
              Save System Prompt
            </Button>
          </div>

          {/* User Prompt */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userPrompt">User Prompt</Label>
              <Textarea
                id="userPrompt"
                placeholder="Enter the user prompt..."
                value={prompts.user?.content || ''}
                onChange={(e) => setPrompts(prev => ({
                  ...prev,
                  user: { ...prev.user, content: e.target.value } as Prompt
                }))}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                This prompt represents the user&apos;s request or query format.
              </p>
            </div>
            <Button onClick={() => handleSavePrompt('user')}>
              Save User Prompt
            </Button>
          </div>

          {/* Assistant Prompt */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assistantPrompt">Assistant Prompt</Label>
              <Textarea
                id="assistantPrompt"
                placeholder="Enter the assistant prompt..."
                value={prompts.assistant?.content || ''}
                onChange={(e) => setPrompts(prev => ({
                  ...prev,
                  assistant: { ...prev.assistant, content: e.target.value } as Prompt
                }))}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                This prompt guides how the assistant should respond and format its output.
              </p>
            </div>
            <Button onClick={() => handleSavePrompt('assistant')}>
              Save Assistant Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 