import { createClient } from '@/lib/supabase/server';
import { FeatureConfig } from '@/types/feature-config';

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

  async getFeatureConfig(tier: string, feature: string): Promise<FeatureConfig | null> {
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

  async isFeatureEnabled(tier: string, feature: string): Promise<boolean> {
    const config = await this.getFeatureConfig(tier, feature);
    return config?.enabled ?? false;
  }
} 