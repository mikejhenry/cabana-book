// ============================================================
// SUPABASE CLIENT — CabanaBook
// Creates the singleton Supabase client used throughout the app.
// Import `supabase` from here wherever you need DB access.
//
// Environment variables are set in .env (local) and in
// Netlify's environment settings for production.
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Vite exposes .env variables via import.meta.env.
// VITE_ prefix is required for client-side exposure.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validate that env vars are present at startup to catch config mistakes early
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[CabanaBook] Missing Supabase env vars. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  )
}

// createClient returns a typed client with auth, storage, and database methods.
// We export a single instance (singleton pattern) so all modules share one connection.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the user session in localStorage so they stay logged in on refresh
    persistSession: true,
    // Auto-refresh the JWT access token before it expires
    autoRefreshToken: true,
    // Use the URL hash to detect OAuth redirects (e.g., Google login)
    detectSessionInUrl: true,
  },
})

// ─── STORAGE BUCKET HELPERS ──────────────────────────────────
// Centralize bucket names so a typo doesn't cause silent failures.
export const BUCKETS = {
  avatars:  'avatars',   // Profile photos
  covers:   'covers',    // Cover/banner photos
  posts:    'posts',     // Post image attachments
  stories:  'stories',  // Story images
} as const

/**
 * Builds a public URL for a file in a Supabase Storage bucket.
 * Returns null if path is falsy (avoids broken <img> tags).
 */
export function getPublicUrl(bucket: string, path: string | null): string | null {
  if (!path) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl ?? null
}

/**
 * Uploads a file to a bucket and returns the storage path.
 * Throws on error so callers can handle it with try/catch.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,       // Overwrite if exists (for re-uploads)
      cacheControl: '3600', // 1-hour browser cache
    })

  if (error) throw error
  return data.path
}
