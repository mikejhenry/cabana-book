// ============================================================
// RightSidebar — Facebook-style right panel
// Shows: Contacts (online friends), Sponsored / suggested groups.
// Real contacts are loaded from the `friendships` table.
// ============================================================

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiSearch, HiVideoCamera, HiDotsHorizontal } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types'

export default function RightSidebar() {
  const { user } = useAuthStore()
  const [contacts, setContacts] = useState<Profile[]>([])

  // ── Fetch accepted friends ────────────────────────────────
  useEffect(() => {
    if (!user) return

    supabase
      .from('friendships')
      .select(`
        addressee:profiles!friendships_addressee_id_fkey(*),
        requester:profiles!friendships_requester_id_fkey(*)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .limit(12)
      .then(({ data }) => {
        if (!data) return
        // For each friendship, pick the OTHER person (not the current user)
        const friends = data.map((row: any) =>
          row.requester.id === user.id ? row.addressee : row.requester
        )
        setContacts(friends)
      })
  }, [user])

  return (
    <aside className="sidebar-sticky hidden xl:flex flex-col gap-4 pt-1 pb-6">

      {/* ── Contacts ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="font-semibold text-gray-700 text-sm">Contacts</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-gray-500">
              <HiVideoCamera className="text-lg" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-gray-500">
              <HiSearch className="text-lg" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-gray-500">
              <HiDotsHorizontal className="text-lg" />
            </button>
          </div>
        </div>

        {contacts.length === 0 ? (
          // Empty state — shown when user has no friends yet
          <div className="px-2 py-4 text-center text-gray-400 text-sm">
            <p>Add friends to see them here 🌴</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {contacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/profile/${contact.id}`}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors group"
                >
                  {/* Avatar with random online status for demo */}
                  <Avatar
                    src={contact.avatar_url}
                    name={contact.full_name}
                    size={36}
                    online={i % 3 !== 2}  // Simulate some being online
                  />
                  <span className="text-sm font-medium text-gray-800 group-hover:text-cabana-600 transition-colors truncate">
                    {contact.full_name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-surface-border" />

      {/* ── Suggested Groups ─────────────────────────────── */}
      <div>
        <p className="font-semibold text-gray-700 text-sm mb-2 px-1">Suggested Groups</p>
        {[
          { name: 'Beach Lovers 🏖️',     members: '12.4K members' },
          { name: 'Cabana Creators 🌴',   members: '8.1K members' },
          { name: 'Sunset Photography 📸', members: '24K members' },
        ].map((group, i) => (
          <motion.div
            key={group.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {/* Group icon placeholder */}
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #3b93f3, #06b6d4)' }}
            >
              🌊
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{group.name}</p>
              <p className="text-xs text-gray-400">{group.members}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  )
}
