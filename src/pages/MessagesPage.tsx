// ============================================================
// MessagesPage — Direct messaging interface
// Two-panel layout: conversation list (left) + message thread (right).
// Uses Supabase Realtime for live message delivery.
// ============================================================

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPaperAirplane, HiSearch } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Message, Conversation } from '@/types'

export default function MessagesPage() {
  const { user, profile } = useAuthStore()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv]       = useState<Conversation | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [text, setText]                   = useState('')
  const [loading, setLoading]             = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)

  // ── Load conversations ─────────────────────────────────────
  useEffect(() => {
    if (!user) return

    supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id])
      .order('last_message_at', { ascending: false })
      .then(({ data }) => {
        setConversations((data as Conversation[]) ?? [])
        setLoading(false)
      })
  }, [user])

  // ── Load messages when a conversation is selected ─────────
  useEffect(() => {
    if (!activeConv) return

    supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', activeConv.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) ?? []))

    // Subscribe to new messages in real time
    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv])

  // ── Auto-scroll to latest message ─────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !activeConv || !user) return

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: text.trim(),
    })
    setText('')
  }

  return (
    <MainLayout hideRightSidebar>
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 88px)' }}>
        <div className="flex h-full">

          {/* ── LEFT: Conversation list ─────────────────── */}
          <div className="w-80 border-r border-surface-border flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-surface-border">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-3">Messages</h2>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search messages..." className="input-base pl-9 h-9 text-sm rounded-full" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <LoadingSpinner size={28} className="py-8" />
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm px-4">
                  <div className="text-4xl mb-3">💬</div>
                  <p>No messages yet. Find a friend and say hi!</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`
                      w-full flex items-center gap-3 p-4 hover:bg-surface-hover transition-colors text-left
                      ${activeConv?.id === conv.id ? 'bg-cabana-50' : ''}
                    `}
                  >
                    <Avatar
                      src={conv.other_participant?.avatar_url ?? null}
                      name={conv.other_participant?.full_name ?? '?'}
                      size={44}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {conv.other_participant?.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{conv.last_message ?? 'Start a conversation'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── RIGHT: Message thread ───────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeConv ? (
              // No conversation selected
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">🌊</div>
                <p className="font-semibold text-lg">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your messages on the left</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="p-4 border-b border-surface-border flex items-center gap-3">
                  <Avatar
                    src={activeConv.other_participant?.avatar_url ?? null}
                    name={activeConv.other_participant?.full_name ?? '?'}
                    size={40}
                    online
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{activeConv.other_participant?.full_name}</p>
                    <p className="text-xs text-green-500">Active now</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user?.id
                      return (
                        <motion.div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {!isMine && (
                            <Avatar
                              src={msg.sender?.avatar_url ?? null}
                              name={msg.sender?.full_name ?? '?'}
                              size={28}
                            />
                          )}
                          <div
                            className={`
                              max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-snug
                              ${isMine
                                ? 'bg-cabana-500 text-white rounded-br-sm'
                                : 'bg-surface-input text-gray-900 rounded-bl-sm'}
                            `}
                          >
                            {msg.content}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-surface-border flex items-center gap-3">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 input-base rounded-full py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="w-10 h-10 rounded-full bg-cabana-500 hover:bg-cabana-600 flex items-center justify-center
                               text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-blue"
                  >
                    <HiPaperAirplane className="rotate-90 text-lg" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
