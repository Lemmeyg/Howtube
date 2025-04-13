import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { downloadAndTranscribe } from '@/lib/api/assembly-ai';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Initialize Supabase client with cookies
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    });

    // Get the current user's session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create initial video record
    const { data: video, error: insertError } = await supabase
      .from('videos')
      .insert({
        user_id: session.user.id,
        youtube_url: youtubeUrl,
        status: 'processing',
        progress: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating video record:', insertError);
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }

    // Start processing in the background
    (async () => {
      const backgroundSupabase = createServerComponentClient({
        cookies: () => cookieStore
      });

      try {
        const result = await downloadAndTranscribe(
          youtubeUrl,
          async (progress, status, error) => {
            console.log(`[${new Date().toISOString()}] Updating progress: ${progress}%, status: ${status}`);
            try {
              const { data, error: updateError } = await backgroundSupabase
                .from('videos')
                .update({
                  progress,
                  status,
                  error_message: error,
                  updated_at: new Date().toISOString()
                })
                .eq('id', video.id)
                .select()
                .single();

              if (updateError) {
                console.error('Error updating video progress:', updateError);
              } else {
                console.log(`[${new Date().toISOString()}] Successfully updated video:`, {
                  id: video.id,
                  progress: data.progress,
                  status: data.status
                });
              }
            } catch (updateError) {
              console.error('Error in progress update:', updateError);
            }
          }
        );

        // Update with final transcription result
        console.log('Transcription completed, updating final status');
        const { data: finalUpdate, error: finalError } = await backgroundSupabase
          .from('videos')
          .update({
            status: 'completed',
            transcription: result.text,
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id)
          .select()
          .single();

        if (finalError) {
          console.error('Error updating final status:', finalError);
        } else {
          console.log('Successfully updated final status:', finalUpdate);
        }

      } catch (error) {
        console.error('Error processing video:', error);
        // Update video record with error
        await backgroundSupabase
          .from('videos')
          .update({
            status: 'error',
            error_message: error.message,
            progress: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);
      }
    })();

    // Return immediate response with video ID
    return NextResponse.json({
      message: 'Video processing started',
      videoId: video.id
    });
  } catch (error) {
    console.error('Error in video processing route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 