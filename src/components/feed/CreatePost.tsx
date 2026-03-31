// ============================================================
// CreatePost — Post composer box at the top of the feed
// Expands on click to reveal full text area, feeling picker,
// photo upload. Submits to Supabase and triggers optimistic
// feed update via the feedStore.
// ============================================================

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPhotograph, HiEmojiHappy, HiLocationMarker,
  HiX, HiPaperAirplane,
} from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase, uploadFile, BUCKETS } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useFeedStore } from '@/store/feedStore'
import toast from 'react-hot-toast'
import type { Post } from '@/types'

const FEELINGS = ['😊 Happy', '😍 Loved', '😂 Laughing', '🎉 Celebrating', '🌊 Vibing', '🔥 Excited', '😌 Relaxed', '🤔 Thinking']

export default function CreatePost() {
  const { user, profile } = useAuthStore()
  const { addPost } = useFeedStore()

  const [expanded, setExpanded]     = useState(false)
  const [content, setContent]       = useState('')
  const [feeling, setFeeling]       = useState<string | null>(null)
  const [location, setLocation]     = useState('')
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setPreview]  = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [showFeelings, setShowFeel] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  // ── Handle image selection ────────────────────────────────
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    // Create a local blob URL for instant preview (no upload yet)
    setPreview(URL.createObjectURL(file))
  }

  // ── Remove chosen image ───────────────────────────────────
  const clearImage = () => {
    setImageFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit post ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return
    if (!user || !profile) return

    setLoading(true)
    try {
      let image_url: string | null = null

      // Upload image to Supabase Storage if one was selected
      if (imageFile) {
        const ext  = imageFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const stored = await uploadFile(BUCKETS.posts, path, imageFile)
        const { data } = supabase.storage.from(BUCKETS.posts).getPublicUrl(stored)
        image_url = data.publicUrl
      }

      // Insert the post row into Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id:  user.id,
          content:    content.trim(),
          image_url,
          feeling,
          location:   location.trim() || null,
        })
        .select('*, author:profiles!posts_author_id_fkey(*)')
        .single()

      if (error) throw error

      // Optimistically add the new post to the top of the feed
      addPost({ ...(data as Post), is_liked: false })
      toast.success('Post shared! 🌊')

      // Reset form
      setContent('');  setFeeling(null);  setLocation('');
      clearImage();    setExpanded(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to post. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 mb-4">
      {/* ── Collapsed trigger row ────────────────────────── */}
      <div className="flex items-center gap-3">
        <Avatar src={profile?.avatar_url} name={profile?.full_name ?? 'User'} size={40} />
        <button
          onClick={() => setExpanded(true)}
          className="flex-1 bg-surface-input hover:bg-surface-hover transition-colors
                     rounded-full px-4 py-2.5 text-left text-gray-500 text-sm font-medium"
        >
          {`What's on your mind, ${profile?.full_name?.split(' ')[0] ?? 'friend'}?`}
        </button>
      </div>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-surface-border mt-3 mb-1" />

      {/* ── Quick action buttons ─────────────────────────── */}
      <div className="flex">
        <button
          onClick={() => { setExpanded(true); fileRef.current?.click() }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                     hover:bg-surface-hover transition-colors text-sm font-semibold text-gray-600"
        >
          <HiPhotograph className="text-green-500 text-xl" />
          Photo/Video
        </button>
        <button
          onClick={() => { setExpanded(true); setShowFeel(true) }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                     hover:bg-surface-hover transition-colors text-sm font-semibold text-gray-600"
        >
          <HiEmojiHappy className="text-yellow-500 text-xl" />
          Feeling
        </button>
        <button
          onClick={() => { setExpanded(true) }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                     hover:bg-surface-hover transition-colors text-sm font-semibold text-gray-600"
        >
          <HiLocationMarker className="text-red-500 text-xl" />
          Location
        </button>
      </div>

      {/* ── Expanded composer ────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-surface-border pt-4 mt-2">
              {/* Author info + close button */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar src={profile?.avatar_url} name={profile?.full_name ?? 'User'} size={36} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{profile?.full_name}</p>
                    {feeling && (
                      <p className="text-xs text-gray-500">is feeling {feeling}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-gray-500"
                >
                  <HiX />
                </button>
              </div>

              {/* Text area */}
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind, ${profile?.full_name?.split(' ')[0] ?? 'friend'}?`}
                rows={4}
                className="w-full resize-none bg-transparent text-gray-900 text-lg
                           placeholder-gray-400 outline-none leading-snug"
              />

              {/* Image preview */}
              {imagePreview && (
                <div className="relative mt-3 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-72 object-cover rounded-xl" />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white
                               rounded-full flex items-center justify-center hover:bg-black/80 transition"
                  >
                    <HiX />
                  </button>
                </div>
              )}

              {/* Location input */}
              <AnimatePresence>
                {location !== undefined && expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2 bg-surface-input rounded-lg px-3 py-2">
                      <HiLocationMarker className="text-red-500" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add location..."
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feeling picker */}
              <AnimatePresence>
                {showFeelings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 grid grid-cols-4 gap-2 overflow-hidden"
                  >
                    {FEELINGS.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setFeeling(f); setShowFeel(false) }}
                        className={`
                          text-sm py-1.5 px-2 rounded-lg border transition-all text-left
                          ${feeling === f
                            ? 'border-cabana-400 bg-cabana-50 text-cabana-700'
                            : 'border-surface-border hover:border-cabana-300 hover:bg-cabana-50 text-gray-700'}
                        `}
                      >
                        {f}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add to your post toolbar */}
              <div className="flex items-center justify-between mt-4 p-2 bg-surface-input rounded-xl">
                <p className="text-sm font-semibold text-gray-700">Add to your post</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
                    title="Add photo"
                  >
                    <HiPhotograph className="text-green-500 text-xl" />
                  </button>
                  <button
                    onClick={() => setShowFeel(!showFeelings)}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
                    title="Add feeling"
                  >
                    <HiEmojiHappy className="text-yellow-500 text-xl" />
                  </button>
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
                    title="Add location"
                  >
                    <HiLocationMarker className="text-red-500 text-xl" />
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && !imageFile)}
                className="btn-primary w-full mt-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size={20} /> : (
                  <span className="flex items-center gap-2">
                    <HiPaperAirplane className="rotate-90" />
                    Post
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input — triggered by button clicks above */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleImage}
        className="hidden"
      />
    </div>
  )
}
