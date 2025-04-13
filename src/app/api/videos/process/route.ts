import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { downloadYouTubeAudio, uploadAudioFile, transcribeAudio, pollTranscriptionResult } from '@/lib/api/assembly-ai';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Get the auth cookie directly
    const cookieStore = cookies();
    const supabaseAuthCookie = await cookieStore.get('sb-mjdlpvrmqpgxkhdfjwxv-auth-token');
    
    if (!supabaseAuthCookie?.value) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Initialize Supabase client with cookie value
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => {
        return {
          get(name: string) {
            if (name === 'sb-mjdlpvrmqpgxkhdfjwxv-auth-token') {
              return supabaseAuthCookie;
            }
            return cookieStore.get(name);
          },
          getAll: () => Array.from(cookieStore.getAll())
        };
      }
    });

    // Check if user is authenticated
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a new video record
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        user_id: session.user.id,
        youtube_url: youtubeUrl,
        status: 'processing'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }

    try {
      // Download the YouTube audio
      console.log('Starting YouTube audio download...');
      const audioPath = await downloadYouTubeAudio(youtubeUrl);
      console.log('Audio downloaded successfully:', audioPath);
      
      // Upload to AssemblyAI
      console.log('Uploading audio to AssemblyAI...');
      const uploadUrl = await uploadAudioFile(audioPath);
      console.log('Audio uploaded successfully');
      
      // Start transcription
      console.log('Starting transcription...');
      const transcription = await transcribeAudio(uploadUrl);
      console.log('Transcription started, ID:', transcription.id);
      
      // Poll for results
      console.log('Polling for transcription results...');
      const result = await pollTranscriptionResult(transcription.id);
      console.log('Transcription completed');

      // Update video record with transcription
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          status: 'completed',
          transcription: result.text,
          processed_content: result
        })
        .eq('id', video.id);

      if (updateError) {
        throw new Error('Failed to update video record');
      }

      return NextResponse.json({ 
        success: true, 
        video: { 
          id: video.id, 
          status: 'completed',
          transcription: result.text 
        } 
      });
    } catch (error) {
      console.error('Error in video processing:', error);
      
      // Update video record with error
      await supabase
        .from('videos')
        .update({
          status: 'error',
          error_message: error.message || 'Unknown error occurred'
        })
        .eq('id', video.id);

      return NextResponse.json({ 
        error: 'Video processing failed', 
        details: error.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 