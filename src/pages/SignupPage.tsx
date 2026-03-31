// ============================================================
// SignupPage — New account registration
// Two-step form: personal info then account credentials.
// Animated step transition using Framer Motion slide.
// ============================================================

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import CabanaLogo from '@/components/ui/CabanaLogo'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// Animation variants for sliding between steps
const stepVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp, user } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/feed', { replace: true })
  }, [user, navigate])

  // ── Form state ────────────────────────────────────────────
  const [step, setStep]         = useState(0)   // 0 = name/username, 1 = credentials
  const [direction, setDir]     = useState(1)   // Slide direction: 1 = forward, -1 = back
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // ── Navigation ────────────────────────────────────────────
  const goNext = () => {
    if (!fullName.trim() || !username.trim()) {
      setError('Please fill in your name and username.')
      return
    }
    setError('')
    setDir(1)
    setStep(1)
  }
  const goBack = () => { setDir(-1); setStep(0) }

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName, username)
      toast.success('Account created! Check your email to verify.')
      navigate('/feed')
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #0f2d6b 0%, #1a5fd1 40%, #3b93f3 70%, #06b6d4 100%)',
      }}
    >
      <motion.div
        className="card w-full max-w-md p-8 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <CabanaLogo size={56} animate className="mb-3" />
          <h1 className="font-display font-bold text-2xl text-gray-900">Join Cabana-Book</h1>
          <p className="text-gray-500 text-sm mt-1">It's free and always will be.</p>
        </div>

        {/* Step progress indicator */}
        <div className="flex gap-2 mb-8">
          {[0, 1].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: s <= step ? '#3b93f3' : '#e4e6eb' }}
            />
          ))}
        </div>

        {/* Animated step content */}
        <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 ? (
              // ── Step 1: Name + username ─────────────────────────
              <motion.div
                key="step0"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  Step 1 — Who are you?
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="alex_johnson"
                        className="input-base pl-7"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and underscores only.</p>
                  </div>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}
                <button onClick={goNext} className="btn-primary w-full mt-6 py-3">
                  Continue
                </button>
              </motion.div>
            ) : (
              // ── Step 2: Email + password ────────────────────────
              <motion.form
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onSubmit={handleSubmit}
              >
                <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  Step 2 — Secure your account
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className="input-base"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={goBack} className="btn-ghost flex-1 py-3">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
                    {loading ? <LoadingSpinner size={20} /> : 'Create Account'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-cabana-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
