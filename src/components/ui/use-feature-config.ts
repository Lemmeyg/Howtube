import { create } from 'zustand';
import { FeatureConfig, FeatureName } from '@/types/feature-config';
import { SubscriptionTier, SUBSCRIPTION_ACCESS } from '@/config/subscription-tiers';

interface FeatureConfigState {
  configs: FeatureConfig[];
  isLoading: boolean;
  error: string | null;
  fetchConfigs: () => Promise<void>;
  updateConfigs: (configs: FeatureConfig[]) => Promise<void>;
  isFeatureEnabled: (tier: SubscriptionTier, feature: FeatureName) => boolean;
  getTierFeatures: (tier: SubscriptionTier) => Record<FeatureName, boolean>;
}

export const useFeatureConfig = create<FeatureConfigState>((set, get) => ({
  configs: [],
  isLoading: false,
  error: null,

  fetchConfigs: async () => {
    console.log('[FeatureConfig] Starting to fetch feature configs');
    set({ isLoading: true, error: null });
    
    try {
      const endpoint = '/api/features';
      console.log('[FeatureConfig] Fetching from endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch feature configs');
      }
      
      const configs = await response.json();
      console.log('[FeatureConfig] Received configs:', configs);
      
      if (!Array.isArray(configs)) {
        throw new Error('Invalid feature configs format');
      }
      
      set({ configs, isLoading: false });
    } catch (error) {
      console.error('[FeatureConfig] Error fetching configs:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        configs: [] // Reset configs on error
      });
    }
  },

  updateConfigs: async (configs: FeatureConfig[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/admin/features', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configs),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update feature configs');
      }
      
      set({ configs, isLoading: false });
    } catch (error) {
      console.error('[FeatureConfig] Error updating configs:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  isFeatureEnabled: (tier: SubscriptionTier, feature: FeatureName) => {
    const { configs } = get();
    console.log('[FeatureConfig] Checking if feature is enabled:', { tier, feature, configs });
    
    // Get all accessible tiers for the current tier
    const accessibleTiers = SUBSCRIPTION_ACCESS[tier];
    console.log('[FeatureConfig] Accessible tiers:', accessibleTiers);
    
    // Check if the feature is enabled in any of the accessible tiers
    const isEnabled = accessibleTiers.some(accessTier => {
      const config = configs.find(
        (c) => c.tier === accessTier && c.feature === feature
      );
      console.log('[FeatureConfig] Checking tier config:', { accessTier, config });
      return config?.enabled ?? false;
    });
    
    console.log('[FeatureConfig] Feature enabled result:', isEnabled);
    return isEnabled;
  },

  getTierFeatures: (tier: SubscriptionTier) => {
    const { configs } = get();
    console.log('[FeatureConfig] Getting tier features:', { tier, configs });
    
    const features: Record<FeatureName, boolean> = {
      transcription: false,
      aiProcessing: false,
      export: false,
      collaboration: false,
      customBranding: false,
    };

    // Get all accessible tiers for the current tier
    const accessibleTiers = SUBSCRIPTION_ACCESS[tier];
    console.log('[FeatureConfig] Accessible tiers for getTierFeatures:', accessibleTiers);
    
    // For each feature, check if it's enabled in any accessible tier
    Object.keys(features).forEach((feature) => {
      const isEnabled = accessibleTiers.some(accessTier => {
        const config = configs.find(
          (c) => c.tier === accessTier && c.feature === feature
        );
        console.log('[FeatureConfig] Checking feature config:', { feature, accessTier, config });
        return config?.enabled ?? false;
      });
      features[feature as FeatureName] = isEnabled;
      console.log('[FeatureConfig] Feature enabled state:', { feature, isEnabled });
    });

    console.log('[FeatureConfig] Final tier features:', features);
    return features;
  },
})); 