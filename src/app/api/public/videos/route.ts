import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Fetch featured public videos with their details
    const { data: publicVideos, error } = await supabase
      .from('public_videos')
      .select(`
        id,
        video_id,
        featured,
        display_order,
        videos:video_id (
          youtube_url,
          status,
          processed_content,
          created_at
        )
      `)
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .limit(8);

    if (error) {
      console.error('Error fetching public videos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch public videos' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedVideos = publicVideos
      .filter(video => video.videos?.status === 'completed')
      .map(video => ({
        id: video.video_id,
        youtube_url: video.videos?.youtube_url,
        title: video.videos?.processed_content?.title || 'Untitled',
        description: video.videos?.processed_content?.description || '',
        created_at: video.videos?.created_at,
        display_order: video.display_order
      }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error('Error in public videos route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 