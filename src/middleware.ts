import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

export async function middleware(req) {
  // Allow access to /test without authentication
  if (req.nextUrl.pathname === '/test') {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /auth/sign-in or /auth/sign-up
  // redirect the user to /auth/sign-in
  if (!session && !req.nextUrl.pathname.startsWith("/auth")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/sign-in"
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is /auth/sign-in or /auth/sign-up
  // redirect the user to /dashboard
  if (session && req.nextUrl.pathname.startsWith("/auth")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 