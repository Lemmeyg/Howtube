import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type SubscriptionTier } from '@/config/subscription-tiers';
import { type FeatureName } from '@/types/feature-config';
import { useFeatureConfig } from '@/components/ui/use-feature-config';

interface FeatureState {
  userTier: SubscriptionTier;
  features: Record<FeatureName, boolean>;
}

interface FeatureActions {
  setFeature: (feature: FeatureName, value: boolean) => void;
  setUserTier: (tier: SubscriptionTier) => void;
  resetToTierDefaults: () => void;
  isFeatureEnabled: (feature: FeatureName) => boolean;
}

export const useFeatureToggles = create<FeatureState & FeatureActions>()(
  persist(
    (set, get) => ({
      // Initial state
      userTier: 'free',
      features: {
        transcription: false,
        aiProcessing: false,
        export: false,
        collaboration: false,
        customBranding: false,
      },

      // Actions
      setFeature: (feature, value) => {
        const { userTier } = get();
        const { isFeatureEnabled } = useFeatureConfig.getState();
        
        console.log('[FeatureToggles] Setting feature:', { feature, value, userTier });
        
        // Only allow enabling if the user's tier supports it
        if (value && !isFeatureEnabled(userTier, feature)) {
          console.warn(`[FeatureToggles] Feature ${feature} is not available in ${userTier} tier`);
          return;
        }
        
        set((state) => {
          const newFeatures = {
            ...state.features,
            [feature]: value
          };
          console.log('[FeatureToggles] Updated features:', newFeatures);
          return { features: newFeatures };
        });
      },

      setUserTier: (tier) => {
        console.log('[FeatureToggles] Setting user tier:', tier);
        set({ userTier: tier });
        
        // Enable all features available in the new tier by default
        const { getTierFeatures } = useFeatureConfig.getState();
        const tierFeatures = getTierFeatures(tier);
        console.log('[FeatureToggles] Tier features for new tier:', tierFeatures);
        
        // Only update features that are available in the new tier
        set((state) => {
          const updatedFeatures = { ...state.features };
          Object.entries(tierFeatures).forEach(([feature, isEnabled]) => {
            if (isEnabled) {
              updatedFeatures[feature as FeatureName] = true;
            }
          });
          console.log('[FeatureToggles] Updated features for new tier:', updatedFeatures);
          return { features: updatedFeatures };
        });
      },

      resetToTierDefaults: () => {
        const { userTier } = get();
        console.log('[FeatureToggles] Resetting to tier defaults:', userTier);
        const { getTierFeatures } = useFeatureConfig.getState();
        const tierFeatures = getTierFeatures(userTier);
        console.log('[FeatureToggles] Reset tier features:', tierFeatures);
        set({ features: tierFeatures });
      },

      isFeatureEnabled: (feature) => {
        const { userTier } = get();
        const { isFeatureEnabled } = useFeatureConfig.getState();
        const enabled = isFeatureEnabled(userTier, feature);
        console.log('[FeatureToggles] Checking if feature is enabled:', { feature, userTier, enabled });
        return enabled;
      },
    }),
    {
      name: 'feature-toggles',
      version: 4,
    }
  )
); 