import { JsonSchema } from './json-schema';

export interface OpenAIRequest {
  transcription: string;
  systemPrompt: string;
  outputSchema: any;
}

export interface OpenAIResponse {
  content: any;
  error?: string;
  code?: string;
  type?: 'api' | 'validation' | 'timeout' | 'rate_limit' | 'content_filter' | 'invalid_request';
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