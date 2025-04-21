import { createClient } from '@/lib/supabase/server';
import { FeatureConfig, FeatureName } from '@/types/feature-config';
import { SubscriptionTier, SUBSCRIPTION_ACCESS } from '@/config/subscription-tiers';

export class FeatureConfigService {
  async getSupabase() {
    return await createClient();
  }

  async getFeatureConfigs(): Promise<FeatureConfig[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
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
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('feature_configs')
      .upsert(configs, {
        onConflict: 'tier,feature',
      });

    if (error) {
      console.error('Error updating feature configs:', error);
      throw error;
    }
  }

  async getFeatureConfig(tier: SubscriptionTier, feature: FeatureName): Promise<FeatureConfig | null> {
    const supabase = await this.getSupabase();
    // Get all accessible tiers for the current tier
    const accessibleTiers = SUBSCRIPTION_ACCESS[tier];

    // Get configs for all accessible tiers
    const { data, error } = await supabase
      .from('feature_configs')
      .select('*')
      .in('tier', accessibleTiers)
      .eq('feature', feature);

    if (error) {
      console.error('Error fetching feature config:', error);
      throw error;
    }

    // Return the first enabled config, prioritizing higher tiers
    return data.find(config => config.enabled) || null;
  }

  async isFeatureEnabled(tier: SubscriptionTier, feature: FeatureName): Promise<boolean> {
    const config = await this.getFeatureConfig(tier, feature);
    return config?.enabled ?? false;
  }

  async getTierFeatures(tier: SubscriptionTier): Promise<Record<FeatureName, boolean>> {
    const supabase = await this.getSupabase();
    // Get all accessible tiers for the current tier
    const accessibleTiers = SUBSCRIPTION_ACCESS[tier];

    // Get configs for all accessible tiers
    const { data, error } = await supabase
      .from('feature_configs')
      .select('*')
      .in('tier', accessibleTiers);

    if (error) {
      console.error('Error fetching tier features:', error);
      throw error;
    }

    const features: Record<FeatureName, boolean> = {
      transcription: false,
      aiProcessing: false,
      export: false,
      collaboration: false,
      customBranding: false,
    };

    // For each feature, check if it's enabled in any accessible tier
    Object.keys(features).forEach((feature) => {
      const configs = data.filter(config => config.feature === feature);
      features[feature as FeatureName] = configs.some(config => config.enabled);
    });

    return features;
  }

  subscribeToChanges(callback: (payload: any) => void) {
    return this.getSupabase().then(supabase => 
      supabase
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
        .subscribe()
    );
  }
}

export const featureConfigService = new FeatureConfigService(); 