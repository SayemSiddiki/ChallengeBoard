import { create } from 'zustand'
import { getSupabaseClient } from '../supabaseClient'

export type Difficulty = 'easy' | 'mixed' | 'hard'
export type ThemeMode = 'dark' | 'light'

export interface Tile {
  id: string
  amount: number
  isDone: boolean
  doneAt?: string
  note?: string
  completedOutOfOrder?: boolean
}

export interface Deposit {
  id: string
  amount: number
  note?: string
  createdAt: string
  tileId?: string
  tileDay?: number
  completedOutOfOrder?: boolean
}

export interface BoardState {
  goalAmount: number
  tileCount: number
  difficulty: Difficulty
  tiles: Tile[]
  deposits: Deposit[]
  guestMode: boolean
  theme: ThemeMode
  lastAction?: {
    type: 'completeTile' | 'customDeposit'
    payload: any
  }
}

export interface BoardStore extends BoardState {
  setSettings: (settings: {
    goalAmount: number
    tileCount: number
    difficulty: Difficulty
  }) => void
  regenerateBoard: () => void
  completeTile: (tileId: string, note?: string) => void
  addCustomDeposit: (amount: number, note?: string) => void
  undoLastAction: () => void
  resetBoard: () => void
  setTheme: (theme: ThemeMode) => void
  setGuestMode: (guestMode: boolean) => void
  updateDepositNote: (depositId: string, note: string | undefined) => void
  deleteDeposit: (depositId: string) => void
  toast?: {
    id: number
    message: string
    type: 'success' | 'error' | 'info'
  }
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

const STORAGE_KEY = 'challenge-board-state-v1'

function generateTileAmounts(
  goal: number,
  tileCount: number,
  difficulty: Difficulty,
): number[] {
  if (tileCount <= 0) return []

  const minPerTile = 10
  const maxPerTile = 300

  // Generate difficulty-weighted raw weights
  const weights: number[] = []
  for (let i = 0; i < tileCount; i++) {
    const r = Math.random()
    let w: number
    switch (difficulty) {
      case 'easy':
        // Many small, few large
        w = (1 - r) * (1 - r)
        break
      case 'hard':
        // Many large, few small
        w = Math.sqrt(r)
        break
      default:
        // Mixed / balanced
        w = 0.5 + (r - 0.5) * 0.8
        break
    }
    weights.push(Math.max(w, 0.0001))
  }

  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const amounts: number[] = []

  for (let i = 0; i < tileCount; i++) {
    const share = weights[i] / totalWeight
    let amount = Math.round(goal * share)
    if (amount < minPerTile) amount = minPerTile
    if (amount > maxPerTile) amount = maxPerTile
    amounts.push(amount)
  }

  let currentSum = amounts.reduce((s, a) => s + a, 0)
  let diff = goal - currentSum

  // Adjust amounts to hit the goal exactly, staying within [minPerTile, maxPerTile]
  const indices = [...amounts.keys()]

  // Helper to shuffle indices for more natural distribution
  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }

  let safety = tileCount * 1000
  while (diff !== 0 && safety-- > 0) {
    shuffle(indices)
    let changedInPass = false

    for (const idx of indices) {
      if (diff === 0) break
      if (diff > 0 && amounts[idx] < maxPerTile) {
        amounts[idx] += 1
        diff -= 1
        changedInPass = true
      } else if (diff < 0 && amounts[idx] > minPerTile) {
        amounts[idx] -= 1
        diff += 1
        changedInPass = true
      }
    }

    if (!changedInPass) break
  }

  // Final safeguard: if we still didn't hit goal exactly due to bounds,
  // push the remaining difference into a random tile (can exceed max a bit).
  if (diff !== 0 && amounts.length > 0) {
    const idx = Math.floor(Math.random() * amounts.length)
    amounts[idx] += diff
  }

  // Shuffle tiles so big / small amounts are spread across the board
  for (let i = amounts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[amounts[i], amounts[j]] = [amounts[j], amounts[i]]
  }

  return amounts
}

