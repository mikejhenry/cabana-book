// ============================================================
// PlaceholderPage — Generic "coming soon" page
// Used for Watch, Marketplace, Memories, Saved, etc.
// Receives a title + emoji via props.
// ============================================================

import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'
import CabanaLogo from '@/components/ui/CabanaLogo'

interface PlaceholderPageProps {
  title: string
  emoji?: string
  description?: string
}

export default function PlaceholderPage({
  title,
  emoji = '🌊',
  description = 'This feature is coming soon. Stay tuned!',
}: PlaceholderPageProps) {
  return (
    <MainLayout>
      <motion.div
        className="card p-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <CabanaLogo size={64} animate />
        </div>
        <div className="text-5xl mb-4">{emoji}</div>
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">{description}</p>
      </motion.div>
    </MainLayout>
  )
}
