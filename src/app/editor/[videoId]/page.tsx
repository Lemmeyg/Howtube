'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DocumentEditor } from '@/components/document-editor';
import { FeatureToggles } from '@/components/document-editor/feature-toggles';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoContent {
  id: string;
  youtube_url: string;
  transcription: string | null;
  openai_output: any;
  content?: string; // Add this field as it might be stored differently
}

export default function EditorPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log('Fetching video with ID:', videoId);
        
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (error) throw error;
        
        console.log('Raw video data:', data);
        console.log('OpenAI output type:', typeof data.openai_output);
        console.log('OpenAI output:', data.openai_output);
        console.log('Content field:', data.content);
        console.log('Transcription:', data.transcription);
        
        setVideo(data);
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

  // Convert OpenAI output to editor content
  const getInitialContent = () => {
    if (!video) return '';
    
    console.log('Getting initial content for video:', video);
    
    // Try different possible content fields
    const possibleContent = video.content || video.openai_output || video.transcription;
    
    if (!possibleContent) {
      console.log('No content found in any field');
      return '';
    }
    
    try {
      // If it's a string, try to parse it as JSON
      const content = typeof possibleContent === 'string' 
        ? JSON.parse(possibleContent) 
        : possibleContent;
      
      console.log('Parsed content:', content);

      // Convert the content object to HTML
      let html = '<div>';
      
      // Add title if exists
      if (content.title) {
        html += `<h1>${content.title}</h1>`;
      }

      // Add description if exists
      if (content.description) {
        html += `<p>${content.description}</p>`;
      }

      // Add steps if they exist
      if (Array.isArray(content.steps)) {
        html += '<h2>Steps</h2><ol>';
        content.steps.forEach((step: any) => {
          html += `<li>${step.description || step}</li>`;
        });
        html += '</ol>';
      }

      // Add materials if they exist
      if (Array.isArray(content.materials)) {
        html += '<h2>Materials Needed</h2><ul>';
        content.materials.forEach((material: any) => {
          html += `<li>${material}</li>`;
        });
        html += '</ul>';
      }

      // If no structured content was found, use the raw content
      if (html === '<div>') {
        html += `<p>${String(possibleContent)}</p>`;
      }

      html += '</div>';
      console.log('Generated HTML:', html);
      return html;
    } catch (error) {
      console.error('Error parsing content:', error);
      // Return the raw content as a fallback
      return `<p>${String(possibleContent)}</p>`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Video not found</p>
      </div>
    );
  }

  const editorContent = getInitialContent();
  console.log('Final editor content:', editorContent);

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Document Editor</h1>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
        <Card className="p-4 min-h-[calc(100vh-8rem)]">
          <DocumentEditor
            initialContent={editorContent}
            onSave={(content) => {
              console.log('Saving content:', content);
            }}
          />
        </Card>
        <div className="space-y-4">
          <FeatureToggles />
        </div>
      </div>
    </div>
  );
} 