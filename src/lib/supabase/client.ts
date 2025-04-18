import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export const createClient = () => {
  return createClientComponentClient<Database>({
    options: {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: true,
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
        },
      },
    },
  })
} 