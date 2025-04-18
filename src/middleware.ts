import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'
import { FeatureConfigService } from '@/lib/services/feature-config'
import { SubscriptionTier } from '@/config/subscription-tiers'

const featureConfigService = new FeatureConfigService()

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/reset-password']
const ADMIN_PATHS = ['/admin']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient<Database>({ 
      req, 
      res,
      options: {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          flowType: 'pkce',
        },
        cookies: {
          name: 'sb-auth-token',
          lifetime: 0,
          domain: '',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        },
        global: {
          headers: {
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache',
          },
        },
      },
    })

    const pathname = req.nextUrl.pathname

    // Skip auth check for public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return res
    }

    // Get user data from session only (not localStorage)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (!session || sessionError) {
      // Clear all auth-related cookies
      const cookies = req.cookies.getAll()
      cookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
          res.cookies.delete(cookie.name)
        }
      })

      // Only redirect to sign-in if not already there
      if (!pathname.startsWith('/sign-in')) {
    const redirectUrl = new URL('/sign-in', req.url)
        redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }
      return res
    }

    // Handle admin routes
    if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

      // Set admin status in a session cookie
      res.cookies.set('is_admin', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
        path: '/',
        maxAge: 0, // Session cookie
      })
    }

    // Set Cache-Control headers
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
    res.headers.set('Surrogate-Control', 'no-store')
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Clear all auth-related cookies
    const cookies = req.cookies.getAll()
    cookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
        res.cookies.delete(cookie.name)
      }
    })
    
    // Only redirect to sign-in if not already there
    if (!req.nextUrl.pathname.startsWith('/sign-in')) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  return res
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 