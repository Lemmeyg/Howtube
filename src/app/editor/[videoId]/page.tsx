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
    if (!video) {
      console.log('No video data available');
      return '';
    }
    
    console.log('Getting initial content for video:', video);
    
    // Prioritize OpenAI output
    const openAiContent = video.openai_output;
    console.log('OpenAI content:', openAiContent);
    
    if (!openAiContent) {
      console.log('No OpenAI content found');
      return '';
    }
    
    try {
      // Parse content if it's a string
      const content = typeof openAiContent === 'string' 
        ? JSON.parse(openAiContent) 
        : openAiContent;
      
      console.log('Parsed OpenAI content:', content);

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

      // Add sections with steps
      if (Array.isArray(content.sections)) {
        content.sections.forEach(section => {
          html += `<h2>${section.title}</h2>`;
          if (section.content) {
            html += `<p>${section.content}</p>`;
          }
          
          if (Array.isArray(section.steps)) {
            html += '<ol>';
            section.steps.forEach(step => {
              html += '<li>';
              if (step.title) {
                html += `<h4>${step.title}</h4>`;
              }
              html += `<p>${step.description}</p>`;
              if (step.duration) {
                html += `<p class="duration"><em>Duration: ${step.duration}</em></p>`;
              }
              if (Array.isArray(step.materials) && step.materials.length > 0) {
                html += '<p><strong>Materials for this step:</strong></p><ul>';
                step.materials.forEach(material => {
                  html += `<li>${material}</li>`;
                });
                html += '</ul>';
              }
              html += '</li>';
            });
            html += '</ol>';
          }
        });
      }

      // Add materials section if exists
      if (Array.isArray(content.materials) && content.materials.length > 0) {
        html += '<h2>Materials Needed</h2><ul>';
        content.materials.forEach(material => {
          let materialText = material.name;
          if (material.quantity) {
            materialText += ` (${material.quantity})`;
          }
          if (material.notes) {
            materialText += ` - ${material.notes}`;
          }
          html += `<li>${materialText}</li>`;
        });
        html += '</ul>';
      }

      // Add metadata if exists
      if (content.timeEstimate || content.difficulty) {
        html += '<div class="metadata">';
        if (content.timeEstimate) {
          html += `<p><strong>Time Estimate:</strong> ${content.timeEstimate}</p>`;
        }
        if (content.difficulty) {
          html += `<p><strong>Difficulty:</strong> ${content.difficulty}</p>`;
        }
        html += '</div>';
      }

      // Add keywords if exist
      if (Array.isArray(content.keywords) && content.keywords.length > 0) {
        html += '<div class="keywords">';
        html += '<h3>Keywords</h3>';
        html += '<ul>';
        content.keywords.forEach(keyword => {
          html += `<li>${keyword}</li>`;
        });
        html += '</ul></div>';
      }

      html += '</div>';
      console.log('Generated HTML:', html);
      return html;
    } catch (error) {
      console.error('Error parsing OpenAI content:', error);
      console.log('Raw OpenAI content that failed to parse:', openAiContent);
      return `<div><p>Error parsing content. Please check the console for details.</p></div>`;
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
              // TODO: Implement save functionality
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