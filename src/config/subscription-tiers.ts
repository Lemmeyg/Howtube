export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

// Define which tiers have access to each tier's features
export const SUBSCRIPTION_ACCESS: Record<SubscriptionTier, SubscriptionTier[]> = {
  free: ['free'],
  pro: ['pro'],
  enterprise: ['enterprise']
};

export const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise'
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, string> = {
  free: 'Basic features and functionality',
  pro: 'Advanced features for professionals',
  enterprise: 'Full access to all features'
}; 