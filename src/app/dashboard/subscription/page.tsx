"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { SubscriptionCard } from "@/components/subscription/subscription-card"

const subscriptionPlans = [
  {
    tier: 'free',
    price: '$0/month',
    features: [
      'Basic video transcription',
      'Limited to 5 videos/month',
      'Standard processing speed',
      'Basic support'
    ]
  },
  {
    tier: 'pro',
    price: '$19/month',
    features: [
      'Unlimited video transcription',
      'Priority processing',
      'Advanced AI processing',
      'Export capabilities',
      'Priority support'
    ]
  },
  {
    tier: 'enterprise',
    price: '$49/month',
    features: [
      'Everything in Pro',
      'Custom branding',
      'Team collaboration',
      'API access',
      'Dedicated support',
      'Custom integrations'
    ]
  }
] as const

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/sign-in')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        if (profile?.subscription_tier) {
          setCurrentTier(profile.subscription_tier as 'free' | 'pro' | 'enterprise')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleUpgrade = () => {
    // Refresh the page to show updated subscription
    router.refresh()
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
      <p className="text-muted-foreground mb-8">
        Choose the plan that best fits your needs. Upgrade anytime to unlock more features.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <SubscriptionCard
            key={plan.tier}
            tier={plan.tier}
            price={plan.price}
            features={plan.features}
            isCurrentPlan={currentTier === plan.tier}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>
    </div>
  )
} 