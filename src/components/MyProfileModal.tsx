import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getProfile, upsertProfile, type Profile } from '../lib/profile'
import type { Deposit, Tile } from '../store/boardStore'

type MyProfileModalProps = {
  open: boolean
  session: Session
  profile: Profile | null
  isDark: boolean
  goalAmount: number
  tiles: Tile[]
  deposits: Deposit[]
  onClose: () => void
  onProfileSaved: (profile: Profile) => void
  showToast: (message: string, type?: 'success' | 'error') => void
}

const AVATAR_CHOICES = Array.from({ length: 20 }, (_, index) => {
  const avatarNumber = index + 6
  return `/avatars/avatar-${String(avatarNumber).padStart(2, '0')}.svg`
})

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function streakStats(deposits: Deposit[]) {
  const daySet = new Set<string>()
  deposits.forEach((deposit) => {
    const date = new Date(deposit.createdAt)
    if (!Number.isNaN(date.getTime())) {
      daySet.add(date.toISOString().slice(0, 10))
    }
  })
  const days = Array.from(daySet).sort()
  if (!days.length) return { currentStreak: 0, longestStreak: 0 }

  let longest = 1
  let running = 1
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(days[i - 1])
    const current = new Date(days[i])
    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      running += 1
      if (running > longest) longest = running
    } else {
      running = 1
    }
  }

  let currentStreak = 1
  for (let i = days.length - 1; i > 0; i -= 1) {
    const current = new Date(days[i])
    const prev = new Date(days[i - 1])
    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) currentStreak += 1
    else break
  }

  return { currentStreak, longestStreak: longest }
}

