"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Prompt {
  id: string
  name: string
  content: string
  description: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export function PromptManager() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    description: ""
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadPrompts()
  }, [])

  async function loadPrompts() {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrompts(data || [])
    } catch (error) {
      console.error('Error loading prompts:', error)
      toast.error('Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('prompts')
          .update({
            name: formData.name,
            content: formData.content,
            description: formData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Prompt updated successfully')
      } else {
        const { error } = await supabase
          .from('prompts')
          .insert([
            {
              name: formData.name,
              content: formData.content,
              description: formData.description,
              is_active: true
            }
          ])

        if (error) throw error
        toast.success('Prompt created successfully')
      }

      setEditingId(null)
      setFormData({ name: "", content: "", description: "" })
      loadPrompts()
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Prompt deleted successfully')
      loadPrompts()
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }

  function handleEdit(prompt: Prompt) {
    setEditingId(prompt.id)
    setFormData({
      name: prompt.name,
      content: prompt.content,
      description: prompt.description
    })
  }

  if (loading) {
    return <div>Loading prompts...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Prompt' : 'Create New Prompt'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter prompt name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter prompt description"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter prompt content"
                required
                rows={5}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Update Prompt' : 'Create Prompt'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingId(null)
                  setFormData({ name: "", content: "", description: "" })
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{prompt.name}</h3>
                  <p className="text-sm text-muted-foreground">{prompt.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(prompt)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(prompt.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <pre className="bg-muted p-2 rounded-md text-sm whitespace-pre-wrap">
                {prompt.content}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 