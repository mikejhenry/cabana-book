// ============================================================
// LandingPage — Parallax hero + login/signup forms
// This is the first thing a visitor sees. Key design goals:
//   • Full-viewport ocean gradient hero with parallax layers
//   • Animated headline that types in the brand name
//   • Login form (right side) immediately accessible
//   • Sign up link to /signup
//   • Framer Motion entrance animations for every element
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import CabanaLogo from '@/components/ui/CabanaLogo'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── FEATURE BULLET POINTS ───────────────────────────────────
const features = [
  { emoji: '🏖️', text: 'Share your beach-life moments' },
  { emoji: '🤝', text: 'Connect with friends & family' },
  { emoji: '📸', text: 'Stories that fade like the tide' },
  { emoji: '💬', text: 'Real-time chats, no lag' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { signIn, user } = useAuthStore()

  // ── Login form state ──────────────────────────────────────
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // If already logged in, redirect to feed
  useEffect(() => {
    if (user) navigate('/feed', { replace: true })
  }, [user, navigate])

  // ── Parallax setup ────────────────────────────────────────
  // useScroll tracks how far the page has scrolled.
  // useTransform maps the scroll progress to a CSS value.
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  // The background moves at half the scroll speed — classic parallax
  const bgY    = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  // The hero text fades and shifts up as you scroll
  const textY  = useTransform(scrollYProgress, [0, 0.5], ['0%', '-20%'])
  const textOp = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  // ── Handle login ─────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      navigate('/feed')
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg overflow-x-hidden">

      {/* ── PARALLAX HERO ─────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Parallax background layer — ocean gradient */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 z-0"
        >
          {/* Deep blue → teal ocean gradient sky */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, #0f2d6b 0%, #1a5fd1 35%, #3b93f3 65%, #06b6d4 85%, #22d3ee 100%)',
            }}
          />

          {/* Decorative wave shapes at the bottom */}
          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 1440 180"
            preserveAspectRatio="none"
            style={{ height: 180 }}
          >
            <path
              d="M0,60 C360,120 720,0 1080,80 C1260,120 1380,60 1440,80 L1440,180 L0,180 Z"
              fill="rgba(255,255,255,0.08)"
            />
            <path
              d="M0,100 C300,60 600,140 900,100 C1100,70 1300,120 1440,90 L1440,180 L0,180 Z"
              fill="rgba(255,255,255,0.05)"
            />
            <path
              d="M0,140 C200,110 500,160 800,130 C1050,105 1280,150 1440,130 L1440,180 L0,180 Z"
              fill="rgba(240,242,245,1)"
            />
          </svg>

          {/* Floating bubble accents for depth */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width:      40 + i * 20,
                height:     40 + i * 20,
                left:       `${10 + i * 15}%`,
                top:        `${20 + (i % 3) * 20}%`,
                background: 'rgba(255,255,255,0.06)',
                border:     '1px solid rgba(255,255,255,0.12)',
              }}
              // Each bubble drifts up and down at its own speed
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>

        {/* ── CONTENT LAYER ────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Brand + tagline + features */}
          <motion.div
            style={{ y: textY, opacity: textOp }}
            className="text-white"
          >
            {/* Logo + App name */}
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <CabanaLogo size={72} animate />
              <div>
                <h1
                  className="font-display font-bold leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
                >
                  Cabana-Book
                </h1>
                <p className="text-cyan-200 text-sm font-medium tracking-wide mt-1">
                  Your social paradise
                </p>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-xl md:text-2xl font-light text-blue-100 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Connect with friends and the world around you on <strong className="font-semibold text-white">Cabana-Book</strong>.
            </motion.p>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.text}
                  className="flex items-center gap-3 text-blue-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Login card */}
          <motion.div
            className="card p-8 shadow-2xl"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          >
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
              Sign in
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-cabana-600 font-semibold hover:underline">
                Create one free
              </Link>
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base"
                />
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size={20} /> : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or</span>
              </div>
            </div>

            <Link to="/signup">
              <button className="btn-ghost w-full py-3 text-base">
                Create New Account
              </button>
            </Link>

            <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
              By continuing, you agree to Cabana-Book's Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── BELOW-FOLD: Features showcase ──────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            className="font-display font-bold text-4xl text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Everything you need to stay connected
          </motion.h2>
          <motion.p
            className="text-gray-500 text-lg mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Built with the same features you love, redesigned for a better experience.
          </motion.p>

          {/* Feature cards grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📰',
                title: 'Smart Feed',
                desc: 'Posts from people you care about, ordered by relevance and time.',
              },
              {
                icon: '🌅',
                title: 'Stories',
                desc: '24-hour ephemeral moments — share and they disappear like the tide.',
              },
              {
                icon: '💬',
                title: 'Messaging',
                desc: 'Real-time direct messages with read receipts and emoji reactions.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="card p-8 text-left hover:shadow-hover transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-surface-bg py-10 px-6 text-center text-gray-400 text-xs">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CabanaLogo size={24} />
          <span className="font-display font-bold text-gray-600 text-sm">Cabana-Book</span>
        </div>
        <p className="mb-2">
          {/* NOTE: Replace "Coding Cabana CEO" with your real name when ready */}
          &copy; {new Date().getFullYear()} Coding Cabana CEO. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {['Privacy', 'Terms', 'Cookies', 'About', 'Help'].map((link) => (
            <a key={link} href="#" className="hover:text-cabana-600 transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
