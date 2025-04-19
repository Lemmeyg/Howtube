import { useFeatureAvailability } from '@/components/ui/use-feature-availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURE_NAMES: Record<string, string> = {
  transcription: 'Transcription',
  aiProcessing: 'AI Processing',
  export: 'Export',
  collaboration: 'Collaboration',
  customBranding: 'Custom Branding',
};

export function FeatureAvailability() {
  const { getAvailableFeatures } = useFeatureAvailability();
  const features = getAvailableFeatures();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(features).map(([feature, enabled]) => (
            <div
              key={feature}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                enabled ? 'bg-green-50' : 'bg-gray-50'
              )}
            >
              <span className="font-medium">{FEATURE_NAMES[feature]}</span>
              {enabled ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 