// ============================================================
// ProfilePage — User profile view
// Displays: cover photo, avatar, bio, friends count, post count.
// If viewing your own profile: shows Edit Profile button.
// If viewing another: shows Add Friend / Message buttons.
// Posts section shows only this user's posts.
// ============================================================

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiPencil, HiUserAdd, HiChatAlt2, HiLocationMarker, HiGlobe } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import PostCard from '@/components/feed/PostCard'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile, Post } from '@/types'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuthStore()

  const [profile, setProfile]   = useState<Profile | null>(null)
  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [isFriend, setIsFriend] = useState(false)

  const isOwnProfile = user?.id === userId

  // ── Load profile + posts ──────────────────────────────────
  useEffect(() => {
    if (!userId) return

    setLoading(true)
    Promise.all([
      // Fetch profile
      supabase.from('profiles').select('*').eq('id', userId).single(),
      // Fetch this user's posts, newest first
      supabase
        .from('posts')
        .select('*, author:profiles!posts_author_id_fkey(*)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      // Check if current user is friends with this person
      user
        ? supabase
            .from('friendships')
            .select('id')
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
            .eq('status', 'accepted')
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]).then(([profileRes, postsRes, friendRes]) => {
      setProfile(profileRes.data as Profile)
      setPosts((postsRes.data as Post[]) ?? [])
      setIsFriend(!!friendRes.data)
      setLoading(false)
    })
  }, [userId, user])

  // ── Send friend request ───────────────────────────────────
  const sendFriendRequest = async () => {
    if (!user || !userId) return
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, addressee_id: userId, status: 'pending' })
    if (error) { toast.error('Could not send request.'); return }
    toast.success('Friend request sent!')
  }

  if (loading) return (
    <MainLayout hideRightSidebar>
      <LoadingSpinner size={40} className="py-20" />
    </MainLayout>
  )

  if (!profile) return (
    <MainLayout hideRightSidebar>
      <div className="text-center py-20 text-gray-500">Profile not found.</div>
    </MainLayout>
  )

  return (
    <MainLayout hideRightSidebar>
      <div className="max-w-[680px] mx-auto">

        {/* ── COVER + AVATAR BLOCK ────────────────────────── */}
        <motion.div
          className="card overflow-hidden mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cover photo */}
          <div
            className="h-56 sm:h-72 w-full relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1b4eaa 0%, #3b93f3 50%, #06b6d4 100%)' }}
          >
            {profile.cover_url && (
              <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
            )}
            {/* Subtle wave overlay at the bottom of cover */}
            <svg
              className="absolute bottom-0 w-full"
              viewBox="0 0 1440 40"
              preserveAspectRatio="none"
              style={{ height: 40 }}
            >
              <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40 Z" fill="white"/>
            </svg>
          </div>

          {/* Avatar + name + actions */}
          <div className="px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-12 mb-4">
              {/* Avatar with ring */}
              <div className="ring-4 ring-white rounded-full w-fit mb-3 sm:mb-0">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name}
                  size={120}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {isOwnProfile ? (
                  <button className="btn-ghost flex items-center gap-2">
                    <HiPencil />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    {!isFriend && (
                      <button onClick={sendFriendRequest} className="btn-primary flex items-center gap-2">
                        <HiUserAdd />
                        Add Friend
                      </button>
                    )}
                    <button className="btn-ghost flex items-center gap-2">
                      <HiChatAlt2 />
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name + username */}
            <h1 className="font-display font-bold text-2xl text-gray-900">{profile.full_name}</h1>
            <p className="text-gray-500 text-sm mb-3">@{profile.username}</p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">{profile.bio}</p>
            )}

            {/* Location + Website */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <HiLocationMarker className="text-cabana-400" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer"
                   className="flex items-center gap-1 hover:text-cabana-600 transition-colors">
                  <HiGlobe className="text-cabana-400" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-6 text-sm border-t border-surface-border pt-4">
              <div className="text-center">
                <p className="font-bold text-gray-900">{posts.length}</p>
                <p className="text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">—</p>
                <p className="text-gray-500">Friends</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">—</p>
                <p className="text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── POSTS SECTION ──────────────────────────────── */}
        <div>
          {posts.length === 0 ? (
            <div className="card p-12 text-center text-gray-500 text-sm">
              <div className="text-4xl mb-3">🏖️</div>
              <p>No posts yet.</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
