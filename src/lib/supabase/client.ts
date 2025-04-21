import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export const createClient = () => {
  return createClientComponentClient<Database>({
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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
      global: {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    },
  })
} 