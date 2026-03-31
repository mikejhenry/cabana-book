// ============================================================
// useProfile HOOK
// Fetches a user profile by ID or username from Supabase.
// Encapsulates loading + error state so components stay clean.
// ============================================================

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface UseProfileResult {
  profile: Profile | null
  loading: boolean
  error: string | null
  refetch: () => void  // Call to manually reload the profile
}

/**
 * Fetches a profile by its UUID.
 * Pass `null` to skip the fetch (useful when ID isn't ready yet).
 */
export function useProfile(userId: string | null): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)  // Incremented to trigger a refetch

  useEffect(() => {
    if (!userId) return  // Nothing to fetch

    let cancelled = false  // Prevent stale state updates after unmount
    setLoading(true)
    setError(null)

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setProfile(data)
        }
        setLoading(false)
      })

    // Cleanup: mark as cancelled if the component unmounts before the request completes
    return () => { cancelled = true }
  }, [userId, tick])

  return {
    profile,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
