// ============================================================
// LeftSidebar — Facebook-style left navigation panel
// Shows: profile shortcut, main nav links, shortcuts, explore.
// Sticky-positioned so it stays visible while scrolling.
// ============================================================

import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiHome, HiUserGroup, HiVideoCamera, HiShoppingBag,
  HiClock, HiBookmark, HiFlag, HiCalendar, HiGlobe,
} from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'

// ─── NAV SECTIONS ────────────────────────────────────────────
const mainLinks = [
  { Icon: HiHome,        label: 'Home',        path: '/feed' },
  { Icon: HiUserGroup,   label: 'Friends',     path: '/friends' },
  { Icon: HiVideoCamera, label: 'Watch',       path: '/watch' },
  { Icon: HiShoppingBag, label: 'Marketplace', path: '/marketplace' },
]

const shortcuts = [
  { Icon: HiClock,    label: 'Memories',   path: '/memories' },
  { Icon: HiBookmark, label: 'Saved',      path: '/saved' },
  { Icon: HiFlag,     label: 'Pages',      path: '/pages' },
  { Icon: HiCalendar, label: 'Events',     path: '/events' },
  { Icon: HiGlobe,    label: 'Discover',   path: '/discover' },
]

export default function LeftSidebar() {
  const location = useLocation()
  const { profile, user } = useAuthStore()

  return (
    <aside className="sidebar-sticky hidden lg:flex flex-col gap-1 pt-1 pb-6">

      {/* ── Profile shortcut ─────────────────────────────── */}
      <Link
        to={`/profile/${user?.id}`}
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors group"
      >
        <Avatar
          src={profile?.avatar_url}
          name={profile?.full_name ?? 'User'}
          size={36}
        />
        <span className="font-semibold text-gray-900 text-sm group-hover:text-cabana-600 transition-colors">
          {profile?.full_name ?? 'Your Profile'}
        </span>
      </Link>

      {/* ── Main nav links ───────────────────────────────── */}
      <div className="mt-1 space-y-0.5">
        {mainLinks.map(({ Icon, label, path }, i) => {
          const active = location.pathname === path
          return (
            <motion.div
              key={path}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              // Each item staggers its entrance
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={path}
                className={`
                  flex items-center gap-3 px-2 py-2 rounded-lg transition-colors
                  ${active
                    ? 'bg-cabana-50 text-cabana-700 font-semibold'
                    : 'text-gray-700 hover:bg-surface-hover'}
                `}
              >
                {/* Colored icon circle on active, gray on inactive */}
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0
                    ${active ? 'bg-cabana-100 text-cabana-600' : 'bg-surface-hover text-gray-600'}
                  `}
                >
                  <Icon />
                </div>
                <span className="text-sm">{label}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-surface-border my-3" />

      {/* ── Shortcuts section ────────────────────────────── */}
      <p className="text-gray-500 font-semibold text-sm px-2 mb-1">Shortcuts</p>
      {shortcuts.map(({ Icon, label, path }) => (
        <Link
          key={path}
          to={path}
          className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-700 hover:bg-surface-hover transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center text-lg text-gray-600 flex-shrink-0">
            <Icon />
          </div>
          <span className="text-sm">{label}</span>
        </Link>
      ))}

      {/* ── Footer links ─────────────────────────────────── */}
      <div className="mt-auto pt-4 px-2">
        <p className="text-xs text-gray-400 leading-relaxed">
          Privacy · Terms · Cookies · About · Help
        </p>
        {/* NOTE: Replace "Coding Cabana CEO" with real name when ready */}
        <p className="text-xs text-gray-400 mt-1">
          &copy; {new Date().getFullYear()} Coding Cabana CEO
        </p>
      </div>
    </aside>
  )
}
