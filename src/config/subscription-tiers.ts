export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface TierFeatures {
  transcription: boolean;
  aiProcessing: boolean;
  export: boolean;
  collaboration: boolean;
  customBranding: boolean;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  free: {
    transcription: true,
    aiProcessing: false,
    export: false,
    collaboration: false,
    customBranding: false,
  },
  pro: {
    transcription: true,
    aiProcessing: true,
    export: true,
    collaboration: true,
    customBranding: false,
  },
  enterprise: {
    transcription: true,
    aiProcessing: true,
    export: true,
    collaboration: true,
    customBranding: true,
  },
};

export const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, string> = {
  free: 'Basic task breakdown and materials list',
  pro: 'Advanced features including time estimates and keywords',
  enterprise: 'Full access to all features including step-specific materials',
}; 