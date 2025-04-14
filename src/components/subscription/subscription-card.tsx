import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import { toast } from "sonner"

interface SubscriptionCardProps {
  tier: 'free' | 'pro' | 'enterprise'
  price: string
  features: string[]
  isCurrentPlan: boolean
  onUpgrade: () => void
}

const tierDescriptions = {
  free: "Get started with basic features",
  pro: "Perfect for power users",
  enterprise: "For teams and businesses"
}

export function SubscriptionCard({ tier, price, features, isCurrentPlan, onUpgrade }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // For now, just update the subscription tier directly
      // In a real app, this would integrate with a payment provider like Stripe
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id)

      if (error) throw error

      toast.success(`Successfully upgraded to ${tier} plan!`)
      onUpgrade()
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`w-[300px] ${isCurrentPlan ? 'border-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="capitalize">{tier}</CardTitle>
        <CardDescription>{tierDescriptions[tier]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-6">{price}</div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleUpgrade}
          disabled={isCurrentPlan || loading}
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isCurrentPlan ? "Current Plan" : loading ? "Upgrading..." : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  )
} 