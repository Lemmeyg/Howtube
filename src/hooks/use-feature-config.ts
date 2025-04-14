import { create } from 'zustand';
import { FeatureConfig } from '@/types/feature-config';
import { SubscriptionTier, TierFeatures } from '@/config/subscription-tiers';

interface FeatureConfigState {
  configs: FeatureConfig[];
  isLoading: boolean;
  error: string | null;
  fetchConfigs: () => Promise<void>;
  updateConfigs: (configs: FeatureConfig[]) => Promise<void>;
  isFeatureEnabled: (tier: SubscriptionTier, feature: keyof TierFeatures) => boolean;
  getTierFeatures: (tier: SubscriptionTier) => TierFeatures;
}

export const useFeatureConfig = create<FeatureConfigState>((set, get) => ({
  configs: [],
  isLoading: false,
  error: null,

  fetchConfigs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/admin/features');
      if (!response.ok) {
        throw new Error('Failed to fetch feature configs');
      }
      const configs = await response.json();
      set({ configs, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  updateConfigs: async (configs: FeatureConfig[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configs),
      });
      if (!response.ok) {
        throw new Error('Failed to update feature configs');
      }
      set({ configs, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  isFeatureEnabled: (tier: SubscriptionTier, feature: keyof TierFeatures) => {
    const { configs } = get();
    const config = configs.find(
      (c) => c.tier === tier && c.feature === feature
    );
    return config?.enabled ?? false;
  },

  getTierFeatures: (tier: SubscriptionTier) => {
    const { configs } = get();
    const features: TierFeatures = {
      transcription: false,
      aiProcessing: false,
      export: false,
      collaboration: false,
      customBranding: false,
    };

    configs
      .filter((c) => c.tier === tier)
      .forEach((config) => {
        features[config.feature as keyof TierFeatures] = config.enabled;
      });

    return features;
  },
})); 