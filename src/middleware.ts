import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'
import { FeatureConfigService } from '@/lib/services/feature-config'
import { SubscriptionTier } from '@/config/subscription-tiers'

const featureConfigService = new FeatureConfigService()

export async function middleware(request: NextRequest) {
  console.log("[Middleware] Request path:", request.nextUrl.pathname)
  
  // Create a response object that we can modify
  const res = NextResponse.next()

  // Define public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/reset-password', '/update-password', '/callback']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  // Allow access to public paths without authentication
  if (isPublicPath) {
    console.log("[Middleware] Public path accessed:", request.nextUrl.pathname)
    return res
  }
  
  // Create the Supabase client using middleware client
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  try {
    // Try to refresh the session
    console.log("[Middleware] Attempting to refresh session")
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("[Middleware] Session error:", sessionError.message)
      throw sessionError
    }

    if (!session) {
      console.log("[Middleware] No session found")
      throw new Error("No session")
    }

    // Validate the session by checking the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token)
    
    if (userError || !user) {
      console.error("[Middleware] User validation error:", userError?.message)
      throw new Error("Invalid session")
    }

    console.log("[Middleware] Session validated for user:", user.email)

    // Handle root path specifically
    if (request.nextUrl.pathname === '/') {
      console.log("[Middleware] Redirecting root path to dashboard")
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, is_admin')
      .eq('id', user.id)
      .single()

    // If no profile exists, create one with default values
    if (!profile) {
      console.log("[Middleware] Creating new profile for user:", user.email)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          subscription_tier: 'free',
          is_admin: false
        })

      if (insertError) {
        console.error("[Middleware] Error creating profile:", insertError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      // Fetch the newly created profile
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .select('subscription_tier, is_admin')
        .eq('id', user.id)
        .single()

      if (newProfileError || !newProfile) {
        console.error("[Middleware] Error fetching new profile:", newProfileError)
        return NextResponse.json(
          { error: 'Failed to fetch user profile' },
          { status: 500 }
        )
      }
    }

    // Check feature availability based on the API route
    const feature = getFeatureFromPath(request.nextUrl.pathname)
    if (feature) {
      const isEnabled = await featureConfigService.isFeatureEnabled(
        profile?.subscription_tier as SubscriptionTier || 'free',
        feature
      )

      if (!isEnabled) {
        console.error("[Middleware] Feature not available in your subscription tier")
        return NextResponse.json(
          { error: 'Feature not available in your subscription tier' },
          { status: 403 }
        )
      }
    }
    
    console.log("[Middleware] Path info:", {
      path: request.nextUrl.pathname,
      isPublic: isPublicPath,
      hasSession: !!session
    })

    // Set session cookie in the response
    if (session) {
      res.cookies.set('supabase-auth-token', session.user.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }

    console.log("[Middleware] Request proceeding with session:", !!session)

    // Admin route protection
    if (request.nextUrl.pathname.startsWith('/admin') && !profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return res

  } catch (error) {
    console.error("[Middleware] Auth error:", error)
    // Clear any invalid session data from the response
    res.cookies.delete('sb-access-token')
    res.cookies.delete('sb-refresh-token')
    
    // Redirect to sign-in for non-public paths
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
}

function getFeatureFromPath(path: string): keyof TierFeatures | null {
  if (path.includes('/transcription')) return 'transcription'
  if (path.includes('/ai-processing')) return 'aiProcessing'
  if (path.includes('/export')) return 'export'
  if (path.includes('/collaboration')) return 'collaboration'
  if (path.includes('/custom-branding')) return 'customBranding'
  return null
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 