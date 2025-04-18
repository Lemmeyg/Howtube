import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClientComponentClient({
  options: {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    cookies: {
      name: 'sb-auth-token',
      lifetime: 0,
      domain: '',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    },
    global: {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  }
}) 