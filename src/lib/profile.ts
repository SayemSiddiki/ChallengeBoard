import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabaseClient'

export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  username: string | null
  bio: string | null
  status: 'active' | 'paused' | null
  avatar_url: string | null
  updated_at: string | null
}

export async function getProfile(userId: string, supabase?: SupabaseClient) {
  const client = supabase ?? getSupabaseClient()
  if (!client) return { profile: null as Profile | null, error: new Error('Supabase not configured') }

  const { data, error } = await client
    .from('profiles')
    .select('id, first_name, last_name, full_name, username, bio, status, avatar_url, updated_at')
    .eq('id', userId)
    .maybeSingle()

  return { profile: (data as Profile | null) ?? null, error }
}

export async function upsertProfile(
  userId: string,
  input: {
    first_name: string
    last_name: string
    avatar_url?: string | null
    username?: string | null
    bio?: string | null
    status?: 'active' | 'paused' | null
  },
  supabase?: SupabaseClient,
) {
  const client = supabase ?? getSupabaseClient()
  if (!client) return { profile: null as Profile | null, error: new Error('Supabase not configured') }

  const first = input.first_name.trim()
  const last = input.last_name.trim()
  const full = `${first} ${last}`.trim()
  const payload: {
    id: string
    first_name: string
    last_name: string
    full_name: string
    avatar_url?: string | null
    username?: string | null
    bio?: string | null
    status?: 'active' | 'paused' | null
  } = {
    id: userId,
    first_name: first,
    last_name: last,
    full_name: full,
  }
  if (input.avatar_url !== undefined) payload.avatar_url = input.avatar_url ?? null
  if (input.username !== undefined) payload.username = input.username?.trim() || null
  if (input.bio !== undefined) payload.bio = input.bio?.trim() || null
  if (input.status !== undefined) payload.status = input.status ?? null

  const runUpsert = async (upsertPayload: typeof payload) => {
    return await client
      .from('profiles')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select('id, first_name, last_name, full_name, username, bio, status, avatar_url, updated_at')
      .maybeSingle()
  }

  let { data, error } = await runUpsert(payload)

  // Fallback: if optional columns are missing or blocked, retry with core profile fields.
  if (error) {
    const corePayload: {
      id: string
      first_name: string
      last_name: string
      full_name: string
      avatar_url?: string | null
    } = {
      id: userId,
      first_name: first,
      last_name: last,
      full_name: full,
    }
    if (input.avatar_url !== undefined) corePayload.avatar_url = input.avatar_url ?? null

    const fallbackResult = await runUpsert(corePayload)
    if (!fallbackResult.error) {
      data = fallbackResult.data
      error = fallbackResult.error
    }
  }

  // If RLS blocks returning/selecting, Supabase can succeed with no row returned.
  // In that case, still provide a best-effort local profile so UI can proceed.
  const profile = (data as Profile | null) ?? null
  if (!error && !profile) {
    return {
      profile: {
        id: userId,
        first_name: first,
        last_name: last,
        full_name: full,
        username: input.username !== undefined ? input.username?.trim() || null : null,
        bio: input.bio !== undefined ? input.bio?.trim() || null : null,
        status: input.status !== undefined ? input.status ?? null : null,
        avatar_url: input.avatar_url !== undefined ? input.avatar_url ?? null : null,
        updated_at: null,
      },
      error: null,
    }
  }

  return { profile, error }
}

export function bestEffortNameFromMetadata(metadata: any): {
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
} {
  const given = typeof metadata?.given_name === 'string' ? metadata.given_name.trim() : ''
  const family = typeof metadata?.family_name === 'string' ? metadata.family_name.trim() : ''
  const full = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''

  let first_name: string | null = given || null
  let last_name: string | null = family || null

  if ((!first_name || !last_name) && full) {
    const parts = full.split(/\s+/).filter(Boolean)
    if (!first_name && parts.length) first_name = parts[0]
    if (!last_name && parts.length > 1) last_name = parts.slice(1).join(' ')
  }

  const avatar_url = typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null

  return { first_name, last_name, avatar_url }
}

