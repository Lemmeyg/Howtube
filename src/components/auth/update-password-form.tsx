"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/api/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if passwords match whenever either password field changes
  useEffect(() => {
    setPasswordsMatch(password === confirmPassword && password.length >= 6)
  }, [password, confirmPassword])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Password updated successfully!",
      })
      router.push("/sign-in")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error updating password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdatePassword}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Confirm new password"
            />
          </div>
          {password && confirmPassword && !passwordsMatch && (
            <p className="text-sm text-red-500">
              Passwords must match and be at least 6 characters long
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !passwordsMatch}
          >
            {loading ? "Updating password..." : "Update Password"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 