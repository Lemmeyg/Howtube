"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      toast.success("Successfully signed out!")
    } catch (error) {
      toast.error("Error signing out. Please try again.")
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>User ID</Label>
          <Input value={user?.id ?? ""} disabled />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
          disabled={loading}
        >
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </CardFooter>
    </Card>
  )
} 