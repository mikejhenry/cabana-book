// ============================================================
// TYPES — CabanaBook
// Central TypeScript interfaces that mirror the Supabase
// database schema. Every component imports from here so
// shape changes only need to happen in one place.
// ============================================================

// ─── AUTH / USER ─────────────────────────────────────────────
/** Matches the `profiles` table in Supabase */
export interface Profile {
  id: string;              // UUID — same as auth.users.id
  username: string;        // Unique @handle
  full_name: string;       // Display name
  avatar_url: string | null;  // Storage URL for profile photo
  cover_url: string | null;   // Storage URL for cover photo
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;      // ISO timestamp
  updated_at: string;
}

// ─── POSTS ───────────────────────────────────────────────────
/** Matches the `posts` table */
export interface Post {
  id: string;
  author_id: string;       // FK → profiles.id
  content: string;         // Post body text
  image_url: string | null;  // Optional attached image (Supabase storage)
  feeling: string | null;  // e.g. "happy", "excited"
  location: string | null;
  likes_count: number;     // Denormalized counter for performance
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields (not in DB — assembled by the query)
  author?: Profile;
  is_liked?: boolean;      // Whether the current user has liked this post
}

// ─── COMMENTS ────────────────────────────────────────────────
/** Matches the `comments` table */
export interface Comment {
  id: string;
  post_id: string;         // FK → posts.id
  author_id: string;       // FK → profiles.id
  content: string;
  likes_count: number;
  created_at: string;
  author?: Profile;        // Joined
}

// ─── LIKES ───────────────────────────────────────────────────
/** Matches the `likes` table — tracks which user liked which post */
export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// ─── FRIENDSHIPS ─────────────────────────────────────────────
/** Matches the `friendships` table */
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;    // Who sent the request
  addressee_id: string;    // Who received it
  status: FriendshipStatus;
  created_at: string;
  requester?: Profile;     // Joined
  addressee?: Profile;     // Joined
}

// ─── STORIES ─────────────────────────────────────────────────
/** Matches the `stories` table — 24-hour ephemeral posts */
export interface Story {
  id: string;
  author_id: string;
  image_url: string;       // Required for stories (always an image)
  caption: string | null;
  expires_at: string;      // 24h after created_at — stories auto-hide
  created_at: string;
  author?: Profile;
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
export type NotificationType = 'like' | 'comment' | 'friend_request' | 'friend_accepted' | 'mention';

export interface Notification {
  id: string;
  recipient_id: string;    // Who receives the notification
  sender_id: string;       // Who triggered it
  type: NotificationType;
  post_id: string | null;  // Related post (if applicable)
  read: boolean;
  created_at: string;
  sender?: Profile;        // Joined
}

// ─── MESSAGES ────────────────────────────────────────────────
/** Matches the `messages` table — direct messages between users */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  participant_ids: string[];  // Array of two user IDs
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  other_participant?: Profile;  // Assembled client-side
  unread_count?: number;
}

// ─── UI STATE TYPES ──────────────────────────────────────────
/** Controls which modal/dialog is open */
export type ModalType =
  | 'create-post'
  | 'edit-post'
  | 'post-detail'
  | 'image-viewer'
  | 'edit-profile'
  | null;

/** Represents an item in the left nav sidebar */
export interface NavItem {
  label: string;
  icon: string;   // React-icon component name
  path: string;
  badge?: number; // Notification count badge
}
