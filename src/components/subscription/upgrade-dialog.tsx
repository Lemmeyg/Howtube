'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TIER_NAMES, TIER_DESCRIPTIONS, type SubscriptionTier } from '@/config/subscription-tiers';
import { useFeatureToggles } from '@/lib/stores/feature-toggles';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: SubscriptionTier;
}

export function UpgradeDialog({ isOpen, onClose, targetTier }: UpgradeDialogProps) {
  const { userTier, setUserTier } = useFeatureToggles();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Stripe checkout
      // For now, we'll just update the tier in the store
      setUserTier(targetTier);
      
      toast({
        title: 'Success',
        description: `Successfully upgraded to ${TIER_NAMES[targetTier]} tier!`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error processing upgrade:', error);
      toast({
        title: 'Error',
        description: 'Failed to process upgrade. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to {TIER_NAMES[targetTier]}</DialogTitle>
          <DialogDescription>
            {TIER_DESCRIPTIONS[targetTier]}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-semibold mb-2">What's included:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>All features from {TIER_NAMES[userTier]} tier</li>
            <li>Additional premium features</li>
            <li>Priority support</li>
            <li>Advanced customization options</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 