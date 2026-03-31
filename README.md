# 🏖️ Cabana-Book

> A premium Facebook-inspired social media platform — built to showcase full-stack AI-assisted development at a professional level.

---

## ✨ Vision & Purpose

**Cabana-Book** is a fully-featured social media web application modeled after Facebook's core infrastructure, rebuilt with a clean tropical-blue aesthetic and modern tooling. It was created as a **portfolio project** to demonstrate that real-world, production-quality applications can be designed and built efficiently through clear, intentional collaboration between a developer and AI tooling.

### 🤝 How This Project Was Built — Human-AI Collaboration

This project is a direct example of **effective vibe coding** — a methodology where the developer communicates a precise creative vision and guides the AI through execution with clarity and purpose.

**The creator (Coding Cabana CEO) specified:**
- Facebook-clone architecture with all core social features
- A custom circular cabana hut SVG logo in ocean blue tones
- Parallax landing page with animated floating bubbles and wave SVGs
- Framer Motion animations throughout (staggered feed, heart pop on like, slide transitions)
- Supabase backend with Row Level Security, Storage buckets, and Realtime
- Netlify for continuous deployment, GitHub for version control
- Comprehensive inline code comments so every line can be reviewed and understood

**The result:** A codebase where every file is annotated, every design decision is intentional, and the end product aesthetically improves on Facebook — cleaner, more animated, with a distinctive brand identity.

> *"Clear communication is the highest-value skill when working with AI. The more specific your vision, the more precisely the output matches it."*

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **Authentication** | Email/password signup and login via Supabase Auth with JWT session persistence |
| **Parallax Landing** | Full-viewport ocean gradient hero with floating bubble layers, wave SVGs, and scroll-driven parallax |
| **Feed** | Infinite-scroll post feed with viewport-triggered staggered entrance animations |
| **Stories** | Horizontal scrollable 24-hour ephemeral stories carousel |
| **Create Post** | Expandable composer with photo upload, feelings picker, and location tagging |
| **Like / Comment** | Optimistic like toggle with heart pop animation; inline expandable comments |
| **Profile Pages** | Cover photo, avatar, bio, location, website, friend actions, post history |
| **Friends** | Send requests, accept/decline, browse suggestions, view all friends |
| **Messaging** | Two-panel real-time DM interface via Supabase Realtime WebSocket |
| **Notifications** | Live notification badge via Postgres change subscription |
| **Cabana Logo** | Hand-crafted SVG circular beach-hut logo — thatched roof, sun rays, ocean strip |
| **Skeleton Loaders** | Shimmer placeholders during data fetch — no blank flashes |
| **Responsive Layout** | Three-column desktop (360+680+360) → single column on mobile |
| **Security** | Row Level Security on every table; no user can read/write data they don't own |

---

## 🛠️ Tech Stack

### Frontend

