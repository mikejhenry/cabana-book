// ============================================================
// FriendsPage — Friend requests, suggestions, and friend list
// Three tabs: Requests / Suggestions / All Friends
// ============================================================

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiUserAdd, HiCheck, HiX } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Friendship, Profile } from '@/types'
import toast from 'react-hot-toast'

type Tab = 'requests' | 'suggestions' | 'friends'

export default function FriendsPage() {
  const { user } = useAuthStore()
  const [tab, setTab]               = useState<Tab>('requests')
  const [requests, setRequests]     = useState<Friendship[]>([])
  const [friends, setFriends]       = useState<Profile[]>([])
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [loading, setLoading]       = useState(true)

  // ── Load data based on active tab ────────────────────────
  useEffect(() => {
    if (!user) return
    setLoading(true)

    if (tab === 'requests') {
      supabase
        .from('friendships')
        .select('*, requester:profiles!friendships_requester_id_fkey(*)')
        .eq('addressee_id', user.id)
        .eq('status', 'pending')
        .then(({ data }) => { setRequests((data as Friendship[]) ?? []); setLoading(false) })
    } else if (tab === 'friends') {
      supabase
        .from('friendships')
        .select('addressee:profiles!friendships_addressee_id_fkey(*), requester:profiles!friendships_requester_id_fkey(*)')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .then(({ data }) => {
          const list = (data ?? []).map((row: any) =>
            row.requester.id === user.id ? row.addressee : row.requester
          )
          setFriends(list)
          setLoading(false)
        })
    } else {
      // Suggestions: people you're NOT already friends with
      supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(12)
        .then(({ data }) => { setSuggestions((data as Profile[]) ?? []); setLoading(false) })
    }
  }, [tab, user])

  // ── Accept friend request ─────────────────────────────────
  const acceptRequest = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    setRequests((prev) => prev.filter((r) => r.id !== friendshipId))
    toast.success('Friend request accepted!')
  }

  // ── Decline friend request ────────────────────────────────
  const declineRequest = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    setRequests((prev) => prev.filter((r) => r.id !== friendshipId))
    toast('Request declined.')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'requests',    label: `Requests${requests.length ? ` (${requests.length})` : ''}` },
    { key: 'suggestions', label: 'People You May Know' },
    { key: 'friends',     label: 'All Friends' },
  ]

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="card p-5 mb-4">
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-4">Friends</h1>
          {/* Tab bar */}
          <div className="flex gap-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${tab === key
                    ? 'bg-cabana-50 text-cabana-700'
                    : 'text-gray-600 hover:bg-surface-hover'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <LoadingSpinner size={36} className="py-16" />
            ) : tab === 'requests' ? (
              // ── Friend Requests ────────────────────────────
              requests.length === 0 ? (
                <div className="card p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">✉️</div>
                  <p>No pending friend requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {requests.map((req) => (
                    <div key={req.id} className="card p-4 flex flex-col gap-3">
                      <Link to={`/profile/${req.requester?.id}`} className="flex items-center gap-3 group">
                        <Avatar src={req.requester?.avatar_url} name={req.requester?.full_name ?? '?'} size={56} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-cabana-600 transition-colors">
                            {req.requester?.full_name}
                          </p>
                          <p className="text-gray-500 text-xs">@{req.requester?.username}</p>
                        </div>
                      </Link>
                      <div className="flex gap-2">
                        <button onClick={() => acceptRequest(req.id)} className="btn-primary flex-1 flex items-center justify-center gap-1 py-2 text-sm">
                          <HiCheck /> Confirm
                        </button>
                        <button onClick={() => declineRequest(req.id)} className="btn-ghost flex-1 flex items-center justify-center gap-1 py-2 text-sm">
                          <HiX /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : tab === 'suggestions' ? (
              // ── Suggestions ────────────────────────────────
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((person) => (
                  <div key={person.id} className="card p-4 flex flex-col gap-3">
                    <Link to={`/profile/${person.id}`} className="flex items-center gap-3 group">
                      <Avatar src={person.avatar_url} name={person.full_name} size={56} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-cabana-600 transition-colors">
                          {person.full_name}
                        </p>
                        <p className="text-gray-500 text-xs">@{person.username}</p>
                      </div>
                    </Link>
                    <button className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-sm">
                      <HiUserAdd /> Add Friend
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // ── All Friends ────────────────────────────────
              friends.length === 0 ? (
                <div className="card p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">🌴</div>
                  <p>No friends yet. Add some people!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <Link key={friend.id} to={`/profile/${friend.id}`}>
                      <div className="card p-4 flex items-center gap-3 hover:shadow-hover transition-shadow cursor-pointer group">
                        <Avatar src={friend.avatar_url} name={friend.full_name} size={56} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-cabana-600 transition-colors">
                            {friend.full_name}
                          </p>
                          <p className="text-gray-500 text-xs">@{friend.username}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}
