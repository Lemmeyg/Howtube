import { createClient } from '@/lib/supabase/server';
import { FeatureConfigService } from '@/lib/services/feature-config';
import { SubscriptionTier } from '@/config/subscription-tiers';

const featureConfigService = new FeatureConfigService();

export async function checkFeatureAvailability(
  userId: string,
  feature: keyof TierFeatures
): Promise<boolean> {
  const supabase = createClient();

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (!profile?.subscription_tier) {
    return false;
  }

  // Check feature availability
  return featureConfigService.isFeatureEnabled(
    profile.subscription_tier as SubscriptionTier,
    feature
  );
}

export async function getAvailableFeatures(userId: string): Promise<Record<keyof TierFeatures, boolean>> {
  const supabase = createClient();

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (!profile?.subscription_tier) {
    return {
      transcription: false,
      aiProcessing: false,
      export: false,
      collaboration: false,
      customBranding: false,
    };
  }

  // Get all features for the tier
  const features = await featureConfigService.getTierFeatures(
    profile.subscription_tier as SubscriptionTier
  );

  return features;
} 