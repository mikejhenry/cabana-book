// ============================================================
// ProtectedRoute — Route guard for authenticated pages
// Wraps any route that requires login.
// If not authenticated → redirects to "/" (landing page).
// Shows a full-page loading spinner while the session is initializing.
// ============================================================

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CabanaLogo from '@/components/ui/CabanaLogo'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore()

  // While Supabase is restoring the session from localStorage, show a branded splash
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-bg">
        <CabanaLogo size={64} animate />
        <LoadingSpinner size={28} />
        <p className="text-gray-500 text-sm">Loading Cabana-Book...</p>
      </div>
    )
  }

  // No authenticated user → send to landing page
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Authenticated → render the protected page
  return <>{children}</>
}
