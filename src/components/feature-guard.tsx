import { useFeatureAvailability } from '@/hooks/use-feature-availability';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface FeatureGuardProps {
  feature: keyof TierFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const { checkFeature } = useFeatureAvailability();
  const router = useRouter();
  const { toast } = useToast();
  const isEnabled = checkFeature(feature);

  useEffect(() => {
    if (!isEnabled) {
      toast({
        title: 'Feature Unavailable',
        description: 'This feature is not available in your current subscription tier.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [isEnabled, router, toast]);

  if (!isEnabled) {
    return fallback || null;
  }

  return <>{children}</>;
} 