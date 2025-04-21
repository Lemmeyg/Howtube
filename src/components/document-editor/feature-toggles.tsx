'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFeatureToggles } from '@/lib/stores/feature-toggles';
import { TIER_NAMES } from '@/config/subscription-tiers';
import { Button } from '@/components/ui/button';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { UpgradeDialog } from '@/components/subscription/upgrade-dialog';
import { useState, useEffect } from 'react';
import { useFeatureConfig } from '@/components/ui/use-feature-config';
import { FeatureName } from '@/types/feature-config';
import { Skeleton } from '@/components/ui/skeleton';

const FEATURE_DISPLAY_NAMES: Record<FeatureName, string> = {
  transcription: 'Transcription',
  aiProcessing: 'AI Processing',
  export: 'Export',
  collaboration: 'Collaboration',
  customBranding: 'Custom Branding',
};

const ALL_FEATURES: FeatureName[] = [
  'transcription',
  'aiProcessing',
  'export',
  'collaboration',
  'customBranding',
];

export function FeatureToggles() {
  const {
    userTier,
    features,
    setFeature,
  } = useFeatureToggles();
  
  const { isFeatureEnabled, fetchConfigs, isLoading, error } = useFeatureConfig();

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [targetTier, setTargetTier] = useState<'pro' | 'enterprise'>('pro');

  useEffect(() => {
    console.log('[FeatureToggles] Component mounted, fetching configs');
    fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    console.log('[FeatureToggles] Current state:', { userTier, features, isLoading, error });
  }, [userTier, features, isLoading, error]);

  const handleUpgradeClick = (tier: 'pro' | 'enterprise') => {
    console.log('[FeatureToggles] Upgrade clicked:', tier);
    setTargetTier(tier);
    setShowUpgradeDialog(true);
  };

  if (isLoading) {
    console.log('[FeatureToggles] Loading state, showing skeletons');
    return (
      <Card className="p-4 bg-slate-100">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    console.error('[FeatureToggles] Error state:', error);
    return (
      <Card className="p-4 bg-slate-100">
        <div className="text-red-500">
          <p>Error loading features: {error}</p>
        </div>
      </Card>
    );
  }

  console.log('[FeatureToggles] Rendering feature toggles:', { userTier, features });

  return (
    <>
      <Card className="p-4 bg-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Document Features</h2>
          <span className="text-sm text-muted-foreground">{TIER_NAMES[userTier]}</span>
        </div>
        
        <div className="space-y-4">
          {ALL_FEATURES.map((feature) => {
            const isAvailable = isFeatureEnabled(userTier, feature);
            console.log('[FeatureToggles] Feature availability:', { feature, isAvailable });
            
            return (
              <div key={feature} className="flex items-center justify-between">
                <div className="flex-1">
                  <Label
                    htmlFor={feature}
                    className={!isAvailable ? 'text-muted-foreground' : ''}
                  >
                    {FEATURE_DISPLAY_NAMES[feature]}
                  </Label>
                  {!isAvailable && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Not available in current tier
                    </p>
                  )}
                </div>
                
                {isAvailable ? (
                  <Switch
                    id={feature}
                    checked={features[feature]}
                    onCheckedChange={(checked) => {
                      console.log('[FeatureToggles] Toggling feature:', { feature, checked });
                      setFeature(feature, checked);
                    }}
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