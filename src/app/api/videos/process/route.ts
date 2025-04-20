import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { downloadAndTranscribe } from '@/lib/api/assembly-ai';
import { processTranscription } from '@/lib/services/openai';
import { OpenAIProcessingError } from '@/lib/services/openai';
import { getYouTubeVideoId } from '@/lib/utils';
import { updateVideoStatus } from '@/app/api/videos/status/route';

export async function POST(request: Request) {
  try {
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

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create video record
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: session.user.id,
        youtube_url: youtubeUrl,
        status: 'initializing',
        progress: 0
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
      try {
        const progressCallback = async (progress: number, status: string, error?: string) => {
          // Update in-memory status
          updateVideoStatus(video.id, progress, status);
          
          // Log progress to terminal
          console.log(`Progress update for video ${video.id}: ${progress}% - ${status}`);
        };

        // Step 1: Download and transcribe with AssemblyAI
        await progressCallback(10, 'downloading');
        const transcriptionResult = await downloadAndTranscribe(
          youtubeUrl,
          progressCallback
        );

        if (!transcriptionResult || !transcriptionResult.text) {
          throw new Error('Failed to transcribe video');
        }

        // Update status for OpenAI processing
        await progressCallback(80, 'processing');

        // Get the latest schema from the database
        const { data: schemaData, error: schemaError } = await supabase
          .from('json_schemas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (schemaError) {
          console.error('Error fetching schema:', schemaError);
          throw new Error('Failed to fetch output schema');
        }

        // Parse the schema
        const outputSchema = JSON.parse(schemaData.schema);

        // Step 2: Process with OpenAI
        const systemPrompt = `Analyze the following video transcription and extract key information. 
          Format the response according to the provided schema structure.`;

        const openaiResult = await processTranscription(
          transcriptionResult.text,
          systemPrompt,
          outputSchema
        );

        if (openaiResult.error) {
          throw new OpenAIProcessingError(
            openaiResult.error,
            openaiResult.code || 'unknown',
            openaiResult.type || 'api'
          );
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
            progress: 100
          })
          .eq('id', video.id);

        if (finalUpdateError) {
          console.error('Error updating final video state:', finalUpdateError);
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

        // Update error in database
        await supabase
          .from('videos')
          .update({
            status: 'error',
            ...errorDetails,
            progress: 0
          })
          .eq('id', video.id);
      }
    })();

    return NextResponse.json({ video });

  } catch (error) {
    console.error('Error in video processing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 