import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

export async function middleware(req) {
  console.log("[Middleware] Request path:", req.nextUrl.pathname)
  
  // Create a response object that we can modify
  const res = NextResponse.next()
  
  // Create the Supabase client
  console.log("[Middleware] Creating Supabase client")
  const supabase = createMiddlewareClient({ req, res })

  // Try to refresh the session
  console.log("[Middleware] Attempting to refresh session")
  const { data: { session }, error: refreshError } = await supabase.auth.getSession()
  
  if (refreshError) {
    console.error("[Middleware] Session refresh error:", refreshError.message)
  }

  console.log("[Middleware] Detailed session info:", {
    hasSession: !!session,
    hasError: !!refreshError,
    userId: session?.user?.id,
    email: session?.user?.email,
    accessToken: !!session?.access_token,
    expiresAt: session?.expires_at
  })

  // Define public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/reset-password', '/update-password', '/callback']
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)
  
  console.log("[Middleware] Path info:", {
    path: req.nextUrl.pathname,
    isPublic: isPublicPath,
    hasSession: !!session
  })

  // Handle root path specifically
  if (req.nextUrl.pathname === '/') {
    if (session) {
      console.log("[Middleware] Root path with session, redirecting to dashboard")
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      console.log("[Middleware] Root path without session, redirecting to sign-in")
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // Handle other paths
  if (!session && !isPublicPath) {
    console.log("[Middleware] No session, redirecting to sign-in")
    const redirectUrl = new URL('/sign-in', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isPublicPath) {
    console.log("[Middleware] Has session, redirecting to dashboard")
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Set session cookie in the response
  if (session) {
    res.cookies.set('supabase-auth-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
  }

  console.log("[Middleware] Request proceeding with session:", !!session)
  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
} 