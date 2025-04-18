import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { downloadAndTranscribe } from '@/lib/api/assembly-ai';
import { processTranscription } from '@/lib/services/openai';
import { OpenAIProcessingError } from '@/lib/services/openai';
import { getYouTubeVideoId } from '@/lib/utils';

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

    // Properly await cookies() before using it
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
          // Add a small delay to ensure updates are caught by the frontend
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { error: updateError } = await supabase
            .from('videos')
            .update({ 
              progress,
              status,
              ...(error && { error_message: error })
            })
            .eq('id', video.id);

          if (updateError) {
            console.error('Error updating video progress:', updateError);
          }
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

        // Step 2: Process with OpenAI
        const systemPrompt = `Analyze the following video transcription and extract key information. 
          Focus on main topics, key points, and actionable insights. 
          Format the response as a structured JSON object.`;

        const openaiResult = await processTranscription(
          transcriptionResult.text,
          systemPrompt,
          {} // TODO: Add schema validation
        );

        if (openaiResult.error) {
          throw new OpenAIProcessingError(
            openaiResult.error,
            openaiResult.code || 'unknown',
            openaiResult.type || 'api'
          );
        }

        // Update video with results
        await progressCallback(100, 'completed');
        const { error: finalUpdateError } = await supabase
          .from('videos')
          .update({
            transcription: transcriptionResult,
            openai_result: openaiResult.content,
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