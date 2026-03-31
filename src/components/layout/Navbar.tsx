// ============================================================
// Navbar — Top navigation bar (fixed position)
// Replicates the Facebook navbar structure:
//   Left:   Logo + app name
//   Center: Nav icon links (Home, Friends, Watch, Marketplace)
//   Right:  Search, profile menu, notifications
//
// Uses Framer Motion for subtle entrance animation.
// The navbar is 56px tall — matches the --nav-height CSS variable.
// ============================================================

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiHome, HiUserGroup, HiVideoCamera, HiShoppingBag,
  HiBell, HiChatAlt2, HiSearch, HiChevronDown,
  HiCog, HiQuestionMarkCircle, HiLogout,
} from 'react-icons/hi'
import CabanaLogo from '@/components/ui/CabanaLogo'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/hooks/useNotifications'

// ─── CENTER NAV ITEMS ─────────────────────────────────────────
const navLinks = [
  { path: '/feed',        Icon: HiHome,        label: 'Home' },
  { path: '/friends',     Icon: HiUserGroup,   label: 'Friends' },
  { path: '/watch',       Icon: HiVideoCamera, label: 'Watch' },
  { path: '/marketplace', Icon: HiShoppingBag, label: 'Marketplace' },
]

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, profile, signOut } = useAuthStore()
  const { unreadCount } = useNotifications(user?.id ?? null)

  // State for dropdown menus
  const [profileOpen, setProfileOpen]   = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      {/* ── Fixed navbar bar ───────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-border"
        style={{ height: 'var(--nav-height)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="h-full flex items-center px-4 gap-2">

          {/* ── LEFT: Logo ───────────────────────────────── */}
          <Link to="/feed" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <CabanaLogo size={36} />
            <span
              className="font-display font-bold text-cabana-600 hidden lg:block"
              style={{ fontSize: '1.25rem' }}
            >
              Cabana-Book
            </span>
          </Link>

          {/* ── SEARCH ───────────────────────────────────── */}
          <div className="relative hidden sm:flex items-center">
            <HiSearch className="absolute left-3 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Cabana-Book"
              className="input-base pl-9 w-56 h-9 text-sm rounded-full"
            />
          </div>

          {/* ── CENTER: Nav links (hidden on mobile) ──────── */}
          <div className="flex-1 flex items-center justify-center gap-1">
            {navLinks.map(({ path, Icon, label }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  title={label}
                  className={`
                    relative flex items-center justify-center
                    h-12 px-5 rounded-lg transition-colors duration-150 group
                    ${active
                      ? 'text-cabana-500'
                      : 'text-gray-500 hover:bg-surface-hover hover:text-gray-800'}
                  `}
                >
                  <Icon className="text-2xl" />
                  {/* Active underline indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-active"  // Framer Motion animates this between tabs
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-cabana-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── RIGHT: Action buttons ─────────────────────── */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Messages */}
            <Link
              to="/messages"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-hover hover:bg-surface-border transition-colors"
              title="Messages"
            >
              <HiChatAlt2 className="text-xl text-gray-700" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-hover hover:bg-surface-border transition-colors"
                title="Notifications"
              >
                <HiBell className="text-xl text-gray-700" />
                {/* Badge — shows unread count */}
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full
                               bg-red-500 text-white text-[10px] font-bold flex items-center justify-center
                               animate-glow px-0.5"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="absolute right-0 top-12 w-80 card shadow-hover z-50 p-3"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-lg text-gray-900">Notifications</h3>
                      <button className="text-xs text-cabana-500 font-semibold hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 text-center py-6">
                      You're all caught up! 🌊
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="flex items-center gap-1 p-1 rounded-full hover:bg-surface-hover transition-colors"
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name ?? 'User'}
                  size={32}
                />
                <HiChevronDown className="text-gray-500 text-sm" />
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="absolute right-0 top-12 w-72 card shadow-hover z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Profile header */}
                    <Link
                      to={`/profile/${user?.id}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors"
                    >
                      <Avatar
                        src={profile?.avatar_url}
                        name={profile?.full_name ?? 'User'}
                        size={44}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{profile?.full_name}</p>
                        <p className="text-gray-500 text-xs">@{profile?.username}</p>
                      </div>
                    </Link>

                    <div className="border-t border-surface-border my-1" />

                    {/* Menu items */}
                    {[
                      { Icon: HiCog,                 label: 'Settings',  path: '/settings' },
                      { Icon: HiQuestionMarkCircle,   label: 'Help',      path: '/help' },
                    ].map(({ Icon, label, path }) => (
                      <Link
                        key={label}
                        to={path}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors text-sm text-gray-700"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
                          <Icon className="text-lg text-gray-600" />
                        </div>
                        {label}
                      </Link>
                    ))}

                    <div className="border-t border-surface-border my-1" />

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors text-sm text-gray-700 w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
                        <HiLogout className="text-lg text-gray-600" />
                      </div>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </nav>

      {/* Backdrop — closes dropdowns when clicking outside */}
      {(profileOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setProfileOpen(false); setNotifOpen(false) }}
        />
      )}
    </>
  )
}
