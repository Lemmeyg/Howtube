'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SUBSCRIPTION_TIERS, TIER_NAMES, type SubscriptionTier, type TierFeatures } from '@/config/subscription-tiers';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function FeaturesAdminPage() {
  const [tiers, setTiers] = useState(SUBSCRIPTION_TIERS);

  const handleFeatureToggle = (tier: SubscriptionTier, feature: keyof TierFeatures) => {
    setTiers(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [feature]: !prev[tier][feature],
      },
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save tier configuration
      toast({
        title: 'Success',
        description: 'Feature configuration saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save feature configuration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Feature Management</h1>
      
      <div className="grid gap-6">
        {(Object.keys(TIER_NAMES) as SubscriptionTier[]).map((tier) => (
          <Card key={tier} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{TIER_NAMES[tier]} Tier Features</h2>
            <div className="grid gap-4">
              {(Object.keys(tiers[tier]) as Array<keyof TierFeatures>).map((feature) => (
                <div key={feature} className="flex items-center justify-between">
                  <Label htmlFor={`${tier}-${feature}`} className="flex-1">
                    {feature
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Switch
                    id={`${tier}-${feature}`}
                    checked={tiers[tier][feature]}
                    onCheckedChange={() => handleFeatureToggle(tier, feature)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
} 