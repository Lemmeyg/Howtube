"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface Prompt {
  id: string
  name: string
  content: string
  created_at: string
  updated_at: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [newPrompt, setNewPrompt] = useState({ name: '', content: '' })
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Load prompts on mount
  useState(() => {
    loadPrompts()
  })

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrompts(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrompt = async (prompt: Prompt) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          name: prompt.name,
          content: prompt.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Prompt updated successfully",
      })
      setEditingPrompt(null)
      loadPrompts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      })
    }
  }

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('prompts')
        .insert({
          name: newPrompt.name,
          content: newPrompt.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Prompt created successfully",
      })
      setNewPrompt({ name: '', content: '' })
      loadPrompts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Prompts</h1>
        <p className="text-muted-foreground">
          Manage the prompts used for document generation
        </p>
      </div>

      {/* New Prompt Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Create New Prompt</h2>
        <form onSubmit={handleCreatePrompt} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">Name</Label>
            <Input
              id="new-name"
              value={newPrompt.name}
              onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-content">Content</Label>
            <Textarea
              id="new-content"
              value={newPrompt.content}
              onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
              required
              className="min-h-[200px] font-mono"
            />
          </div>
          <Button type="submit">Create Prompt</Button>
        </form>
      </div>

      {/* Existing Prompts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Prompts</h2>
        {prompts.map((prompt) => (
          <div key={prompt.id} className="space-y-4 border p-4 rounded-lg">
            {editingPrompt?.id === prompt.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${prompt.id}`}>Name</Label>
                  <Input
                    id={`name-${prompt.id}`}
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`content-${prompt.id}`}>Content</Label>
                  <Textarea
                    id={`content-${prompt.id}`}
                    value={editingPrompt.content}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                    className="min-h-[200px] font-mono"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSavePrompt(editingPrompt)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{prompt.name}</h3>
                  <Button variant="outline" onClick={() => setEditingPrompt(prompt)}>
                    Edit
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
                  {prompt.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 