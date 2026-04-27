import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { upsertProfile } from '../lib/profile'
import { useBoardStore } from '../store/boardStore'

function profileFlagKey(userId: string) {
  return `profile-name-set:${userId}`
}

function hasSavedNameFlag(userId: string) {
  try {
    return window.localStorage.getItem(profileFlagKey(userId)) === '1'
  } catch {
    return false
  }
}

function setSavedNameFlag(userId: string) {
  try {
    window.localStorage.setItem(profileFlagKey(userId), '1')
  } catch {
    // ignore
  }
}

export function ProfileNameModal() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const isProfileLoading = useAuthStore((s) => s.isProfileLoading)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setIsProfileLoading = useAuthStore((s) => s.setIsProfileLoading)
  const showToast = useBoardStore((s) => s.showToast)

  const shouldOpen =
    !!session &&
    !isProfileLoading &&
    !hasSavedNameFlag(session.user.id) &&
    (!profile?.first_name || !profile?.last_name)

  const initialFirst = useMemo(() => profile?.first_name ?? '', [profile?.first_name])
  const initialLast = useMemo(() => profile?.last_name ?? '', [profile?.last_name])

  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!shouldOpen) return
    setFirstName(initialFirst)
    setLastName(initialLast)
  }, [shouldOpen, initialFirst, initialLast])

  const canSave = firstName.trim().length > 0 && lastName.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!session) return
    if (!canSave) return
    setSaving(true)
    try {
      setIsProfileLoading(true)
      const { profile: saved, error } = await upsertProfile(session.user.id, {
        first_name: firstName,
        last_name: lastName,
      })
      if (error) {
        showToast('Could not save profile.', 'error')
        return
      }
      setProfile(saved)
      setSavedNameFlag(session.user.id)
      showToast('Profile saved.', 'success')
    } finally {
      setIsProfileLoading(false)
      setSaving(false)
    }
  }

  if (!shouldOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 text-slate-50 shadow-2xl shadow-emerald-500/10">
        <h2 className="text-lg font-semibold">Welcome!</h2>
        <p className="mt-1 text-sm text-slate-300">
          Add your name once so we can show it on your board.
        </p>

        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <label className="block text-[0.7rem] font-medium text-slate-200">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
              autoFocus
              placeholder="First name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[0.7rem] font-medium text-slate-200">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

