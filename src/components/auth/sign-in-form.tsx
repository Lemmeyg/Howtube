"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/api/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRedirect = useCallback(async (session: any) => {
    try {
      // Get the redirectedFrom parameter and decode it
      let redirectTo = searchParams?.get('redirectedFrom')
      redirectTo = redirectTo ? decodeURIComponent(redirectTo) : '/dashboard'
      
      console.log("Attempting redirect to:", redirectTo, "with session:", !!session)
      
      // Ensure session is set before redirecting
      if (session) {
        await supabase.auth.setSession(session)
        
        // Force a small delay to ensure session is properly set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Use replace instead of push to prevent back navigation
        router.replace(redirectTo)
        router.refresh()
      }
    } catch (error) {
      console.error("Redirect error:", error)
      // Fallback to dashboard if there's an error with the redirect
      router.replace('/dashboard')
    }
  }, [router, searchParams])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Attempting sign in with:", { email })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error.message)
        throw error
      }

      if (data?.session) {
        console.log("Sign in successful:", {
          user: data.session.user.email,
          sessionId: data.session.access_token ? "Present" : "Missing"
        })
        
        toast.success("Successfully signed in!")
        await handleRedirect(data.session)
      }
    } catch (error: any) {
      console.error("Sign in process error:", error.message)
      toast.error(error.message || "Error signing in")
    } finally {
      setLoading(false)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session check error:", error)
          return
        }

        if (session && mounted) {
          console.log("Existing session found:", {
            user: session.user.email,
            sessionId: session.access_token ? "Present" : "Missing"
          })
          await handleRedirect(session)
        }
      } catch (error) {
        console.error("Session check error:", error)
      }
    }

    checkSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", !!session)
      if (session && mounted) {
        await handleRedirect(session)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [handleRedirect])

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
        </CardFooter>
      </form>
    </Card>
  )
} 