"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface JsonSchema {
  id: string
  name: string
  schema: string
  created_at: string
  updated_at: string
}

export default function JsonSchemaPage() {
  const [schemas, setSchemas] = useState<JsonSchema[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSchema, setEditingSchema] = useState<JsonSchema | null>(null)
  const [newSchema, setNewSchema] = useState({ 
    name: '', 
    description: 'Video content structure schema',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    duration: { type: 'string' },
                    materials: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  required: ['title', 'description']
                }
              }
            },
            required: ['title', 'content']
          }
        },
        materials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'string' },
              notes: { type: 'string' }
            },
            required: ['name']
          }
        },
        timeEstimate: { type: 'string' },
        difficulty: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced']
        },
        keywords: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['title', 'description']
    }, null, 2)
  })
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Load schemas on mount
  useEffect(() => {
    loadSchemas()
  }, [])

  const loadSchemas = async () => {
    try {
      const { data, error } = await supabase
        .from('json_schemas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSchemas(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schemas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSchema = async (schema: JsonSchema) => {
    try {
      // Validate JSON
      JSON.parse(schema.schema)

      const { error } = await supabase
        .from('json_schemas')
        .update({
          name: schema.name,
          schema: schema.schema,
          updated_at: new Date().toISOString()
        })
        .eq('id', schema.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Schema updated successfully",
      })
      setEditingSchema(null)
      loadSchemas()
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast({
          title: "Error",
          description: "Invalid JSON format",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update schema",
          variant: "destructive",
        })
      }
    }
  }

  const handleCreateSchema = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Get the current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        throw new Error('You must be logged in to create a schema')
      }

      // Validate JSON
      JSON.parse(newSchema.schema)

      const { error } = await supabase
        .from('json_schemas')
        .insert({
          name: newSchema.name,
          description: newSchema.description,
          schema: JSON.parse(newSchema.schema),
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Schema created successfully",
      })
      setNewSchema({ 
        name: '', 
        description: 'Video content structure schema',
        schema: newSchema.schema
      })
      loadSchemas()
    } catch (error) {
      console.error('Error creating schema:', error)
      if (error instanceof SyntaxError) {
        toast({
          title: "Error",
          description: "Invalid JSON format",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create schema",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">JSON Schemas</h1>
        <p className="text-muted-foreground">
          Manage the JSON schemas used for document structure
        </p>
      </div>

      {/* New Schema Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Create New Schema</h2>
        <form onSubmit={handleCreateSchema} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">Name</Label>
            <Input
              id="new-name"
              value={newSchema.name}
              onChange={(e) => setNewSchema({ ...newSchema, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-description">Description</Label>
            <Input
              id="new-description"
              value={newSchema.description}
              onChange={(e) => setNewSchema({ ...newSchema, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-schema">Schema (JSON)</Label>
            <Textarea
              id="new-schema"
              value={newSchema.schema}
              onChange={(e) => setNewSchema({ ...newSchema, schema: e.target.value })}
              required
              className="min-h-[200px] font-mono"
              placeholder="Enter valid JSON schema..."
            />
          </div>
          <Button type="submit">Create Schema</Button>
        </form>
      </div>

      {/* Existing Schemas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Schemas</h2>
        {schemas.map((schema) => (
          <div key={schema.id} className="space-y-4 border p-4 rounded-lg">
            {editingSchema?.id === schema.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${schema.id}`}>Name</Label>
                  <Input
                    id={`name-${schema.id}`}
                    value={editingSchema.name}
                    onChange={(e) => setEditingSchema({ ...editingSchema, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`schema-${schema.id}`}>Schema (JSON)</Label>
                  <Textarea
                    id={`schema-${schema.id}`}
                    value={editingSchema.schema}
                    onChange={(e) => setEditingSchema({ ...editingSchema, schema: e.target.value })}
                    className="min-h-[200px] font-mono"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingSchema(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSaveSchema(editingSchema)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{schema.name}</h3>
                  <Button variant="outline" onClick={() => setEditingSchema(schema)}>
                    Edit
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
                  {schema.schema}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 