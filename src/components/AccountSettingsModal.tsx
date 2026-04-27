import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../lib/profile'
import { upsertProfile } from '../lib/profile'
import { getSupabaseClient } from '../supabaseClient'

const AVATAR_CHOICES = Array.from({ length: 20 }, (_, index) => {
  const avatarNumber = index + 6
  return `/avatars/avatar-${String(avatarNumber).padStart(2, '0')}.svg`
})

type AccountSettingsModalProps = {
  open: boolean
  session: Session
  profile: Profile | null
  isDark: boolean
  onClose: () => void
  onProfileSaved: (profile: Profile) => void
  showToast: (message: string, type?: 'success' | 'error') => void
}

export function AccountSettingsModal({
  open,
  session,
  profile,
  isDark,
  onClose,
  onProfileSaved,
  showToast,
}: AccountSettingsModalProps) {
  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        window.setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms),
      ),
    ])
  }

  const initialName = useMemo(
    () => ({
      first: profile?.first_name ?? '',
      last: profile?.last_name ?? '',
    }),
    [profile?.first_name, profile?.last_name],
  )
  const initialAvatar = useMemo(() => {
    const raw = profile?.avatar_url?.trim() ?? ''
    if (raw && AVATAR_CHOICES.includes(raw)) {
      return raw
    }
    return AVATAR_CHOICES[0]
  }, [profile?.avatar_url])
  const initialCustomAvatarUrl = useMemo(() => {
    const raw = profile?.avatar_url?.trim() ?? ''
    return raw && !raw.startsWith('emoji:') ? raw : ''
  }, [profile?.avatar_url])

  const [firstName, setFirstName] = useState(initialName.first)
  const [lastName, setLastName] = useState(initialName.last)
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar)
  const [customAvatarUrl, setCustomAvatarUrl] = useState(initialCustomAvatarUrl)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (!open) return
    setFirstName(initialName.first)
    setLastName(initialName.last)
    setSelectedAvatar(initialAvatar)
    setCustomAvatarUrl(initialCustomAvatarUrl)
    setNewPassword('')
    setConfirmPassword('')
  }, [open, initialName.first, initialName.last, initialAvatar, initialCustomAvatarUrl])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const canSaveProfile =
    firstName.trim().length > 0 && lastName.trim().length > 0 && !savingProfile
  const canUpdatePassword =
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword &&
    !savingPassword

  const saveProfile = async () => {
    if (!canSaveProfile) return
    setSavingProfile(true)
    try {
      const avatarToSave = customAvatarUrl.trim()
        ? customAvatarUrl.trim()
        : selectedAvatar
      const { profile: saved, error } = await withTimeout(
        upsertProfile(session.user.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          avatar_url: avatarToSave,
        }),
        15000,
      )
      if (error || !saved) {
        showToast('Could not save profile.', 'error')
        return
      }
      onProfileSaved(saved)
      showToast('Profile updated.', 'success')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save profile. Please try again.'
      showToast(message, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const updatePassword = async () => {
    if (!canUpdatePassword) return
    setSavingPassword(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        showToast('Supabase is not configured.', 'error')
        return
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) {
        showToast(error.message || 'Could not update password.', 'error')
        return
      }
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated.', 'success')
    } finally {
      setSavingPassword(false)
    }
  }

  const sendResetPasswordEmail = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      showToast('Supabase is not configured.', 'error')
      return
    }
    const email = session.user.email
    if (!email) {
      showToast('No email found for this account.', 'error')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      showToast(error.message || 'Could not send reset email.', 'error')
      return
    }
    showToast('Password reset email sent.', 'success')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className={[
          'w-full max-w-xl rounded-3xl border p-6 shadow-2xl',
          isDark
            ? 'border-slate-800 bg-slate-950 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Account settings</h2>
            <p className={['mt-1 text-sm', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
              Manage your profile, avatar, and password.
            </p>
            <p className={['mt-1 text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
              Email: {session.user.email ?? 'No email'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={['rounded-full px-2 py-1 text-sm', isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'].join(' ')}
            aria-label="Close account settings"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <section className={['rounded-2xl border p-4', isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <h3 className="text-sm font-semibold">Profile</h3>
            <div className="mt-3 space-y-3">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={['w-full rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'].join(' ')}
                placeholder="First name"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={['w-full rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'].join(' ')}
                placeholder="Last name"
              />
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_CHOICES.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatar)
                      setCustomAvatarUrl('')
                    }}
                    className={[
                      'inline-flex h-10 items-center justify-center rounded-xl border text-lg transition',
                      selectedAvatar === avatar
                        ? 'border-emerald-500 bg-emerald-500/15'
                        : isDark
                          ? 'border-slate-700 bg-slate-950 hover:border-slate-600'
                          : 'border-slate-300 bg-white hover:border-slate-400',
                    ].join(' ')}
                    aria-label="Choose avatar"
                  >
                    <img
                      src={avatar}
                      alt="Avatar option"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <input
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className={['w-full rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'].join(' ')}
                placeholder="Optional avatar image URL"
              />
              <button
                type="button"
                onClick={saveProfile}
                disabled={!canSaveProfile}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
              >
                {savingProfile ? 'Saving profile...' : 'Save profile'}
              </button>
            </div>
          </section>

          <section className={['rounded-2xl border p-4', isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <h3 className="text-sm font-semibold">Security</h3>
            <div className="mt-3 space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={['w-full rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'].join(' ')}
                placeholder="New password (min 6 characters)"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={['w-full rounded-xl border px-3 py-2 text-sm outline-none', isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'].join(' ')}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={updatePassword}
                disabled={!canUpdatePassword}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow shadow-emerald-500/40 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
              >
                {savingPassword ? 'Updating password...' : 'Update password'}
              </button>
              <button
                type="button"
                onClick={sendResetPasswordEmail}
                className={[
                  'inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition',
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                Send reset email
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
