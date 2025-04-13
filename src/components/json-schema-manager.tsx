'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jsonSchemaService } from '@/lib/services/json-schema';
import { JsonSchema, JsonSchemaFormData } from '@/types/json-schema';
import { toast } from 'sonner';

export function JsonSchemaManager() {
  const [schemas, setSchemas] = useState<JsonSchema[]>([]);
  const [formData, setFormData] = useState<JsonSchemaFormData>({
    name: '',
    schema: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSchemas();
    const subscription = jsonSchemaService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setSchemas((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setSchemas((prev) =>
          prev.map((schema) =>
            schema.id === payload.new.id ? payload.new : schema
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setSchemas((prev) => prev.filter((schema) => schema.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSchemas = async () => {
    try {
      const data = await jsonSchemaService.getAll();
      setSchemas(data);
    } catch (error) {
      toast.error('Failed to load schemas');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await jsonSchemaService.update(editingId, formData);
        toast.success('Schema updated successfully');
      } else {
        await jsonSchemaService.create(formData);
        toast.success('Schema created successfully');
      }
      setFormData({ name: '', schema: '' });
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save schema');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schema: JsonSchema) => {
    setFormData({
      name: schema.name,
      schema: schema.schema,
    });
    setEditingId(schema.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await jsonSchemaService.delete(id);
      toast.success('Schema deleted successfully');
    } catch (error) {
      toast.error('Failed to delete schema');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Schema' : 'Create New Schema'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Schema Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="JSON Schema"
                value={formData.schema}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, schema: e.target.value }))
                }
                required
                className="min-h-[200px] font-mono"
              />
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({ name: '', schema: '' });
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {schemas.map((schema) => (
          <Card key={schema.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{schema.name}</CardTitle>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(schema)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(schema.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto">
                {schema.schema}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 