function loadInitialState(): BoardState {
  if (typeof window === 'undefined') {
    return {
      goalAmount: 10000,
      tileCount: 100,
      difficulty: 'mixed',
      tiles: [],
      deposits: [],
      guestMode: true,
      theme: 'dark',
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const goalAmount = 10000
      const tileCount = 100
      const difficulty: Difficulty = 'mixed'
      const amounts = generateTileAmounts(goalAmount, tileCount, difficulty)
      const tiles: Tile[] = amounts.map((amount, index) => ({
        id: `tile-${index}`,
        amount,
        isDone: false,
      }))

      return {
        goalAmount,
        tileCount,
        difficulty,
        tiles,
        deposits: [],
        guestMode: true,
        theme: 'dark',
      }
    }

    const parsed = JSON.parse(raw) as BoardState
    return parsed
  } catch {
    const goalAmount = 10000
    const tileCount = 100
    const difficulty: Difficulty = 'mixed'
    const amounts = generateTileAmounts(goalAmount, tileCount, difficulty)
    const tiles: Tile[] = amounts.map((amount, index) => ({
      id: `tile-${index}`,
      amount,
      isDone: false,
    }))

    return {
      goalAmount,
      tileCount,
      difficulty,
      tiles,
      deposits: [],
      guestMode: true,
      theme: 'dark',
    }
  }
}

function persistState(state: BoardState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

async function syncStateToSupabase(state: BoardState) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const userId = user.id
    const stateToSave = {
      goalAmount: state.goalAmount,
      tileCount: state.tileCount,
      difficulty: state.difficulty,
      tiles: state.tiles,
      deposits: state.deposits,
      theme: state.theme,
    }

    await supabase
      .from('board_state')
      .upsert({ user_id: userId, state: stateToSave }, { onConflict: 'user_id' })
  } catch (error) {
    // Silent fail – sync is best-effort
    console.error('Error syncing board state to Supabase', error)
  }
}