export function MyProfileModal({
  open,
  session,
  profile,
  isDark,
  goalAmount,
  tiles,
  deposits,
  onClose,
  onProfileSaved,
  showToast,
}: MyProfileModalProps) {
  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        window.setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms),
      ),
    ])
  }

  const stats = useMemo(() => {
    const totalSaved = deposits.reduce((sum, row) => sum + row.amount, 0)
    const completedDays = tiles.filter((tile) => tile.isDone).length
    const progress = goalAmount > 0 ? Math.min(100, (totalSaved / goalAmount) * 100) : 0
    const avgSaved = completedDays > 0 ? totalSaved / completedDays : 0
    const startCandidate =
      deposits.length > 0
        ? new Date(
            deposits.reduce((min, row) =>
              new Date(row.createdAt).getTime() < new Date(min.createdAt).getTime() ? row : min,
            deposits[0]).createdAt,
          )
        : null
    const startDate = startCandidate && !Number.isNaN(startCandidate.getTime())
      ? startCandidate
      : new Date()
    const elapsedDays = Math.max(
      1,
      Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    )
    const missedDays = Math.max(0, elapsedDays - completedDays)
    const { currentStreak, longestStreak } = streakStats(deposits)
    const autoStatus: 'active' | 'paused' =
      !deposits.length || Date.now() - new Date(deposits[0]?.createdAt ?? Date.now()).getTime() <= 7 * 24 * 60 * 60 * 1000
        ? 'active'
        : 'paused'

    const achievements: string[] = []
    if (longestStreak >= 7) achievements.push('7 Day Streak')
    if (totalSaved >= 100) achievements.push('First 100 Saved')
    if (progress >= 50) achievements.push('Halfway Mark')

    return {
      totalSaved,
      completedDays,
      progress,
      avgSaved,
      startDate,
      missedDays,
      currentStreak,
      longestStreak,
      autoStatus,
      achievements: achievements.slice(0, 3),
      challengeName: `${tiles.length || 30} Day Save Plan`,
    }
  }, [deposits, goalAmount, tiles])

  const initialFirst = profile?.first_name ?? ''
  const initialLast = profile?.last_name ?? ''
  const initialUsername =
    profile?.username ?? (session.user.email?.split('@')[0] || 'user').toLowerCase()
  const initialBio =
    profile?.bio ?? 'Saving for my next big goal, one day at a time.'
  const initialStatus: 'active' | 'paused' =
    profile?.status === 'paused' || profile?.status === 'active'
      ? profile.status
      : stats.autoStatus
  const avatarRaw = profile?.avatar_url?.trim() ?? ''
  const initialAvatar = AVATAR_CHOICES.includes(avatarRaw) ? avatarRaw : AVATAR_CHOICES[0]
  const initialCustomAvatarUrl =
    avatarRaw && !AVATAR_CHOICES.includes(avatarRaw) ? avatarRaw : ''

  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [status, setStatus] = useState<'active' | 'paused'>(initialStatus)
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar)
  const [customAvatarUrl, setCustomAvatarUrl] = useState(initialCustomAvatarUrl)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setEditing(false)
    setFirstName(initialFirst)
    setLastName(initialLast)
    setUsername(initialUsername)
    setBio(initialBio)
    setStatus(initialStatus)
    setSelectedAvatar(initialAvatar)
    setCustomAvatarUrl(initialCustomAvatarUrl)
  }, [
    open,
    initialFirst,
    initialLast,
    initialUsername,
    initialBio,
    initialStatus,
    initialAvatar,
    initialCustomAvatarUrl,
  ])

  if (!open) return null

  const avatarDisplay = customAvatarUrl.trim() || selectedAvatar
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Challenge Board User'
  const progressPercent = Math.round(stats.progress)

  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('First and last name are required.', 'error')
      return
    }
    setSaving(true)
    try {
      const { profile: saved, error } = await withTimeout(
        upsertProfile(session.user.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
          status,
          avatar_url: avatarDisplay,
        }),
        15000,
      )
      if (error || !saved) {
        showToast(error?.message || 'Could not save profile.', 'error')
        return
      }

      // Refresh from DB after save so UI reflects persisted values immediately.
      const { profile: refreshed, error: refreshError } = await withTimeout(
        getProfile(session.user.id),
        10000,
      )
      if (refreshError) {
        showToast(refreshError.message, 'error')
      }
      onProfileSaved(refreshed ?? saved)
      setEditing(false)
      showToast('Profile updated.', 'success')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save profile. Please try again.'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div
          className={[
            'rounded-2xl border p-6 shadow-2xl',
            isDark
              ? 'border-slate-800 bg-slate-950 text-slate-100'
              : 'border-slate-200 bg-white text-slate-900',
          ].join(' ')}
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <img
                src={avatarDisplay}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-emerald-500 object-cover sm:h-28 sm:w-28"
              />
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">{fullName}</h2>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>@{username || 'user'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className={['rounded-lg px-3 py-2 text-sm', isDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'].join(' ')}
              >
                Close
              </button>
            </div>
          </div>

          <div
            className={[
              'rounded-xl border-l-4 p-4',
              isDark
                ? 'border-emerald-500 bg-slate-900/60'
                : 'border-emerald-500 bg-slate-50',
            ].join(' ')}
          >
            <div className={['text-xs uppercase tracking-wide', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
              About My Saving Habit
            </div>
            <p className="mt-1 text-sm italic">{bio}</p>
          </div>

          {editing && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={['rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'].join(' ')} placeholder="First name" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={['rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'].join(' ')} placeholder="Last name" />
              <input value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))} className={['rounded-xl border px-3 py-2 text-sm outline-none sm:col-span-2', isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'].join(' ')} placeholder="Username" />
              <input value={bio} onChange={(e) => setBio(e.target.value)} maxLength={120} className={['rounded-xl border px-3 py-2 text-sm outline-none sm:col-span-2', isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'].join(' ')} placeholder="Short bio" />
              <div className="sm:col-span-2 grid grid-cols-5 gap-2">
                {AVATAR_CHOICES.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatar)
                      setCustomAvatarUrl('')
                    }}
                    className={[
                      'rounded-xl border p-1',
                      selectedAvatar === avatar
                        ? 'border-emerald-500'
                        : isDark
                          ? 'border-slate-700'
                          : 'border-slate-300',
                    ].join(' ')}
                  >
                    <img src={avatar} alt="Avatar option" className="h-8 w-8 rounded-full object-cover" />
                  </button>
                ))}
              </div>
              <input value={customAvatarUrl} onChange={(e) => setCustomAvatarUrl(e.target.value)} className={['rounded-xl border px-3 py-2 text-sm outline-none sm:col-span-2', isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'].join(' ')} placeholder="Avatar URL (optional)" />
              <div className="sm:col-span-2 flex items-center gap-2">
                <button type="button" onClick={() => setStatus('active')} className={['rounded-full px-3 py-1 text-xs font-semibold', status === 'active' ? 'bg-emerald-500 text-black' : isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'].join(' ')}>
                  Active
                </button>
                <button type="button" onClick={() => setStatus('paused')} className={['rounded-full px-3 py-1 text-xs font-semibold', status === 'paused' ? 'bg-amber-400 text-black' : isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'].join(' ')}>
                  Paused
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className={['rounded-2xl border p-5 shadow-xl', isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'].join(' ')}>
            <h3 className="mb-4 text-lg font-semibold">Savings Progress</h3>
            <div className="space-y-4">
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Current Balance</div>
                <div className="text-3xl font-bold text-emerald-500">${Math.round(stats.totalSaved).toLocaleString()}</div>
              </div>
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Total Goal</div>
                <div className="text-3xl font-bold">${Math.round(goalAmount).toLocaleString()}</div>
              </div>
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Progress</div>
                <div className={['mt-2 h-3 w-full overflow-hidden rounded-full', isDark ? 'bg-slate-800' : 'bg-slate-200'].join(' ')}>
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className={['mt-1 text-right text-sm', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>{progressPercent}%</div>
              </div>
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Daily Average</div>
                <div className="text-2xl font-bold text-sky-500">${Math.round(stats.avgSaved).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className={['rounded-2xl border p-5 shadow-xl', isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'].join(' ')}>
            <h3 className="mb-4 text-lg font-semibold">Streak Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Current Streak</div>
                <div className="text-2xl font-bold text-amber-500">{stats.currentStreak} days</div>
              </div>
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Longest Streak</div>
                <div className="text-2xl font-bold text-violet-500">{stats.longestStreak} days</div>
              </div>
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Completed Days</div>
                <div className="text-2xl font-bold text-emerald-500">{stats.completedDays}</div>
              </div>
              <div>
                <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Missed Days</div>
                <div className="text-2xl font-bold text-red-500">{stats.missedDays}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={['rounded-2xl border p-5 shadow-xl', isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'].join(' ')}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Active Challenge</h3>
            <span className={['rounded-full px-3 py-1 text-xs font-semibold', status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'].join(' ')}>
              {status === 'active' ? 'Active' : 'Paused'}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={['rounded-xl p-3', isDark ? 'bg-slate-900/70' : 'bg-slate-50'].join(' ')}>
              <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Challenge Name</div>
              <div className="mt-1 text-base font-semibold">{stats.challengeName}</div>
            </div>
            <div className={['rounded-xl p-3', isDark ? 'bg-slate-900/70' : 'bg-slate-50'].join(' ')}>
              <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Start Date</div>
              <div className="mt-1 text-base font-semibold">{formatDate(stats.startDate)}</div>
            </div>
            <div className={['rounded-xl p-3', isDark ? 'bg-slate-900/70' : 'bg-slate-50'].join(' ')}>
              <div className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>Days Completed</div>
              <div className="mt-1 text-base font-semibold text-emerald-500">
                {stats.completedDays} / {tiles.length || 30}
              </div>
            </div>
          </div>
        </div>

        <div className={['rounded-2xl border p-5 shadow-xl', isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'].join(' ')}>
          <h3 className="mb-4 text-lg font-semibold">Achievements</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.achievements.length === 0 ? (
              <div className={['rounded-xl border p-4 text-sm', isDark ? 'border-slate-700 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'].join(' ')}>
                No achievements yet.
              </div>
            ) : (
              stats.achievements.map((achievement) => (
                <div key={achievement} className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-yellow-100 p-4 text-center">
                  <div className="text-sm font-semibold text-slate-800">{achievement}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
