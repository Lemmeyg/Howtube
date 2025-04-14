import { createClient } from '@/lib/supabase/server';
import { FeatureConfig } from '@/types/feature-config';
import { SubscriptionTier, TierFeatures } from '@/config/subscription-tiers';

export class FeatureConfigService {
  private supabase = createClient();

  async getFeatureConfigs(): Promise<FeatureConfig[]> {
    const { data, error } = await this.supabase
      .from('feature_configs')
      .select('*')
      .order('tier')
      .order('feature');

    if (error) {
      console.error('Error fetching feature configs:', error);
      throw error;
    }

    return data || [];
  }

  async updateFeatureConfigs(configs: FeatureConfig[]): Promise<void> {
    const { error } = await this.supabase
      .from('feature_configs')
      .upsert(configs, {
        onConflict: 'tier,feature',
      });

    if (error) {
      console.error('Error updating feature configs:', error);
      throw error;
    }
  }

  async getFeatureConfig(tier: SubscriptionTier, feature: keyof TierFeatures): Promise<FeatureConfig | null> {
    const { data, error } = await this.supabase
      .from('feature_configs')
      .select('*')
      .eq('tier', tier)
      .eq('feature', feature)
      .single();

    if (error) {
      console.error('Error fetching feature config:', error);
      throw error;
    }

    return data;
  }

  async isFeatureEnabled(tier: SubscriptionTier, feature: keyof TierFeatures): Promise<boolean> {
    const config = await this.getFeatureConfig(tier, feature);
    return config?.enabled ?? false;
  }

  async getTierFeatures(tier: SubscriptionTier): Promise<TierFeatures> {
    const { data, error } = await this.supabase
      .from('feature_configs')
      .select('*')
      .eq('tier', tier);

    if (error) {
      console.error('Error fetching tier features:', error);
      throw error;
    }

    const features: TierFeatures = {
      transcription: false,
      aiProcessing: false,
      export: false,
      collaboration: false,
      customBranding: false,
    };

    data?.forEach((config) => {
      features[config.feature as keyof TierFeatures] = config.enabled;
    });

    return features;
  }

  subscribeToChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('feature_configs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_configs'
        },
        callback
      )
      .subscribe();
  }
}

export const featureConfigService = new FeatureConfigService(); 