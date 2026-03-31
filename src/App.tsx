// ============================================================
// App.tsx — Root component and router configuration
// Sets up:
//   1. BrowserRouter with all page routes
//   2. Auth session initialization on mount
//   3. React Hot Toast notification system
//   4. Framer Motion AnimatePresence for page transitions
// ============================================================

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

// Auth guard
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Auth store — initialize on mount
import { useAuthStore } from '@/store/authStore'

// Pages
import LandingPage       from '@/pages/LandingPage'
import SignupPage        from '@/pages/SignupPage'
import FeedPage          from '@/pages/FeedPage'
import ProfilePage       from '@/pages/ProfilePage'
import FriendsPage       from '@/pages/FriendsPage'
import MessagesPage      from '@/pages/MessagesPage'
import PlaceholderPage   from '@/pages/PlaceholderPage'

export default function App() {
  const { initialize } = useAuthStore()

  // On first render, restore the Supabase session from localStorage.
  // This prevents the user from being logged out on page refresh.
  useEffect(() => {
    initialize()
  }, [])  // Empty dep array → runs once on mount

  return (
    <BrowserRouter>
      {/* ── Global toast notification system ────────────────
          react-hot-toast renders toasts outside the normal DOM tree.
          Positioned top-right, styled to match our brand. */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            fontFamily:   'Inter, sans-serif',
            fontSize:     '14px',
            fontWeight:   '500',
          },
          success: {
            iconTheme: { primary: '#3b93f3', secondary: '#fff' },
          },
        }}
      />

      {/* ── Route definitions ────────────────────────────────
          AnimatePresence lets Framer Motion animate routes on exit.
          mode="wait" means the old page fully exits before the new one enters. */}
      <AnimatePresence mode="wait">
        <Routes>

          {/* ── Public routes (no login required) ─────────── */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Protected routes (login required) ─────────── */}
          {/* ProtectedRoute checks auth state and redirects if needed */}

          <Route path="/feed" element={
            <ProtectedRoute><FeedPage /></ProtectedRoute>
          }/>

          <Route path="/profile/:userId" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          }/>

          <Route path="/friends" element={
            <ProtectedRoute><FriendsPage /></ProtectedRoute>
          }/>

          <Route path="/messages" element={
            <ProtectedRoute><MessagesPage /></ProtectedRoute>
          }/>

          {/* Placeholder pages for features in progress */}
          <Route path="/watch" element={
            <ProtectedRoute>
              <PlaceholderPage title="Watch" emoji="📺" description="Videos from friends and creators — coming soon!" />
            </ProtectedRoute>
          }/>

          <Route path="/marketplace" element={
            <ProtectedRoute>
              <PlaceholderPage title="Marketplace" emoji="🛍️" description="Buy and sell locally — coming soon!" />
            </ProtectedRoute>
          }/>

          <Route path="/memories"    element={<ProtectedRoute><PlaceholderPage title="Memories" emoji="📅" /></ProtectedRoute>}/>
          <Route path="/saved"       element={<ProtectedRoute><PlaceholderPage title="Saved" emoji="🔖" /></ProtectedRoute>}/>
          <Route path="/pages"       element={<ProtectedRoute><PlaceholderPage title="Pages" emoji="🏳️" /></ProtectedRoute>}/>
          <Route path="/events"      element={<ProtectedRoute><PlaceholderPage title="Events" emoji="🎉" /></ProtectedRoute>}/>
          <Route path="/discover"    element={<ProtectedRoute><PlaceholderPage title="Discover" emoji="🌍" /></ProtectedRoute>}/>
          <Route path="/settings"    element={<ProtectedRoute><PlaceholderPage title="Settings" emoji="⚙️" /></ProtectedRoute>}/>
          <Route path="/help"        element={<ProtectedRoute><PlaceholderPage title="Help Center" emoji="❓" /></ProtectedRoute>}/>

          {/* Catch-all — redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
