'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFeatureToggles } from '@/lib/stores/feature-toggles';
import { SUBSCRIPTION_TIERS, TIER_NAMES, type TierFeatures } from '@/config/subscription-tiers';
import { Button } from '@/components/ui/button';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { UpgradeDialog } from '@/components/subscription/upgrade-dialog';
import { useState } from 'react';

export function FeatureToggles() {
  const {
    userTier,
    isFeatureEnabled,
    setFeature,
    ...features
  } = useFeatureToggles();

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [targetTier, setTargetTier] = useState<'pro' | 'enterprise'>('pro');

  const handleUpgradeClick = (tier: 'pro' | 'enterprise') => {
    setTargetTier(tier);
    setShowUpgradeDialog(true);
  };

  return (
    <>
      <Card className="p-4 bg-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Document Features</h2>
          <span className="text-sm text-muted-foreground">{TIER_NAMES[userTier]}</span>
        </div>
        
        <div className="space-y-4">
          {(Object.keys(features) as Array<keyof TierFeatures>).map((feature) => {
            const isAvailable = SUBSCRIPTION_TIERS[userTier][feature];
            
            return (
              <div key={feature} className="flex items-center justify-between">
                <div className="flex-1">
                  <Label
                    htmlFor={feature}
                    className={!isAvailable ? 'text-muted-foreground' : ''}
                  >
                    {feature
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())}
                  </Label>
                  {!isAvailable && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Available in {
                        Object.entries(SUBSCRIPTION_TIERS)
                          .find(([_, features]) => features[feature])?.[0]
                      } tier
                    </p>
                  )}
                </div>
                
                {isAvailable ? (
                  <Switch
                    id={feature}
                    checked={features[feature]}
                    onCheckedChange={(checked) => setFeature(feature, checked)}
                  />
                ) : (
                  <LockClosedIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {userTier !== 'enterprise' && (
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleUpgradeClick(userTier === 'free' ? 'pro' : 'enterprise')}
            >
              Upgrade to {TIER_NAMES[userTier === 'free' ? 'pro' : 'enterprise']}
            </Button>
          </div>
        )}
      </Card>

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        targetTier={targetTier}
      />
    </>
  );
} 