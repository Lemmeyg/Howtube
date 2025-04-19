"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/api/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { AuthError } from "@supabase/supabase-js"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleRedirect = useCallback(async (session: any) => {
    if (isRedirecting || !session) return
    
    try {
      setIsRedirecting(true)
      let redirectTo = searchParams?.get('redirectedFrom')
      redirectTo = redirectTo ? decodeURIComponent(redirectTo) : '/dashboard'
      
      router.replace(redirectTo)
    } catch (error) {
      console.error("Redirect error:", error)
      router.replace('/dashboard')
    }
  }, [router, searchParams, isRedirecting])

  const getErrorMessage = (error: AuthError) => {
    // Check for specific error messages from Supabase
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for the verification link.'
    }
    if (error.message.includes('User not found')) {
      return 'No account found with this email. Please check your email or sign up for a new account.'
    }
    return error.message || 'An error occurred while signing in. Please try again.'
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || isRedirecting) return
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data?.session) {
        toast({
          title: "Success",
          description: "Successfully signed in!",
        })
        await handleRedirect(data.session)
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      // If it's an unverified email, show additional action button
      if (error.message.includes('Email not confirmed')) {
        toast({
          title: "Email not verified",
          description: "Please verify your email address before signing in.",
          variant: "destructive",
          action: {
            label: "Resend verification",
            onClick: async () => {
              try {
                const { error: resendError } = await supabase.auth.resend({
                  type: 'signup',
                  email,
                })
                if (resendError) throw resendError
                toast({
                  title: "Success",
                  description: "Verification email resent. Please check your inbox.",
                })
              } catch (resendError) {
                toast({
                  title: "Error",
                  description: "Failed to resend verification email. Please try again.",
                  variant: "destructive",
                })
              }
            },
          },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignIn}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-up")}
          >
            Create an account
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/reset-password")}
          >
            Reset password
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 