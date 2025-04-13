import { supabase } from '@/lib/supabase';
import { JsonSchema, JsonSchemaFormData } from '@/types/json-schema';

export const jsonSchemaService = {
  async getAll(): Promise<JsonSchema[]> {
    const { data, error } = await supabase
      .from('json_schemas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id: string): Promise<JsonSchema> {
    const { data, error } = await supabase
      .from('json_schemas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async create(schema: JsonSchemaFormData): Promise<JsonSchema> {
    const { data, error } = await supabase
      .from('json_schemas')
      .insert([schema])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(id: string, schema: JsonSchemaFormData): Promise<JsonSchema> {
    const { data, error } = await supabase
      .from('json_schemas')
      .update(schema)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('json_schemas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('json_schemas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'json_schemas',
        },
        callback
      )
      .subscribe();
  },
}; 