| Tool | Role | Docs |
|---|---|---|
| [React 18](https://react.dev/) | UI component framework — declarative component tree | [react.dev](https://react.dev/) |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript — catches shape mismatches at compile time | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) |
| [Vite 5](https://vitejs.dev/) | Native ESM dev server + Rollup bundler — instant HMR, fast builds | [vitejs.dev](https://vitejs.dev/) |
| [React Router v6](https://reactrouter.com/) | Client-side routing with nested routes and path params | [reactrouter.com](https://reactrouter.com/en/main) |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first CSS — all styling via class names, no CSS files needed | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| [Framer Motion](https://www.framer.com/motion/) | Production animation library — spring physics, layout animations, gesture support | [framer.com/motion](https://www.framer.com/motion/) |
| [Zustand](https://zustand-demo.pmnd.rs/) | Minimal global state — replaces Redux with a single hook | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| [React Hot Toast](https://react-hot-toast.com/) | Accessible, styleable toast notifications | [react-hot-toast.com](https://react-hot-toast.com/) |
| [React Icons](https://react-icons.github.io/react-icons/) | Heroicons, Ant Design, and more — all as React SVG components | [react-icons.github.io](https://react-icons.github.io/react-icons/) |
| [date-fns](https://date-fns.org/) | Lightweight date utilities — `formatDistanceToNow` for timestamps | [date-fns.org](https://date-fns.org/) |
| [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer) | Hook wrapper for the Intersection Observer API — triggers infinite scroll | [npm](https://www.npmjs.com/package/react-intersection-observer) |

### Backend & Infrastructure

| Tool | Role | Docs |
|---|---|---|
| [Supabase](https://supabase.com/) | Open-source BaaS — PostgreSQL + Auth + Storage + Realtime in one platform | [supabase.com/docs](https://supabase.com/docs) |
| [PostgreSQL](https://www.postgresql.org/) | The underlying relational database managed by Supabase | [postgresql.org/docs](https://www.postgresql.org/docs/) |
| [Supabase Auth](https://supabase.com/docs/guides/auth) | JWT-based authentication — email/password, OAuth-ready | [docs](https://supabase.com/docs/guides/auth) |
| [Supabase Storage](https://supabase.com/docs/guides/storage) | S3-compatible file storage for profile photos, post images, story media | [docs](https://supabase.com/docs/guides/storage) |
| [Supabase Realtime](https://supabase.com/docs/guides/realtime) | WebSocket subscriptions on Postgres row changes — powers live messages and notifications | [docs](https://supabase.com/docs/guides/realtime) |
| [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) | Postgres-level access control — enforces ownership rules in the database | [docs](https://supabase.com/docs/guides/auth/row-level-security) |
| [Netlify](https://netlify.com/) | JAMstack hosting with CI/CD from GitHub — auto-deploy on push | [docs.netlify.com](https://docs.netlify.com/) |
| [GitHub](https://github.com/) | Version control and Netlify deployment trigger | [docs.github.com](https://docs.github.com/) |

---

## 📁 Project Structure

```
cabana-book/
├── public/
│   └── cabana-logo.svg              # SVG beach-hut logo (favicon + OG)
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx   # Redirects unauthenticated users to /
│   │   ├── feed/
│   │   │   ├── CreatePost.tsx       # Expandable post composer with image upload
│   │   │   ├── PostCard.tsx         # Feed post with optimistic like, comments
│   │   │   └── StoriesBar.tsx       # Horizontal scrollable stories carousel
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx       # Three-column grid wrapper for all app pages
│   │   │   ├── Navbar.tsx           # Fixed top bar (logo, nav tabs, profile menu)
│   │   │   ├── LeftSidebar.tsx      # Nav links, shortcuts, footer links
│   │   │   └── RightSidebar.tsx     # Online contacts, suggested groups
│   │   └── ui/
│   │       ├── Avatar.tsx           # Profile photo or initials fallback
│   │       ├── CabanaLogo.tsx       # Inline SVG cabana logo React component
│   │       └── LoadingSpinner.tsx   # Branded spinning indicator
│   ├── hooks/
│   │   ├── useProfile.ts            # Fetch a profile by UUID, cancellable
│   │   └── useNotifications.ts      # Realtime notification subscription hook
│   ├── lib/
│   │   └── supabase.ts              # Singleton Supabase client, storage helpers
│   ├── pages/
│   │   ├── LandingPage.tsx          # Parallax hero + login form + features section
│   │   ├── SignupPage.tsx           # Animated two-step registration
│   │   ├── FeedPage.tsx             # Infinite-scroll home feed
│   │   ├── ProfilePage.tsx          # User profile (cover, posts, friend actions)
│   │   ├── FriendsPage.tsx          # Tabbed: requests / suggestions / all friends
│   │   ├── MessagesPage.tsx         # Two-panel realtime direct messaging
│   │   └── PlaceholderPage.tsx      # "Coming soon" for routes in progress
│   ├── store/
│   │   ├── authStore.ts             # Zustand: session, profile, signIn/signUp/signOut
│   │   └── feedStore.ts             # Zustand: posts, pagination, optimistic likes
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces mirroring DB schema
│   ├── App.tsx                      # Router config, session init, global toasts
│   ├── main.tsx                     # React DOM entry point
│   └── index.css                    # Tailwind + global CSS + utility classes
├── supabase/
│   └── migrations/
│       └── 001_cabanabook_schema.sql  # Full DB schema with RLS, triggers, indexes
├── .env.example                     # Environment variable template
├── .gitignore
├── netlify.toml                     # Build command, SPA redirect, security headers
├── tailwind.config.js               # Custom colors, fonts, keyframes, animations
├── tsconfig.app.json                # TypeScript with @/ path alias
└── vite.config.ts                   # Vite with @/ alias + build config
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- A free [Supabase](https://supabase.com) account

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/cabana-book.git
cd cabana-book
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste and run `supabase/migrations/001_cabanabook_schema.sql`
3. Open **Storage** → create four **public** buckets: `avatars` `covers` `posts` `stories`
4. Open **Database → Replication** → enable Realtime for `notifications`, `messages`, `posts`
5. Copy your **Project URL** and **anon key** from **Settings → API**

### 3. Configure environment

```bash
cp .env.example .env
# Fill in your Supabase URL and anon key
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 5. Build

```bash
npm run build
# Output: /dist
```

---

## 🌐 Deploy to Netlify

1. Push to GitHub
2. Connect repo at [app.netlify.com](https://app.netlify.com)
3. Build settings are pre-configured in `netlify.toml`
4. Add env vars in **Site settings → Environment variables**
5. Every push to `main` triggers an auto-deploy

---

## 🎨 Design System

### Brand Colors

| Name | Value | Use |
|---|---|---|
| `cabana-500` | `#3b93f3` | Primary buttons, active nav, links |
| `ocean-500` | `#06b6d4` | Logo ring gradient, accents |
| `sand-400` | `#fbbf24` | Cabana roof, sun, warmth |
| `surface-bg` | `#f0f2f5` | Page background |
| `surface-card` | `#ffffff` | Cards, panels |

### Animation Inventory

| Element | Animation |
|---|---|
| Landing hero background | Parallax — 50% scroll speed |
| Landing floating bubbles | Per-bubble drift loop (y + x oscillation) |
| Post cards | `slideUp` stagger on viewport entry |
| Like button | Spring scale pop (1 → 1.45 → 1) |
| Nav active underline | `layoutId` shared element (slides between tabs) |
| Dropdown menus | Scale + opacity entrance (0.97 → 1, 15ms) |
| Story cards | Spring scale on hover |
| Notification badge | CSS glow pulse |
| Skeleton loaders | Horizontal shimmer gradient |
| Page transitions | AnimatePresence `mode="wait"` |
| Signup step change | Directional slide (left/right based on direction) |

---

## 🔒 Security Notes

- **Row Level Security** on every table — the database enforces access, not just the frontend
- **Environment variables** never committed — `.env` is in `.gitignore`
- **JWT auto-refresh** handled by Supabase client — tokens stay fresh
- **No secrets in client code** — only the anon key is exposed (safe; RLS is the gate)
- **Security headers** in `netlify.toml` — HSTS, X-Frame-Options, no-sniff

---

## 🗺️ Roadmap

- [ ] Google / Apple OAuth login
- [ ] Post editing with history
- [ ] Story creation UI with camera
- [ ] Image crop/resize before upload
- [ ] Push notifications (Web Push API)
- [ ] Dark mode
- [ ] Groups and pages
- [ ] Events with RSVP
- [ ] Full-text search

---

## 🌴 Creator

**Coding Cabana CEO**

<!-- NOTE: Replace "Coding Cabana CEO" above with your real name when ready -->

---

## 📄 License

MIT

---

*Built with React, Supabase, Framer Motion, Tailwind CSS, and a lot of ☀️*
