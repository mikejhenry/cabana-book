// ============================================================
// CabanaLogo — Inline SVG React Component
// Renders the CabanaBook circular beach-hut logo.
// Using an inline SVG (vs <img>) lets us animate it with CSS/Framer
// and control colors via props. The logo is identical to
// /public/cabana-logo.svg but as a reusable React component.
// ============================================================

interface CabanaLogoProps {
  size?: number      // Diameter in px — defaults to 40
  animate?: boolean  // If true, adds a slow floating/wave animation
  className?: string
}

export default function CabanaLogo({
  size = 40,
  animate = false,
  className = '',
}: CabanaLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      // The "animate-wave" class is defined in tailwind.config.js
      className={`${animate ? 'animate-wave' : ''} ${className} select-none`}
      aria-label="CabanaBook logo"
      role="img"
    >
      <defs>
        <linearGradient id="cb-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#3b93f3"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <linearGradient id="cb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1b4eaa"/>
          <stop offset="100%" stopColor="#1a5fd1"/>
        </linearGradient>
        <linearGradient id="cb-roof" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
        <clipPath id="cb-clip">
          <circle cx="50" cy="50" r="46"/>
        </clipPath>
      </defs>

      {/* Outer gradient ring */}
      <circle cx="50" cy="50" r="49" fill="url(#cb-ring)"/>
      {/* Deep blue inner background */}
      <circle cx="50" cy="50" r="44" fill="url(#cb-bg)"/>

      <g clipPath="url(#cb-clip)">
        {/* Ocean strip at the base */}
        <rect x="6" y="64" width="88" height="30" fill="#0e7490" opacity="0.45" rx="2"/>
        {/* Sun */}
        <circle cx="74" cy="28" r="7" fill="#fbbf24" opacity="0.9"/>
        <line x1="74" y1="18" x2="74" y2="16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        <line x1="74" y1="38" x2="74" y2="40" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        <line x1="64" y1="28" x2="62" y2="28" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        <line x1="84" y1="28" x2="86" y2="28" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        <line x1="67" y1="21" x2="65.5" y2="19.5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="81" y1="35" x2="82.5" y2="36.5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        {/* Support posts */}
        <rect x="32" y="56" width="5" height="18" rx="2.5" fill="#93c5fd"/>
        <rect x="63" y="56" width="5" height="18" rx="2.5" fill="#93c5fd"/>
        {/* Main thatched roof */}
        <polygon points="50,30 18,60 82,60" fill="url(#cb-roof)"/>
        {/* Thatch detail lines */}
        <line x1="22" y1="57" x2="40" y2="38" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="27" y1="59" x2="45" y2="40" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="33" y1="60" x2="50" y2="41" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="39" y1="60" x2="55" y2="43" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="46" y1="60" x2="61" y2="46" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="53" y1="60" x2="67" y2="50" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="60" y1="60" x2="73" y2="54" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        {/* Overhang layer */}
        <polygon points="50,44 22,63 78,63" fill="#fbbf24" opacity="0.65"/>
        {/* Ridge cap */}
        <ellipse cx="50" cy="30.5" rx="5" ry="3" fill="#1d4ed8" opacity="0.7"/>
        {/* Sand ground */}
        <ellipse cx="50" cy="74" rx="30" ry="4" fill="#fde68a" opacity="0.35"/>
      </g>

      {/* Outer polish ring */}
      <circle cx="50" cy="50" r="49" fill="none" stroke="url(#cb-ring)" strokeWidth="1.5"/>
    </svg>
  )
}
