-- ============================================================
-- CABANA-BOOK — Database Schema (Migration 001)
-- Run this in your Supabase project's SQL editor.
-- Sets up all tables with Row Level Security (RLS) policies
-- so users can only read/write their own data.
-- ============================================================

-- ─── ENABLE UUID EXTENSION ───────────────────────────────────
-- PostgreSQL needs this extension to auto-generate UUIDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
-- Extends Supabase's built-in auth.users with a public profile.
-- One profile per user — id must match auth.users.id.
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  full_name    TEXT NOT NULL DEFAULT '',
  avatar_url   TEXT,
  cover_url    TEXT,
  bio          TEXT,
  location     TEXT,
  website      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at whenever the row is changed
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS: Anyone can read profiles; only owner can write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── POSTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL DEFAULT '',
  image_url      TEXT,
  feeling        TEXT,
  location       TEXT,
  likes_count    INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  shares_count   INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are publicly readable"    ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their posts"   ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their posts"   ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their posts"   ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- ─── LIKES ───────────────────────────────────────────────────
-- Each row = one user liking one post. Unique constraint prevents duplicates.
CREATE TABLE IF NOT EXISTS public.likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)  -- One like per user per post
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are publicly readable" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts"        ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"      ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to keep likes_count on posts in sync
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_insert AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.increment_likes_count();
CREATE TRIGGER likes_delete AFTER DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.decrement_likes_count();

-- ─── COMMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are publicly readable"  ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can add comments"          ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments"   ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Keep comments_count on posts in sync
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_insert AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.increment_comments_count();

-- ─── FRIENDSHIPS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)  -- One friendship record per pair
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friends are publicly readable"   ON public.friendships FOR SELECT USING (true);
CREATE POLICY "Users can send friend requests"  ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Addressee can accept/block"      ON public.friendships FOR UPDATE USING (auth.uid() = addressee_id);
CREATE POLICY "Either party can unfriend"       ON public.friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ─── STORIES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),  -- Auto-expire after 24h
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stories are publicly readable" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Users can create stories"      ON public.stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own stories"  ON public.stories FOR DELETE USING (auth.uid() = author_id);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('like', 'comment', 'friend_request', 'friend_accepted', 'mention')),
  post_id       UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  read          BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own notifications"   ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "System can insert notifications"          ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can mark notifications read"        ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- ─── CONVERSATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids  UUID[] NOT NULL,  -- Array of 2 user IDs
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

-- ─── MESSAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  read             BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  );
CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ─── REALTIME ────────────────────────────────────────────────
-- Enable realtime for these tables so Supabase broadcasts changes via WebSocket.
-- Go to Supabase Dashboard → Database → Replication → enable for:
--   notifications, messages, posts
-- (Cannot be done via SQL — must be set in the dashboard UI)

-- ─── STORAGE BUCKETS ─────────────────────────────────────────
-- Run these in the Supabase dashboard or via the Storage UI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true);

-- Storage RLS policies (run after bucket creation):
-- CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
