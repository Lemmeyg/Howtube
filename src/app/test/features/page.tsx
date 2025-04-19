'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFeatureAvailability } from '@/components/ui/use-feature-availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function FeatureTestPage() {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const {
    isTranscriptionEnabled,
    isAIProcessingEnabled,
    isExportEnabled,
    isCollaborationEnabled,
    isCustomBrandingEnabled,
  } = useFeatureAvailability();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const testFeature = async (feature: string) => {
    try {
      const response = await fetch(`/api/test/${feature}`);
      if (!response.ok) {
        throw new Error('Feature not available');
      }
      toast({
        title: 'Success',
        description: `${feature} feature is available`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `${feature} feature is not available`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Feature Test Page</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => testFeature('transcription')}
              disabled={!isTranscriptionEnabled}
            >
              Test Transcription
            </Button>
            <Button
              onClick={() => testFeature('ai-processing')}
              disabled={!isAIProcessingEnabled}
            >
              Test AI Processing
            </Button>
            <Button
              onClick={() => testFeature('export')}
              disabled={!isExportEnabled}
            >
              Test Export
            </Button>
            <Button
              onClick={() => testFeature('collaboration')}
              disabled={!isCollaborationEnabled}
            >
              Test Collaboration
            </Button>
            <Button
              onClick={() => testFeature('custom-branding')}
              disabled={!isCustomBrandingEnabled}
            >
              Test Custom Branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 