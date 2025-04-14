import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SUBSCRIPTION_TIERS, type SubscriptionTier, type TierFeatures } from '@/config/subscription-tiers';

export interface FeatureState extends TierFeatures {
  userTier: SubscriptionTier;
}

interface FeatureActions {
  setFeature: (feature: keyof TierFeatures, value: boolean) => void;
  setUserTier: (tier: SubscriptionTier) => void;
  resetToTierDefaults: () => void;
  isFeatureEnabled: (feature: keyof TierFeatures) => boolean;
}

export const useFeatureToggles = create<FeatureState & FeatureActions>()(
  persist(
    (set, get) => ({
      // Initial state
      userTier: 'free',
      showMaterials: true,
      showTimeEstimates: false,
      showDifficulty: true,
      showStepDurations: false,
      showKeywords: false,
      showStepMaterials: false,

      // Actions
      setFeature: (feature, value) => {
        const { userTier } = get();
        const tierFeatures = SUBSCRIPTION_TIERS[userTier];
        
        // Only allow enabling if the user's tier supports it
        if (value && !tierFeatures[feature]) {
          console.warn(`Feature ${feature} is not available in ${userTier} tier`);
          return;
        }
        
        set({ [feature]: value });
      },

      setUserTier: (tier) => {
        set({ userTier: tier });
        get().resetToTierDefaults();
      },

      resetToTierDefaults: () => {
        const { userTier } = get();
        const tierFeatures = SUBSCRIPTION_TIERS[userTier];
        set({ ...tierFeatures });
      },

      isFeatureEnabled: (feature) => {
        const { userTier } = get();
        return SUBSCRIPTION_TIERS[userTier][feature];
      },
    }),
    {
      name: 'feature-toggles',
      version: 1,
    }
  )
); 