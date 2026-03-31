// ============================================================
// useNotifications HOOK
// Subscribes to real-time notifications for the current user
// using Supabase Realtime (Postgres changes over WebSocket).
// ============================================================

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAllRead: () => Promise<void>
}

export function useNotifications(userId: string | null): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(false)

  // Computed: how many unread notifications exist
  const unreadCount = notifications.filter((n) => !n.read).length

  // ── Initial fetch ────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    setLoading(true)

    supabase
      .from('notifications')
      .select('*, sender:profiles!notifications_sender_id_fkey(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setNotifications((data as Notification[]) ?? [])
        setLoading(false)
      })

    // ── Realtime subscription ──────────────────────────────────
    // Listen for new rows in the `notifications` table for this user.
    // Supabase Realtime broadcasts changes via WebSocket — no polling needed.
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          // Prepend the new notification to the list
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when component unmounts to prevent memory leaks
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // ── markAllRead ──────────────────────────────────────────────
  const markAllRead = async () => {
    if (!userId) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false)

    // Update local state immediately (optimistic)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return { notifications, unreadCount, loading, markAllRead }
}
