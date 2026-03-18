import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../lib/profile'

type AuthStore = {
  session: Session | null
  isSessionLoading: boolean
  profile: Profile | null
  isProfileLoading: boolean
  setSession: (session: Session | null) => void
  setIsSessionLoading: (loading: boolean) => void
  setProfile: (profile: Profile | null) => void
  setIsProfileLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isSessionLoading: true,
  profile: null,
  isProfileLoading: false,
  setSession: (session) => set({ session }),
  setIsSessionLoading: (isSessionLoading) => set({ isSessionLoading }),
  setProfile: (profile) => set({ profile }),
  setIsProfileLoading: (isProfileLoading) => set({ isProfileLoading }),
}))

