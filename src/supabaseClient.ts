import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient() {
  if (client) return client

  const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  const url = (rawUrl || '').trim() || 'https://mvmmensfbsuohrxtkysu.supabase.co'

  if (!url || !key) {
    return null
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
    },
  })

  return client
}

