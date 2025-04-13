export interface JsonSchema {
  id: string;
  name: string;
  description: string;
  schema: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface JsonSchemaFormData {
  name: string;
  description: string;
  schema: string; // JSON string
} 