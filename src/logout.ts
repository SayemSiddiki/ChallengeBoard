import { getSupabaseClient } from './supabaseClient'
import { useBoardStore } from './store/boardStore'

export async function logout() {
  const supabase = getSupabaseClient()

  // Reset local board + mark as guest
  try {
    const store = useBoardStore.getState()
    store.setGuestMode(true)
    store.resetBoard()
  } catch (error) {
    console.error('Error resetting local board state on logout', error)
  }

  try {
    if (supabase) {
      await supabase.auth.signOut()
    }
  } catch (error) {
    console.error('Error signing out from Supabase', error)
  } finally {
    try {
      // Also clear persisted board in localStorage
      window.localStorage.removeItem('challenge-board-state-v1')
    } catch {
      // ignore
    }
  }
}

