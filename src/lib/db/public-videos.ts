import { supabase } from '@/lib/supabase/client'

export async function syncPublicVideos(videoIds: string[]) {
  try {
    const { data, error } = await supabase
      .rpc('sync_public_videos', {
        selected_video_ids: videoIds
      })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error syncing public videos:', error)
    return { success: false, error }
  }
}

export async function getPublicVideos() {
  try {
    const { data, error } = await supabase
      .from('public_videos')
      .select(`
        id,
        video_id,
        title,
        description,
        youtube_url,
        featured,
        display_order
      `)
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching public videos:', error)
    return { success: false, error }
  }
} 