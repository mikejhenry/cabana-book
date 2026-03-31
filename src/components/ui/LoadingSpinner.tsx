// ============================================================
// LoadingSpinner — Branded loading indicator
// Uses CSS animation for a smooth spinning ring in brand blue.
// Used across the app during async operations.
// ============================================================

interface LoadingSpinnerProps {
  size?: number    // Diameter in px (default 36)
  className?: string
}

export default function LoadingSpinner({ size = 36, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="rounded-full border-4 border-surface-border animate-spin"
        style={{
          width:       size,
          height:      size,
          // Only the top border is colored — creates the spinning arc look
          borderTopColor: '#3b93f3',
        }}
      />
    </div>
  )
}
