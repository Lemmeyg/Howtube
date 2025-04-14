import { openai, OPENAI_CONFIG } from '@/lib/openai';
import { OpenAIRequest, OpenAIResponse } from '@/types/openai';

// Custom error types for OpenAI processing
export class OpenAIProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: 'api' | 'validation' | 'timeout' | 'rate_limit' | 'content_filter' | 'invalid_request'
  ) {
    super(message);
    this.name = 'OpenAIProcessingError';
  }
}

export async function processTranscription(
  transcription: string,
  systemPrompt: string,
  outputSchema: any
): Promise<OpenAIResponse> {
  try {
    // Validate input
    if (!transcription || typeof transcription !== 'string') {
      throw new OpenAIProcessingError(
        'Invalid transcription input',
        'invalid_input',
        'validation'
      );
    }

    if (!systemPrompt || typeof systemPrompt !== 'string') {
      throw new OpenAIProcessingError(
        'Invalid system prompt',
        'invalid_prompt',
        'validation'
      );
    }

    // Check token length
    const estimatedTokens = Math.ceil(transcription.length / 4);
    if (estimatedTokens > OPENAI_CONFIG.maxTokens) {
      throw new OpenAIProcessingError(
        `Transcription too long (${estimatedTokens} tokens). Maximum allowed: ${OPENAI_CONFIG.maxTokens}`,
        'token_limit_exceeded',
        'validation'
      );
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: transcription
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature,
    });

    // Validate response
    if (!completion.choices[0]?.message?.content) {
      throw new OpenAIProcessingError(
        'Empty response from OpenAI',
        'empty_response',
        'api'
      );
    }

    let content;
    try {
      content = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      throw new OpenAIProcessingError(
        'Invalid JSON response from OpenAI',
        'invalid_json',
        'api'
      );
    }

    // Validate against schema if provided
    if (outputSchema && Object.keys(outputSchema).length > 0) {
      // TODO: Implement schema validation
      console.log('Schema validation not yet implemented');
    }
    
    return {
      content,
      error: undefined
    };
  } catch (error) {
    console.error('Error processing transcription with OpenAI:', error);

    if (error instanceof OpenAIProcessingError) {
      return {
        content: {},
        error: error.message,
        code: error.code,
        type: error.type
      };
    }

    // Handle specific OpenAI API errors
    if (error instanceof openai.APIError) {
      const errorType = 
        error.status === 429 ? 'rate_limit' :
        error.status === 400 ? 'invalid_request' :
        error.status === 403 ? 'content_filter' :
        'api';

      return {
        content: {},
        error: error.message,
        code: error.code || 'unknown',
        type: errorType
      };
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      return {
        content: {},
        error: 'Request timed out',
        code: 'timeout',
        type: 'timeout'
      };
    }

    // Generic error
    return {
      content: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'unknown',
      type: 'api'
    };
  }
} 