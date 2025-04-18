"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  id: string
  email: string
  is_admin: boolean
  subscription_tier: string
  created_at: string
}

export default function AdminTestPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        if (!session) {
          setError("No active session found")
          setLoading(false)
          return
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) throw profileError
        
        setProfile(profile)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading profile information...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p>{profile?.email}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Admin Status</h3>
            <Badge variant={profile?.is_admin ? "default" : "secondary"}>
              {profile?.is_admin ? "Admin" : "Not Admin"}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Subscription Tier</h3>
            <Badge variant="outline">{profile?.subscription_tier}</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Account Created</h3>
            <p>{new Date(profile?.created_at || "").toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 