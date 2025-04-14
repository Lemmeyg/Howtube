import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { downloadAndTranscribe } from '@/lib/api/assembly-ai';
import { processTranscription } from '@/lib/services/openai';
import { OpenAIProcessingError } from '@/lib/services/openai';

export async function POST(request: Request) {
  try {
    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
        status: 'processing',
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
        const progressCallback = async (progress: number) => {
          await supabase
            .from('videos')
            .update({ progress })
            .eq('id', video.id);
        };

        // Download and transcribe
        const transcription = await downloadAndTranscribe(
          youtubeUrl,
          progressCallback
        );

        if (!transcription) {
          throw new Error('Failed to transcribe video');
        }

        // Process with OpenAI
        const systemPrompt = `Analyze the following video transcription and extract key information. 
          Focus on main topics, key points, and actionable insights. 
          Format the response as a structured JSON object.`;

        const openaiResult = await processTranscription(
          transcription,
          systemPrompt,
          {} // TODO: Add schema validation
        );

        if (openaiResult.error) {
          console.error('OpenAI processing error:', openaiResult);
          
          // Update video with error details
          await supabase
            .from('videos')
            .update({
              status: 'error',
              error: openaiResult.error,
              error_code: openaiResult.code,
              error_type: openaiResult.type,
              progress: 100
            })
            .eq('id', video.id);
          
          return;
        }

        // Update video with results
        await supabase
          .from('videos')
          .update({
            status: 'completed',
            transcription,
            openai_result: openaiResult.content,
            progress: 100
          })
          .eq('id', video.id);

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
            progress: 100
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