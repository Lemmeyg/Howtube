"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [feedback, setFeedback] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        if (!user) {
          router.push('/sign-in')
          return
        }

        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        setEmail(profile.email || user.email || '')
        setFullName(profile.full_name || '')
        setLoading(false)
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        })
      }
    }

    loadProfile()
  }, [supabase, router, toast])

  const handleUpdateProfile = async () => {
    setUpdating(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        router.push('/sign-in')
        return
      }

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        })
        if (emailError) throw emailError
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        router.push('/sign-in')
        return
      }

      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          email: email,
          username: fullName,
          content: feedback,
        })

      if (feedbackError) throw feedbackError

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      })
      setFeedback("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="container py-8">Loading profile...</div>
  }

  return (
    <div className="container max-w-2xl py-8 relative">
      <div className="absolute right-0 top-0">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          size="icon"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account settings and provide feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <Button
              onClick={handleUpdateProfile}
              disabled={updating}
              className="w-full"
            >
              {updating ? "Updating Profile..." : "Update Profile"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleSubmitFeedback}
              disabled={updating || !feedback.trim()}
              className="w-full"
            >
              {updating ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/update-password')}
            >
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 