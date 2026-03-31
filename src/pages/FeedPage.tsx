// ============================================================
// FeedPage — Home feed (main page after login)
// Structure mirrors Facebook:
//   • Stories carousel at top
//   • CreatePost box
//   • Infinite-scroll list of PostCards
// Uses the feedStore for data, with infinite scroll via
// Intersection Observer (no external library needed).
// ============================================================

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFeedStore } from '@/store/feedStore'
import MainLayout from '@/components/layout/MainLayout'
import StoriesBar from '@/components/feed/StoriesBar'
import CreatePost from '@/components/feed/CreatePost'
import PostCard from '@/components/feed/PostCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'

export default function FeedPage() {
  const { user } = useAuthStore()
  const { posts, loading, hasMore, fetchPosts } = useFeedStore()

  // ── Sentinel element for infinite scroll ─────────────────
  // When this div enters the viewport, we load more posts.
  const sentinelRef = useRef<HTMLDivElement>(null)

  // ── Initial load ─────────────────────────────────────────
  useEffect(() => {
    if (user) fetchPosts(user.id, true)
  }, [user])

  // ── Intersection observer for infinite scroll ─────────────
  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        // When sentinel comes into view and there's more data, fetch next page
        if (entries[0].isIntersecting && hasMore && !loading && user) {
          fetchPosts(user.id)
        }
      },
      { threshold: 0.1 }  // Trigger when 10% visible
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, user])

  return (
    <MainLayout>
      {/* Stories */}
      <StoriesBar />

      {/* Post composer */}
      <CreatePost />

      {/* Feed posts */}
      {posts.length === 0 && !loading ? (
        // Empty state — shown when user has no posts in feed
        <motion.div
          className="card p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-5xl mb-4">🏖️</div>
          <h3 className="font-display font-bold text-xl text-gray-800 mb-2">
            Your feed is empty
          </h3>
          <p className="text-gray-500 text-sm">
            Add friends and make your first post to get started!
          </p>
        </motion.div>
      ) : (
        <>
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}

          {/* Infinite scroll sentinel + loading indicator */}
          <div ref={sentinelRef} className="h-4" />
          {loading && <LoadingSpinner size={32} className="py-6" />}

          {/* End of feed message */}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              You've reached the end of your feed 🌊
            </p>
          )}
        </>
      )}
    </MainLayout>
  )
}
