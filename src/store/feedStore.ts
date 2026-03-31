// ============================================================
// FEED STORE — Zustand
// Manages the list of posts in the home feed.
// Separating feed state from auth state keeps each store small
// and focused. Components subscribe only to what they need.
// ============================================================

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types'

interface FeedState {
  posts:    Post[]       // Ordered list of feed posts
  loading:  boolean
  hasMore:  boolean      // Whether there are more posts to paginate
  page:     number       // Current pagination page (20 posts per page)

  // ─── ACTIONS ───────────────────────────────────────────────
  fetchPosts: (userId: string, reset?: boolean) => Promise<void>
  addPost:    (post: Post)    => void   // Optimistic insert at top of feed
  removePost: (postId: string) => void
  toggleLike: (postId: string, userId: string) => Promise<void>
}

const PAGE_SIZE = 20  // Number of posts fetched per request

export const useFeedStore = create<FeedState>((set, get) => ({
  posts:   [],
  loading: false,
  hasMore: true,
  page:    0,

  // ── fetchPosts ───────────────────────────────────────────────
  // Fetches the next page of posts from Supabase.
  // `reset = true` clears existing posts (used for pull-to-refresh).
  fetchPosts: async (userId, reset = false) => {
    if (get().loading) return  // Prevent duplicate requests

    const page = reset ? 0 : get().page
    set({ loading: true })

    try {
      // Fetch posts with author profile joined via foreign key
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*),
          likes!left(id, user_id)
        `)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) throw error

      // Map the raw DB rows to our Post type, attaching is_liked
      const posts: Post[] = (data ?? []).map((row: any) => ({
        ...row,
        // is_liked is true if the current user's id appears in likes[]
        is_liked: Array.isArray(row.likes)
          ? row.likes.some((l: any) => l.user_id === userId)
          : false,
        // Remove the raw likes array — we only needed it for is_liked
        likes: undefined,
      }))

      set({
        posts:   reset ? posts : [...get().posts, ...posts],
        page:    page + 1,
        hasMore: posts.length === PAGE_SIZE,  // If we got a full page, assume there's more
        loading: false,
      })
    } catch (error) {
      console.error('[FeedStore] fetchPosts error:', error)
      set({ loading: false })
    }
  },

  // ── addPost ──────────────────────────────────────────────────
  // Prepends a new post to the feed immediately (optimistic update).
  // The post was already saved to DB before this is called.
  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts],
  })),

  // ── removePost ───────────────────────────────────────────────
  removePost: (postId) => set((state) => ({
    posts: state.posts.filter((p) => p.id !== postId),
  })),

  // ── toggleLike ───────────────────────────────────────────────
  // Optimistically flips the like state locally, then syncs to DB.
  // This pattern gives instant feedback with no loading spinner.
  toggleLike: async (postId, userId) => {
    const posts = get().posts
    const post  = posts.find((p) => p.id === postId)
    if (!post) return

    const isLiked  = post.is_liked
    const newCount = isLiked ? post.likes_count - 1 : post.likes_count + 1

    // Optimistic update — immediately reflect the change in UI
    set({
      posts: posts.map((p) =>
        p.id === postId
          ? { ...p, is_liked: !isLiked, likes_count: newCount }
          : p
      ),
    })

    try {
      if (isLiked) {
        // Remove the like row
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
      } else {
        // Insert a like row (upsert prevents duplicates)
        await supabase
          .from('likes')
          .upsert({ post_id: postId, user_id: userId })
      }
    } catch (error) {
      // If DB update fails, revert the optimistic change
      console.error('[FeedStore] toggleLike error:', error)
      set({
        posts: posts.map((p) =>
          p.id === postId
            ? { ...p, is_liked: isLiked, likes_count: post.likes_count }
            : p
        ),
      })
    }
  },
}))
