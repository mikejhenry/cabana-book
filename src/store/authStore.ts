// ============================================================
// AUTH STORE — Zustand
// Global authentication state for CabanaBook.
// Zustand is a lightweight alternative to Redux — one store,
// no boilerplate, works perfectly with React hooks.
//
// Any component can call useAuthStore() to read or update
// the logged-in user without prop drilling.
// ============================================================

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

// ─── STORE SHAPE ─────────────────────────────────────────────
interface AuthState {
  // The raw Supabase auth user (contains email, id, etc.)
  user: User | null
  // The active session (contains access_token, expires_at, etc.)
  session: Session | null
  // The extended profile from our `profiles` table
  profile: Profile | null
  // Loading flag — true while session is being restored on page load
  loading: boolean

  // ─── ACTIONS ───────────────────────────────────────────────
  /** Call once on app mount to restore the existing session */
  initialize: () => Promise<void>
  /** Sign up with email + password and create a profile row */
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<void>
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<void>
  /** Sign out — clears session and resets state */
  signOut: () => Promise<void>
  /** Update the local profile cache (called after profile edits) */
  setProfile: (profile: Profile) => void
}

// ─── STORE DEFINITION ────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  user:    null,
  session: null,
  profile: null,
  loading: true,   // Start true — session not yet loaded

  // ── initialize ──────────────────────────────────────────────
  // Fetches the persisted session from localStorage and loads
  // the user profile. Called in App.tsx on first render.
  initialize: async () => {
    try {
      // getSession() reads from localStorage — no network call
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch the matching profile row from our DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, session, profile, loading: false })
      } else {
        set({ loading: false })
      }

      // Listen for future auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({ user: session.user, session, profile })
        } else {
          // Session ended — clear everything
          set({ user: null, session: null, profile: null })
        }
      })
    } catch (error) {
      console.error('[AuthStore] initialize error:', error)
      set({ loading: false })
    }
  },

  // ── signUp ──────────────────────────────────────────────────
  signUp: async (email, password, fullName, username) => {
    // Step 1: Create the auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('Sign up failed — no user returned.')

    // Step 2: Insert a matching profile row
    // This is safe to do client-side because RLS policies on the
    // `profiles` table only allow INSERT when auth.uid() matches the id.
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id:         data.user.id,  // Must match auth user ID
        email:      email,
        full_name:  fullName,
        username:   username.toLowerCase().replace(/\s+/g, '_'),
      })

    if (profileError) throw profileError
  },

  // ── signIn ──────────────────────────────────────────────────
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // onAuthStateChange listener above handles state update
  },

  // ── signOut ──────────────────────────────────────────────────
  signOut: async () => {
    await supabase.auth.signOut()
    // State reset handled by onAuthStateChange listener
  },

  // ── setProfile ───────────────────────────────────────────────
  setProfile: (profile) => set({ profile }),
}))
