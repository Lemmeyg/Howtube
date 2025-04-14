import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkFeatureAvailability } from '@/lib/utils/feature-check';
import { TierFeatures } from '@/config/subscription-tiers';

interface FeatureGuardProps {
  feature: keyof TierFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const isEnabled = await checkFeatureAvailability(user.id, feature);

  if (!isEnabled) {
    redirect('/dashboard');
  }

  return <>{children}</>;
} 