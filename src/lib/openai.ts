import OpenAI from 'openai';
import { OpenAIError } from '@/types/openai';

// Validate environment variables
const REQUIRED_ENV_VARS = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'OPENAI_MAX_TOKENS',
  'OPENAI_TEMPERATURE',
] as const;

function validateEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Log environment variables (safely)
  console.log('Environment validation:', {
    model: process.env.OPENAI_MODEL,
    maxTokens: process.env.OPENAI_MAX_TOKENS,
    temperature: process.env.OPENAI_TEMPERATURE,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
    apiKeySource: process.env.OPENAI_API_KEY === process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'NEXT_PUBLIC_OPENAI_API_KEY' : 'OPENAI_API_KEY',
    envKeys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
  });
}

// Initialize OpenAI client with error handling
function createOpenAIClient() {
  try {
    validateEnvVars();
    
    // Explicitly use the key from .env.local
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Using API key with prefix:', apiKey?.substring(0, 10) + '...');
    
    const client = new OpenAI({
      apiKey: apiKey,
      timeout: 30000, // 30 seconds
      maxRetries: 3,
    });

    console.log('OpenAI client created successfully');
    return client;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    throw new Error('OpenAI client initialization failed');
  }
}

// Create the client instance
export const openai = createOpenAIClient();

// Helper function to handle OpenAI errors
export function handleOpenAIError(error: unknown): OpenAIError {
  if (error instanceof OpenAI.APIError) {
    return {
      code: error.code || 'unknown',
      message: error.message,
      type: 'api'
    };
  }

  if (error instanceof Error) {
    return {
      code: 'internal_error',
      message: error.message,
      type: 'validation'
    };
  }

  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred',
    type: 'validation'
  };
}

// Configuration constants
export const OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000', 10),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
} as const; 