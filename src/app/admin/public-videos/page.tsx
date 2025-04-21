'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Check, X } from "lucide-react";
import { syncPublicVideos } from '@/lib/db/public-videos';

interface Video {
  id: string;
  youtube_url: string;
  status: string;
  created_at: string;
  processed_content: {
    title?: string;
    description?: string;
  };
  is_public?: boolean;
}

export default function PublicVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAndFetchVideos = async () => {
      try {
        // Check if user is admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/sign-in');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: 'Error',
            description: 'Failed to verify admin status',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }

        if (!profile || !profile.is_admin) {
          toast({
            title: 'Access Denied',
            description: 'You do not have admin privileges',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);

        // Fetch all videos and their public status
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select(`
            id,
            youtube_url,
            status,
            created_at,
            processed_content,
            public_videos!left (
              id
            )
          `)
          .order('created_at', { ascending: false });

        if (videosError) throw videosError;

        const formattedVideos = videosData.map(video => ({
          ...video,
          is_public: !!video.public_videos?.[0]
        }));

        setVideos(formattedVideos);

        // Initialize selected videos with currently public ones
        const publicVideoIds = new Set(
          formattedVideos
            .filter(v => v.is_public)
            .map(v => v.id)
        );
        setSelectedVideos(publicVideoIds);

      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load videos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchVideos();
  }, [supabase, router, toast]);

  const handleToggleVideo = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      const { success, error } = await syncPublicVideos(Array.from(selectedVideos));

      if (!success) {
        throw new Error(error instanceof Error ? error.message : 'Failed to sync public videos');
      }

      toast({
        title: 'Success',
        description: 'Public videos updated successfully',
      });

      // Refresh the data
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          youtube_url,
          status,
          created_at,
          processed_content,
          public_videos!left (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      const formattedVideos = videosData.map(video => ({
        ...video,
        is_public: !!video.public_videos?.[0]
      }));

      setVideos(formattedVideos);

    } catch (error) {
      console.error('Error syncing public videos:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync public videos',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin) {
    return null; // Or loading state
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manage Public Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Public</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedVideos.has(video.id)}
                            onCheckedChange={() => handleToggleVideo(video.id)}
                            disabled={video.status !== 'completed'}
                          />
                        </TableCell>
                        <TableCell>
                          {video.processed_content?.title || 'Untitled'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {video.youtube_url}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {video.status === 'completed' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            {video.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(video.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSubmit}>
                  Update Public Videos
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 