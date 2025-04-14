import { SubscriptionTier } from '@/config/subscription-tiers';

export type FeatureName = 'transcription' | 'aiProcessing' | 'export' | 'collaboration' | 'customBranding';

export interface FeatureConfig {
  id: string;
  tier: SubscriptionTier;
  feature: FeatureName;
  enabled: boolean;
  created_at: string;
  updated_at: string;
} 