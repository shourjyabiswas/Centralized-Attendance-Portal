import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend/.env')
  process.exit(1)
}

// Server-side Supabase client (anonymous/admin)
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Create a Supabase client authenticated as a specific user.
 * This ensures RLS policies are evaluated against the user's JWT.
 */
export function createUserClient(accessToken) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return [] },
      setAll() { }
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
