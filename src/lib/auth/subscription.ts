import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SubscriptionTier } from '@/config/subscription-tiers';

export async function getUserSubscriptionTier(): Promise<SubscriptionTier> {
  const supabase = createClientComponentClient();
  
  try {
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('No session found:', sessionError);
      return 'free';
    }

    // Get the user's subscription from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching subscription:', profileError);
      return 'free';
    }

    // Validate that the subscription tier is valid
    const tier = profile?.subscription_tier as SubscriptionTier;
    if (tier && ['free', 'pro', 'enterprise'].includes(tier)) {
      return tier;
    }

    return 'free';
  } catch (error) {
    console.error('Error getting subscription tier:', error);
    return 'free';
  }
} 