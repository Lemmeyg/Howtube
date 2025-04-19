import { useEffect } from 'react';
import { useFeatureConfig } from '@/components/ui/use-feature-config';
import { SubscriptionTier, TierFeatures } from '@/config/subscription-tiers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const FEATURE_NAMES: Record<keyof TierFeatures, string> = {
  transcription: 'Transcription',
  aiProcessing: 'AI Processing',
  export: 'Export',
  collaboration: 'Collaboration',
  customBranding: 'Custom Branding',
};

export function FeatureConfigManager() {
  const { configs, isLoading, error, fetchConfigs, updateConfigs } = useFeatureConfig();
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleToggle = async (tier: SubscriptionTier, feature: keyof TierFeatures, enabled: boolean) => {
    const updatedConfigs = configs.map((config) =>
      config.tier === tier && config.feature === feature
        ? { ...config, enabled }
        : config
    );

    try {
      await updateConfigs(updatedConfigs);
      toast({
        title: 'Success',
        description: `Feature ${FEATURE_NAMES[feature]} for ${TIER_NAMES[tier]} tier has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feature configuration.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Feature</th>
                {Object.entries(TIER_NAMES).map(([tier, name]) => (
                  <th key={tier} className="text-center p-2">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(FEATURE_NAMES).map(([feature, name]) => (
                <tr key={feature}>
                  <td className="p-2">{name}</td>
                  {Object.keys(TIER_NAMES).map((tier) => {
                    const config = configs.find(
                      (c) => c.tier === tier && c.feature === feature
                    );
                    return (
                      <td key={`${tier}-${feature}`} className="text-center p-2">
                        {isLoading ? (
                          <Skeleton className="h-6 w-12 mx-auto" />
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Switch
                              id={`${tier}-${feature}`}
                              checked={config?.enabled ?? false}
                              onCheckedChange={(checked) =>
                                handleToggle(tier as SubscriptionTier, feature as keyof TierFeatures, checked)
                              }
                            />
                            <Label htmlFor={`${tier}-${feature}`} className="sr-only">
                              {`${name} for ${TIER_NAMES[tier as SubscriptionTier]}`}
                            </Label>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 