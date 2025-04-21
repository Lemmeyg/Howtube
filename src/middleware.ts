import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'
import { FeatureConfigService } from '@/lib/services/feature-config'
import { SubscriptionTier } from '@/config/subscription-tiers'

const featureConfigService = new FeatureConfigService()

const PUBLIC_PATHS = [
  '/sign-in', 
  '/sign-up', 
  '/reset-password', 
  '/_next', 
  '/api/public',
  '/api/webhook'
]
const ADMIN_PATHS = ['/admin']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient<Database>({ 
      req, 
      res,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          flowType: 'pkce',
        },
        cookies: {
          name: 'sb-auth-token',
          lifetime: 60 * 60 * 24 * 7, // 1 week
          domain: '',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        },
      },
    })

    const pathname = req.nextUrl.pathname

    // Skip auth check for public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return res
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (!session || sessionError) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Add user info to request headers for API routes
      res.headers.set('x-user-id', session.user.id)
      res.headers.set('x-user-role', session.user.role)
      return res
    }

    // Get user data from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (!session || sessionError) {
      // Clear auth cookies on error
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

      // Set admin status in a secure cookie
      res.cookies.set('is_admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      })
    }

    // Set security headers
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
    res.headers.set('Surrogate-Control', 'no-store')
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Clear auth cookies on error
    const cookies = req.cookies.getAll()
    cookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
        res.cookies.delete(cookie.name)
      }
    })
    
    // Only redirect to sign-in if not already there and not an API route
    if (!req.nextUrl.pathname.startsWith('/sign-in') && !req.nextUrl.pathname.startsWith('/api/')) {
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