export async function loadBoardStateForCurrentUser() {
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const userId = user.id
    const { data, error } = await supabase
      .from('board_state')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error loading board state from Supabase', error)
      return
    }

    if (data?.state) {
      const incoming = data.state as Partial<BoardState>
      useBoardStore.setState((prev) => {
        const next: BoardState = {
          ...prev,
          goalAmount: incoming.goalAmount ?? prev.goalAmount,
          tileCount: incoming.tileCount ?? prev.tileCount,
          difficulty: (incoming.difficulty as Difficulty) ?? prev.difficulty,
          tiles: incoming.tiles ?? prev.tiles,
          deposits: incoming.deposits ?? prev.deposits,
          theme: (incoming.theme as ThemeMode) ?? prev.theme,
        }
        persistState(next)
        return next
      })
    } else {
      const current = useBoardStore.getState()
      const stateToSave = {
        goalAmount: current.goalAmount,
        tileCount: current.tileCount,
        difficulty: current.difficulty,
        tiles: current.tiles,
        deposits: current.deposits,
        theme: current.theme,
      }
      await supabase.from('board_state').insert({
        user_id: userId,
        state: stateToSave,
      })
    }
  } catch (error) {
    console.error('Error in loadBoardStateForCurrentUser', error)
  }
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  ...loadInitialState(),
  toast: undefined,
  setSettings: (settings) => {
    set((state) => {
      const amounts = generateTileAmounts(
        settings.goalAmount,
        settings.tileCount,
        settings.difficulty,
      )
      const tiles: Tile[] = amounts.map((amount, index) => ({
        id: `tile-${index}`,
        amount,
        isDone: false,
      }))
      const next: BoardState = {
        ...state,
        ...settings,
        tiles,
        deposits: [],
        lastAction: undefined,
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  setGuestMode: (guestMode) => {
    set((state) => {
      const next: BoardState = {
        ...state,
        guestMode,
      }
      persistState(next)
      return next
    })
  },
  updateDepositNote: (depositId, note) => {
    set((state) => {
      const hasDeposit = state.deposits.some((d) => d.id === depositId)
      if (!hasDeposit) return state
      const updatedDeposits = state.deposits.map((d) =>
        d.id === depositId ? { ...d, note } : d,
      )
      const next: BoardState = {
        ...state,
        deposits: updatedDeposits,
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  deleteDeposit: (depositId) => {
    set((state) => {
      const target = state.deposits.find((d) => d.id === depositId)
      if (!target) return state

      let updatedTiles = state.tiles
      // If this deposit came from a tile, also reopen that tile
      if (target.tileId) {
        updatedTiles = state.tiles.map((t) =>
          t.id === target.tileId
            ? {
                ...t,
                isDone: false,
                doneAt: undefined,
                note: undefined,
              }
            : t,
        )
      }

      const updatedDeposits = state.deposits.filter((d) => d.id !== depositId)

      const next: BoardState = {
        ...state,
        tiles: updatedTiles,
        deposits: updatedDeposits,
        lastAction: undefined,
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  regenerateBoard: () => {
    set((state) => {
      const amounts = generateTileAmounts(
        state.goalAmount,
        state.tileCount,
        state.difficulty,
      )
      const tiles: Tile[] = amounts.map((amount, index) => ({
        id: `tile-${index}`,
        amount,
        isDone: false,
      }))
      const next: BoardState = {
        ...state,
        tiles,
        deposits: [],
        lastAction: undefined,
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  completeTile: (tileId, note) => {
    const now = new Date().toISOString()
    set((state) => {
      const tile = state.tiles.find((t) => t.id === tileId)
      if (!tile || tile.isDone) return state

      const tileIndex = state.tiles.findIndex((t) => t.id === tileId)
      const tileDay = tileIndex >= 0 ? tileIndex + 1 : undefined
      const todayIndex = state.tiles.findIndex((t) => !t.isDone)
      const completedOutOfOrder =
        todayIndex >= 0 && tileIndex >= 0 && tileIndex !== todayIndex

      const updatedTiles = state.tiles.map((t) =>
        t.id === tileId
          ? {
              ...t,
              isDone: true,
              doneAt: now,
              note,
              completedOutOfOrder,
            }
          : t,
      )

      const deposit: Deposit = {
        id: `dep-${now}-${tileId}`,
        amount: tile.amount,
        note,
        createdAt: now,
        tileId,
        tileDay,
        completedOutOfOrder,
      }

      const next: BoardState = {
        ...state,
        tiles: updatedTiles,
        deposits: [deposit, ...state.deposits],
        lastAction: {
          type: 'completeTile',
          payload: { tileId, depositId: deposit.id },
        },
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  addCustomDeposit: (amount, note) => {
    const now = new Date().toISOString()
    set((state) => {
      const deposit: Deposit = {
        id: `custom-${now}`,
        amount,
        note,
        createdAt: now,
      }
      const next: BoardState = {
        ...state,
        deposits: [deposit, ...state.deposits],
        lastAction: {
          type: 'customDeposit',
          payload: { depositId: deposit.id },
        },
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  undoLastAction: () => {
    const last = get().lastAction
    if (!last) return

    set((state) => {
      if (!state.lastAction) return state
      if (state.lastAction.type === 'completeTile') {
        const { tileId, depositId } = state.lastAction.payload
        const updatedTiles = state.tiles.map((t) =>
          t.id === tileId
            ? {
                ...t,
                isDone: false,
                doneAt: undefined,
                note: undefined,
              }
            : t,
        )
        const updatedDeposits = state.deposits.filter(
          (d) => d.id !== depositId,
        )
        const next: BoardState = {
          ...state,
          tiles: updatedTiles,
          deposits: updatedDeposits,
          lastAction: undefined,
        }
        persistState(next)
        syncStateToSupabase(next)
        return next
      }

      if (state.lastAction.type === 'customDeposit') {
        const { depositId } = state.lastAction.payload
        const updatedDeposits = state.deposits.filter(
          (d) => d.id !== depositId,
        )
        const next: BoardState = {
          ...state,
          deposits: updatedDeposits,
          lastAction: undefined,
        }
        persistState(next)
        syncStateToSupabase(next)
        return next
      }

      return state
    })
  },
  resetBoard: () => {
    set((state) => {
      const amounts = generateTileAmounts(
        state.goalAmount,
        state.tileCount,
        state.difficulty,
      )
      const tiles: Tile[] = amounts.map((amount, index) => ({
        id: `tile-${index}`,
        amount,
        isDone: false,
      }))
      const next: BoardState = {
        ...state,
        tiles,
        deposits: [],
        lastAction: undefined,
      }
      persistState(next)
      syncStateToSupabase(next)
      return next
    })
  },
  setTheme: (theme) => {
    set((state) => {
      const next: BoardState = {
        ...state,
        theme,
      }
      persistState(next)
      return next
    })
  },
  showToast: (message, type = 'info') => {
    const id = Date.now()
    set(() => ({
      toast: { id, message, type },
    }))
  },
  clearToast: () => {
    set(() => ({ toast: undefined }))
  },
}))

