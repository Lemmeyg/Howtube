import { JsonSchema } from './json-schema';

export interface OpenAIRequest {
  transcription: string;
  systemPrompt: string;
  outputSchema: JsonSchema;
}

export interface OpenAIResponse {
  content: Record<string, any>;
  error?: string;
}

export interface OpenAIError {
  code: string;
  message: string;
  type: 'api' | 'validation' | 'timeout';
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  schema: JsonSchema;
} 