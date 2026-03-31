// ============================================================
// MainLayout — Wrapper for all authenticated pages
// Renders the Navbar, three-column grid layout, and Footer.
// Every authenticated page (Feed, Profile, Friends, etc.)
// is wrapped in this component via React Router.
// ============================================================

import Navbar from './Navbar'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
  // Some pages (e.g. Profile) don't want the right sidebar
  hideRightSidebar?: boolean
}

export default function MainLayout({ children, hideRightSidebar = false }: MainLayoutProps) {
  return (
    // page-offset class (defined in index.css) adds padding-top = --nav-height
    <div className="page-offset bg-surface-bg min-h-screen">
      {/* Fixed top navbar */}
      <Navbar />

      {/* Three-column layout grid */}
      <div className="feed-layout">
        {/* Left column — nav sidebar */}
        <LeftSidebar />

        {/* Center column — main page content */}
        <main className="min-w-0 w-full">
          {children}
        </main>

        {/* Right column — contacts/suggestions */}
        {!hideRightSidebar && <RightSidebar />}
      </div>
    </div>
  )
}
