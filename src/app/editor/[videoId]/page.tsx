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
import { getUserSubscriptionTier } from '@/lib/auth/subscription';
import { useFeatureToggles } from '@/lib/stores/feature-toggles';

interface VideoContent {
  id: string;
  youtube_url: string;
  transcription: string | null;
  processed_content: any;
  content?: string;
}

export default function EditorPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const { setUserTier } = useFeatureToggles();

  // Check user's subscription on mount
  useEffect(() => {
    async function checkSubscription() {
      const tier = await getUserSubscriptionTier();
      setUserTier(tier);
    }
    checkSubscription();
  }, [setUserTier]);

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
        console.log('Processed content type:', typeof data.processed_content);
        console.log('Processed content:', data.processed_content);
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

  // Convert processed content to editor content
  const getInitialContent = () => {
    if (!video) {
      console.log('No video data available');
      return '';
    }
    
    console.log('Getting initial content for video:', video);
    
    // Prioritize processed content
    const processedContent = video.processed_content;
    console.log('Processed content:', processedContent);
    
    if (!processedContent) {
      console.log('No processed content found');
      return '';
    }
    
    try {
      // Parse content if it's a string
      const content = typeof processedContent === 'string' 
        ? JSON.parse(processedContent) 
        : processedContent;
      
      console.log('Parsed processed content:', content);

      // Convert the content object to HTML
      let html = '<div>';
      
      // Add main topic as title
      if (content.main_topic) {
        html += `<h1>${content.main_topic}</h1>`;
      }

      // Add company and presenter info
      if (content.company || content.presenter) {
        html += '<div class="metadata">';
        if (content.company) {
          html += `<p><strong>Company:</strong> ${content.company}</p>`;
        }
        if (content.presenter) {
          html += `<p><strong>Presenter:</strong> ${content.presenter}</p>`;
        }
        html += '</div>';
      }

      // Add key points section
      if (Array.isArray(content.key_points) && content.key_points.length > 0) {
        html += '<div class="key-points">';
        html += '<h2>Key Points</h2>';
        html += '<ul>';
        content.key_points.forEach(point => {
          if (typeof point === 'object') {
            // Format different types of key points based on their structure
            if (point.origin && point.tea_selection && point.characteristics) {
              html += `<li>Tea Origin: ${point.origin}, Type: ${point.tea_selection}, Characteristics: ${point.characteristics}</li>`;
            }
            else if (point.participants && point.audience_interaction) {
              html += `<li>Participants: ${point.participants.join(', ')} - ${point.audience_interaction}</li>`;
            }
            else if (point.tea_storage) {
              const storage = point.tea_storage;
              html += `<li>Storage: ${storage.storage_options.join(', ')}${storage.importance_of_freshness ? ' - Freshness is important' : ''}</li>`;
            }
            else if (point.brewing_instructions) {
              const brewing = point.brewing_instructions;
              html += `<li>Brewing: ${brewing.brewing_time}, Water: ${brewing.water_amount}, Tea bags: ${brewing.tea_bags_required}${brewing.Sophie_preference ? `, Sophie's preference: ${brewing.Sophie_preference}` : ''}</li>`;
            }
            else if (point.serving_suggestions) {
              const serving = point.serving_suggestions;
              html += `<li>Serving: ${serving.milk_addition}, ${serving.visual_guidance}</li>`;
            }
            else if (point.personal_experience) {
              html += `<li>Experience: ${point.personal_experience.Sophie_rating}</li>`;
            }
            else {
              // Fallback for any other object structure
              html += `<li>${Object.values(point).join(', ')}</li>`;
            }
          } else {
            // Handle non-object points (strings, etc.)
            html += `<li>${point}</li>`;
          }
        });
        html += '</ul></div>';
      }

      // Add actionable insights section
      if (Array.isArray(content.actionable_insights) && content.actionable_insights.length > 0) {
        html += '<div class="actionable-insights">';
        html += '<h2>Actionable Insights</h2>';
        html += '<ol>';
        content.actionable_insights.forEach(insight => {
          if (typeof insight === 'object') {
            html += `<li>${Object.values(insight).join(', ')}</li>`;
          } else {
            html += `<li>${insight}</li>`;
          }
        });
        html += '</ol></div>';
      }

      html += '</div>';
      console.log('Generated HTML:', html);
      return html;
    } catch (error) {
      console.error('Error parsing processed content:', error);
      console.log('Raw processed content that failed to parse:', processedContent);
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