'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VideoContent {
  id: string;
  youtube_url: string;
  processed_content: any;
}

export default function PreviewPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // First check if this video is public
        const { data: publicVideo, error: publicError } = await supabase
          .from('public_videos')
          .select('video_id')
          .eq('video_id', videoId)
          .single();

        if (publicError || !publicVideo) {
          throw new Error('Video not found or not public');
        }

        // Then fetch the video details
        const { data: video, error } = await supabase
          .from('videos')
          .select('id, youtube_url, processed_content')
          .eq('id', publicVideo.video_id)
          .single();

        if (error) throw error;
        setVideo(video);
      } catch (error) {
        console.error('Error fetching video:', error);
        toast({
          title: 'Error',
          description: 'Failed to load video content',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, supabase, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
        <p className="text-muted-foreground">
          This video may not be available or may have been removed.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  const videoId = video.youtube_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

  return (
    <div className="container mx-auto p-6">
      <Button asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert">
              <h2>{video.processed_content?.title}</h2>
              <p>{video.processed_content?.description}</p>
              
              {video.processed_content?.sections?.map((section: any, index: number) => (
                <div key={index} className="mb-6">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                  {section.steps && (
                    <ol>
                      {section.steps.map((step: string, stepIndex: number) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}

              {video.processed_content?.keywords && (
                <div className="mt-6">
                  <h3>Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.processed_content.keywords.map((keyword: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 