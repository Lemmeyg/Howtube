export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface TierFeatures {
  showMaterials: boolean;
  showTimeEstimates: boolean;
  showDifficulty: boolean;
  showStepDurations: boolean;
  showKeywords: boolean;
  showStepMaterials: boolean;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  free: {
    showMaterials: true,
    showTimeEstimates: false,
    showDifficulty: true,
    showStepDurations: false,
    showKeywords: false,
    showStepMaterials: false,
  },
  pro: {
    showMaterials: true,
    showTimeEstimates: true,
    showDifficulty: true,
    showStepDurations: true,
    showKeywords: true,
    showStepMaterials: false,
  },
  enterprise: {
    showMaterials: true,
    showTimeEstimates: true,
    showDifficulty: true,
    showStepDurations: true,
    showKeywords: true,
    showStepMaterials: true,
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