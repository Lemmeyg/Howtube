import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { downloadAndTranscribe } from '@/lib/api/assembly-ai';
import { processTranscription } from '@/lib/services/openai';
import { OpenAIProcessingError } from '@/lib/services/openai';
import { getYouTubeVideoId } from '@/lib/utils';
import { updateVideoStatus } from '@/app/api/videos/status/route';
import { DEFAULT_OUTPUT_SCHEMA } from '@/lib/constants/schemas';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retryOperation(operation, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
  
    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create video record with basic status tracking for now
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: session.user.id,
        youtube_url: youtubeUrl,
        status: 'initializing',
        progress: 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (videoError) {
      console.error('Error creating video record:', videoError);
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      );
    }

    // Process video in background
    (async () => {
      const updateStatus = async (status: string, progress: number, error?: any) => {
        // Update video record with status and progress
        await supabase
          .from('videos')
          .update({
            status,
            progress,
            updated_at: new Date().toISOString(),
            ...(error && { 
              error: error.message || JSON.stringify(error),
              error_code: error.code || 'unknown',
              error_type: error.type || 'processing'
            })
          })
          .eq('id', video.id);

        // Update in-memory status
        updateVideoStatus(video.id, progress, status);
      };

      try {
        const progressCallback = async (progress: number, status: string, error?: string) => {
          await updateStatus(status, progress, error ? { message: error } : undefined);
        };

        // Step 1: Download and transcribe with AssemblyAI
        await progressCallback(10, 'downloading');
        const transcriptionResult = await retryOperation(async () => {
          const result = await downloadAndTranscribe(youtubeUrl, progressCallback);
          if (!result || !result.text) {
            throw new Error('Transcription failed or returned empty result');
          }
          return result;
        });

        await progressCallback(80, 'processing');

        // Get the latest schema from the database with fallback
        const { data: schemaData, error: schemaError } = await supabase
          .from('json_schemas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        let outputSchema = DEFAULT_OUTPUT_SCHEMA;
        if (!schemaError && schemaData?.schema) {
          try {
            outputSchema = JSON.parse(schemaData.schema);
          } catch (parseError) {
            console.warn('Failed to parse database schema, using default:', parseError);
            await updateStatus(
              'warning',
              'Failed to parse database schema, using default schema',
              parseError
            );
          }
        }

        // Step 2: Process with OpenAI with retry logic
        const systemPrompt = `Analyze the following video transcription and extract key information.
Format the response according to the provided schema structure.

Required fields:
1. title: A clear, concise title for the tutorial
2. summary: A brief overview of what the tutorial covers
3. sections: An array of sections, each containing:
   - title: Section heading
   - content: Section overview
   - steps: Array of steps, each containing:
     - description: What to do
     - details: How to do it
     Optional step fields:
     - title: Step title
     - duration: Estimated time
     - materials: Array of required items
4. difficulty: One of: 'beginner', 'intermediate', 'advanced'
5. keywords: Array of relevant search terms

Be thorough and detailed in your analysis.
Break down complex steps into smaller, manageable parts.
Include any relevant technical terms, tools, or materials mentioned.`;

        const openaiResult = await retryOperation(async () => {
          const result = await processTranscription(
            transcriptionResult.text,
            systemPrompt,
            outputSchema
          );

          if (result.error) {
            throw new OpenAIProcessingError(
              result.error,
              result.code || 'unknown',
              result.type || 'api'
            );
          }

          return result;
        });

        // Validate OpenAI response
        if (!openaiResult.content || Object.keys(openaiResult.content).length === 0) {
          throw new Error('OpenAI returned empty or invalid content');
        }

        // Update final status
        await progressCallback(100, 'completed');

        // Update video with results in database
        const { error: finalUpdateError } = await supabase
          .from('videos')
          .update({
            transcription: transcriptionResult,
            processed_content: openaiResult.content,
            status: 'completed',
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (finalUpdateError) {
          console.error('Error updating final video state:', finalUpdateError);
          await updateStatus(
            'error',
            'Failed to save final results',
            finalUpdateError
          );
        }

      } catch (error) {
        console.error('Error processing video:', error);
        
        const errorDetails = error instanceof OpenAIProcessingError
          ? {
              error: error.message,
              error_code: error.code,
              error_type: error.type
            }
          : {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              error_code: 'unknown',
              error_type: 'processing'
            };

        // Update error status in memory
        updateVideoStatus(video.id, 0, 'error');

        // Log the error
        await updateStatus(
          'error',
          'Processing failed',
          errorDetails
        );

        // Update error in database
        await supabase
          .from('videos')
          .update({
            status: 'error',
            ...errorDetails,
            progress: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);
      }
    })();

    return NextResponse.json({ video });

  } catch (error) {
    console.error('Error in video processing route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 