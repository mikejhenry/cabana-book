// ============================================================
// PostCard — Individual post in the feed
// Features:
//   • Author info + timestamp
//   • Post text + optional image
//   • Like (optimistic toggle with heart animation)
//   • Comment count + Share button
//   • Inline comment section (expandable)
//   • Framer Motion entrance animation via useInView
// ============================================================

import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  HiThumbUp, HiChatAlt, HiShare, HiDotsHorizontal,
  HiGlobe, HiTrash, HiPencil,
} from 'react-icons/hi'
import { AiFillHeart } from 'react-icons/ai'
import Avatar from '@/components/ui/Avatar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useFeedStore } from '@/store/feedStore'
import type { Post, Comment } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface PostCardProps {
  post: Post
  // Animation delay index for staggered feed entrance
  index?: number
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const { user } = useAuthStore()
  const { toggleLike, removePost } = useFeedStore()

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]         = useState<Comment[]>([])
  const [commentText, setCommentText]   = useState('')
  const [commentsLoaded, setCommLoaded] = useState(false)
  const [likeAnim, setLikeAnim]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)

  // Intersection observer: only animate in when post enters viewport
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const isOwner = user?.id === post.author_id

  // ── Handle like ──────────────────────────────────────────
  const handleLike = () => {
    if (!user) return
    // Trigger heart pop animation
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 300)
    toggleLike(post.id, user.id)
  }

  // ── Load comments when section opens ─────────────────────
  const loadComments = async () => {
    if (commentsLoaded) { setShowComments(!showComments); return }

    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    setComments((data as Comment[]) ?? [])
    setCommLoaded(true)
    setShowComments(true)
  }

  // ── Submit a comment ─────────────────────────────────────
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: post.id, author_id: user.id, content: commentText.trim() })
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .single()

    if (error) { toast.error('Could not post comment.'); return }
    setComments((prev) => [...prev, data as Comment])
    setCommentText('')
  }

  // ── Delete own post ───────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    removePost(post.id)
    toast.success('Post deleted.')
  }

  const author = post.author

  return (
    // Ref for intersection observer — triggers entrance animation
    <div ref={inViewRef}>
      <motion.article
        className="card mb-3 overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4), ease: 'easeOut' }}
      >
        {/* ── POST HEADER ────────────────────────────────── */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${author?.id}`}>
              <Avatar src={author?.avatar_url} name={author?.full_name ?? 'User'} size={42} />
            </Link>
            <div>
              <Link
                to={`/profile/${author?.id}`}
                className="font-semibold text-gray-900 text-sm hover:underline"
              >
                {author?.full_name}
              </Link>
              {post.feeling && (
                <span className="text-gray-500 text-sm"> — is feeling {post.feeling}</span>
              )}
              {post.location && (
                <span className="text-gray-500 text-sm"> in {post.location}</span>
              )}
              {/* Timestamp + visibility icon */}
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                <span>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                <span>·</span>
                <HiGlobe title="Public post" />
              </div>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-gray-500"
            >
              <HiDotsHorizontal className="text-xl" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 top-10 w-52 card shadow-hover z-20 py-1"
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                >
                  {isOwner && (
                    <>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-surface-hover text-sm text-gray-700 text-left"
                        onClick={() => setMenuOpen(false)}
                      >
                        <HiPencil /> Edit post
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-surface-hover text-sm text-red-600 text-left"
                        onClick={handleDelete}
                      >
                        <HiTrash /> Delete post
                      </button>
                    </>
                  )}
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-surface-hover text-sm text-gray-700 text-left"
                    onClick={() => setMenuOpen(false)}
                  >
                    Save post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── POST BODY ──────────────────────────────────── */}
        {post.content && (
          <p className="px-4 pb-3 text-gray-900 text-[15px] leading-snug whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* ── POST IMAGE ─────────────────────────────────── */}
        {post.image_url && (
          <div className="overflow-hidden">
            <motion.img
              src={post.image_url}
              alt="Post attachment"
              className="w-full max-h-[500px] object-cover cursor-pointer"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* ── STATS ROW ──────────────────────────────────── */}
        {(post.likes_count > 0 || post.comments_count > 0) && (
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
            {post.likes_count > 0 && (
              <div className="flex items-center gap-1">
                {/* Mini colored reaction icons */}
                <span className="w-[18px] h-[18px] rounded-full bg-cabana-500 flex items-center justify-center text-[9px]">👍</span>
                <span>{post.likes_count}</span>
              </div>
            )}
            {post.comments_count > 0 && (
              <button
                onClick={loadComments}
                className="hover:underline ml-auto"
              >
                {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* ── ACTION BUTTONS ─────────────────────────────── */}
        <div className="border-t border-surface-border mx-4" />
        <div className="flex px-2 py-1">
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
              transition-colors font-semibold text-sm
              ${post.is_liked
                ? 'text-cabana-600 hover:bg-cabana-50'
                : 'text-gray-600 hover:bg-surface-hover'}
            `}
          >
            <motion.span
              animate={likeAnim ? { scale: [1, 1.45, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {post.is_liked
                ? <AiFillHeart className="text-xl text-red-500" />
                : <HiThumbUp className="text-xl" />}
            </motion.span>
            <span>{post.is_liked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment button */}
          <button
            onClick={loadComments}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                       text-gray-600 hover:bg-surface-hover transition-colors font-semibold text-sm"
          >
            <HiChatAlt className="text-xl" />
            Comment
          </button>

          {/* Share button */}
          <button
            onClick={() => toast.success('Share link copied!')}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                       text-gray-600 hover:bg-surface-hover transition-colors font-semibold text-sm"
          >
            <HiShare className="text-xl" />
            Share
          </button>
        </div>

        {/* ── COMMENTS SECTION ───────────────────────────── */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-surface-border px-4 pt-3 pb-4 space-y-3">
                {/* Comment list */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar
                      src={comment.author?.avatar_url}
                      name={comment.author?.full_name ?? '?'}
                      size={32}
                    />
                    <div className="flex-1 bg-surface-input rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold text-gray-900">{comment.author?.full_name}</p>
                      <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* New comment input */}
                <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
                  <Avatar
                    src={null}
                    name={user?.email ?? 'User'}
                    size={32}
                  />
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-surface-input rounded-full px-4 py-2 text-sm outline-none
                               border border-transparent focus:border-cabana-300 transition-colors"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Close dropdown when clicking outside */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  )
}
