// ============================================================
// StoriesBar — Horizontal scrollable stories carousel
// Displays 24-hour ephemeral stories from friends.
// The first card is always "Add Story" (current user's story).
// Framer Motion handles the card entrance stagger.
// ============================================================

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiPlus } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Story } from '@/types'

export default function StoriesBar() {
  const { user, profile } = useAuthStore()
  const [stories, setStories] = useState<Story[]>([])

  // ── Fetch active stories (not expired) ───────────────────
  useEffect(() => {
    if (!user) return

    supabase
      .from('stories')
      .select('*, author:profiles!stories_author_id_fkey(*)')
      .gt('expires_at', new Date().toISOString())  // Only non-expired stories
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setStories((data as Story[]) ?? []))
  }, [user])

  return (
    <div className="card p-3 mb-4">
      {/* Horizontal scroll container — hidden scrollbar for cleanliness */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">

        {/* ── Add Story card (always first) ──────────────── */}
        <motion.div
          className="flex-shrink-0 w-28 h-44 rounded-xl overflow-hidden relative cursor-pointer group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* Top half: profile photo */}
          <div
            className="h-3/4 bg-gradient-to-br from-cabana-400 to-cabana-700 relative overflow-hidden"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Your photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.[0] ?? '?'}
              </div>
            )}
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Bottom: "Add Story" label */}
          <div className="h-1/4 bg-white flex flex-col items-center justify-center">
            {/* + button overlapping the seam */}
            <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full
                            bg-cabana-500 border-4 border-white flex items-center justify-center shadow-md">
              <HiPlus className="text-white text-base font-bold" />
            </div>
            <span className="text-xs font-semibold text-gray-800 mt-2">Add Story</span>
          </div>
        </motion.div>

        {/* ── Friend story cards ──────────────────────────── */}
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            className="flex-shrink-0 w-28 h-44 rounded-xl overflow-hidden relative cursor-pointer group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Story background image */}
            <img
              src={story.image_url}
              alt={`${story.author?.full_name}'s story`}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay — darker at bottom for text readability */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }}
            />

            {/* Author avatar (top-left, ringed in brand blue) */}
            <div className="absolute top-2 left-2 ring-3 ring-cabana-500 rounded-full">
              <Avatar
                src={story.author?.avatar_url ?? null}
                name={story.author?.full_name ?? '?'}
                size={32}
              />
            </div>

            {/* Author name at bottom */}
            <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold truncate">
              {story.author?.full_name}
            </p>
          </motion.div>
        ))}

        {/* Placeholder cards when no stories exist */}
        {stories.length === 0 && [1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex-shrink-0 w-28 h-44 rounded-xl skeleton"
          />
        ))}
      </div>
    </div>
  )
}
