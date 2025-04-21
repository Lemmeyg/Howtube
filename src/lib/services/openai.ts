import { openai, OPENAI_CONFIG } from '@/lib/openai';
import { OpenAIRequest, OpenAIResponse } from '@/types/openai';
import { APIError } from 'openai';

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

// Function to split text into chunks that respect sentence boundaries
function splitIntoChunks(text: string, maxTokens: number): string[] {
  // Estimate tokens (4 chars per token is a rough estimate)
  const charsPerChunk = maxTokens * 4;
  
  // Split into sentences first
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > charsPerChunk && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Function to merge processed chunks
function mergeChunks(chunks: any[]): any {
  if (chunks.length === 0) return {};
  if (chunks.length === 1) return chunks[0];

  const merged = { ...chunks[0] };

  // Merge sections arrays
  merged.sections = chunks.reduce((acc, chunk) => {
    if (chunk.sections && Array.isArray(chunk.sections)) {
      return [...acc, ...chunk.sections];
    }
    return acc;
  }, []);

  // Merge keywords arrays
  merged.keywords = Array.from(new Set(
    chunks.reduce((acc, chunk) => {
      if (chunk.keywords && Array.isArray(chunk.keywords)) {
        return [...acc, ...chunk.keywords];
      }
      return acc;
    }, [])
  ));

  return merged;
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

    // Split transcription into chunks if it's too long
    const chunks = splitIntoChunks(transcription, OPENAI_CONFIG.maxTokens / 2); // Leave room for response
    const processedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFirstChunk = i === 0;
      const isLastChunk = i === chunks.length - 1;

      // Modify system prompt based on chunk position
      const chunkPrompt = `
        ${systemPrompt}
        
        ${chunks.length > 1 ? `This is part ${i + 1} of ${chunks.length} of the transcription.
        ${isFirstChunk ? 'Focus on the introduction and first sections.' :
          isLastChunk ? 'Focus on concluding sections and overall summary.' :
          'Focus on the content in this section.'}` : ''}

        You MUST format your response exactly according to this JSON schema:
        ${JSON.stringify(outputSchema, null, 2)}

        Guidelines:
        1. The response must be valid JSON that matches the schema exactly
        2. All required fields must be included
        3. Break down the content into logical sections
        4. Each section should have clear, actionable steps
        5. Include specific materials needed for each step
        6. Estimate durations for steps when possible
        7. Set an appropriate difficulty level
        8. Add relevant keywords for searchability
        
        Your task is to structure the video content in a way that makes it easy to follow and implement.
      `;

      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: chunkPrompt
          },
          {
            role: "user",
            content: chunk
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
      });

      // Validate response
      if (!completion.choices[0]?.message?.content) {
        throw new OpenAIProcessingError(
          `Empty response from OpenAI for chunk ${i + 1}`,
          'empty_response',
          'api'
        );
      }

      let content;
      try {
        content = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        throw new OpenAIProcessingError(
          `Invalid JSON response from OpenAI for chunk ${i + 1}`,
          'invalid_json',
          'api'
        );
      }

      processedChunks.push(content);
    }

    // Merge chunks if necessary
    const mergedContent = mergeChunks(processedChunks);

    // Validate against schema if provided
    if (outputSchema && Object.keys(outputSchema).length > 0) {
      const { validateVideoContent } = require('@/components/document-editor/transformers/schema-validator');
      const validation = validateVideoContent(mergedContent);
      if (!validation.success) {
        throw new OpenAIProcessingError(
          `Invalid response structure: ${validation.error}`,
          'schema_validation_failed',
          'validation'
        );
      }
      const validatedContent = validation.data;
      return {
        content: validatedContent,
        error: undefined
      };
    }
    
    return {
      content: mergedContent,
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
    if (error instanceof APIError) {
      const errorType = 
        (error as APIError).status === 429 ? 'rate_limit' :
        (error as APIError).status === 400 ? 'invalid_request' :
        (error as APIError).status === 403 ? 'content_filter' :
        'api';

      return {
        content: {},
        error: error.message,
        code: error.code || 'unknown',
        type: errorType
      };
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
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