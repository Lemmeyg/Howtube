import { useFeatureConfig } from './use-feature-config';
import { SubscriptionTier } from '@/config/subscription-tiers';
import { FeatureName } from '@/types/feature-config';
import { useUser } from './use-user';

export function useFeatureAvailability() {
  const { user } = useUser();
  const { isFeatureEnabled, getTierFeatures } = useFeatureConfig();

  const checkFeature = (feature: FeatureName): boolean => {
    if (!user?.subscription_tier) return false;
    return isFeatureEnabled(user.subscription_tier as SubscriptionTier, feature);
  };

  const getAvailableFeatures = (): Record<FeatureName, boolean> => {
    if (!user?.subscription_tier) {
      return {
        transcription: false,
        aiProcessing: false,
        export: false,
        collaboration: false,
        customBranding: false,
      };
    }
    return getTierFeatures(user.subscription_tier as SubscriptionTier);
  };

  return {
    checkFeature,
    getAvailableFeatures,
    isTranscriptionEnabled: checkFeature('transcription'),
    isAIProcessingEnabled: checkFeature('aiProcessing'),
    isExportEnabled: checkFeature('export'),
    isCollaborationEnabled: checkFeature('collaboration'),
    isCustomBrandingEnabled: checkFeature('customBranding'),
  };
} 