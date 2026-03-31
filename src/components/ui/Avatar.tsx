// ============================================================
// Avatar — Reusable user avatar component
// Shows a profile photo or a generated initial-based fallback.
// Size prop accepts pixel values; online indicator is optional.
// ============================================================

interface AvatarProps {
  src: string | null | undefined
  name: string               // Used to generate initials fallback
  size?: number              // Width/height in px (default 40)
  online?: boolean           // Shows green dot if true
  className?: string
  onClick?: () => void
}

// Generate a consistent background color from a name string
// so the same user always gets the same color — no randomness on re-render.
function nameToColor(name: string): string {
  const colors = [
    '#3b93f3', '#06b6d4', '#8b5cf6', '#ec4899',
    '#f59e0b', '#10b981', '#ef4444', '#6366f1',
  ]
  // Sum the char codes and pick a color index
  const index = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

// Extract first + last initials from a display name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({
  src,
  name,
  size = 40,
  online = false,
  className = '',
  onClick,
}: AvatarProps) {
  const initials = getInitials(name)
  const bgColor  = nameToColor(name)

  return (
    // Relative container so the online dot can be absolutely positioned
    <div
      className={`relative inline-block flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {src ? (
        // Real profile photo
        <img
          src={src}
          alt={`${name}'s avatar`}
          className="rounded-full object-cover w-full h-full"
          style={{ width: size, height: size }}
        />
      ) : (
        // Initials fallback — colored circle with white letters
        <div
          className="rounded-full flex items-center justify-center font-semibold text-white select-none"
          style={{
            width:      size,
            height:     size,
            background: bgColor,
            fontSize:   size * 0.36,  // Proportional to avatar size
          }}
        >
          {initials}
        </div>
      )}

      {/* Green online indicator dot — appears bottom-right */}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  )
}
