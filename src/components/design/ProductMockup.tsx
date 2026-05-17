import type { BodyType, ProductColor } from '@/types'

interface Props {
  bodyType: BodyType
  color: ProductColor
  designUrl?: string | null
  /** front / one_point / back — determines where design is overlaid */
  placement?: 'front' | 'one_point' | 'back'
  className?: string
}

// Per-color fill values
const COLORS: Record<ProductColor, { base: string; dark: string; stroke: string; pocket?: string }> = {
  white: { base: '#F8F8F6', dark: '#E2E2DE', stroke: '#C8C8C4' },
  black: { base: '#242424', dark: '#141414', stroke: '#3A3A3A' },
  gray:  { base: '#A8A8A4', dark: '#888884', stroke: '#989894' },
}

// Design area (x, y, width, height) in the 200×240 viewBox
const DESIGN_AREA: Record<'front' | 'one_point', { x: number; y: number; w: number; h: number }> = {
  one_point: { x: 66, y: 80,  w: 30, h: 30 },
  front:     { x: 62, y: 90,  w: 76, h: 72 },
}

// ── T-SHIRT ────────────────────────────────────────────────
function TshirtShape({ c, designUrl, placement }: { c: typeof COLORS.white; designUrl?: string | null; placement: 'front' | 'one_point' | 'back' }) {
  const dp = placement !== 'back' ? DESIGN_AREA[placement] : null
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
      {/* Body + sleeves */}
      <path
        d="M 74,42 C 78,24 122,24 126,42 L 150,30 L 193,72 L 172,107 L 143,93 L 143,222 L 57,222 L 57,93 L 28,107 L 7,72 L 50,30 Z"
        fill={c.base} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline rib */}
      <path d="M 74,42 C 78,24 122,24 126,42" fill="none" stroke={c.dark} strokeWidth="5" strokeLinecap="round" />
      {/* Sleeve seam line */}
      <line x1="57" y1="93" x2="143" y2="93" stroke={c.dark} strokeWidth="0.8" strokeDasharray="4,3" opacity="0.5" />
      {/* Side seam lines */}
      <line x1="57"  y1="93"  x2="57"  y2="222" stroke={c.dark} strokeWidth="0.8" strokeDasharray="4,3" opacity="0.3" />
      <line x1="143" y1="93"  x2="143" y2="222" stroke={c.dark} strokeWidth="0.8" strokeDasharray="4,3" opacity="0.3" />
      {/* Design overlay */}
      {designUrl && dp && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="100" y="158" textAnchor="middle" fontSize="11" fill={c.dark} opacity="0.6" fontFamily="sans-serif">BACK</text>
      )}
    </svg>
  )
}

// ── LONG SLEEVE ────────────────────────────────────────────
function LongSleeveShape({ c, designUrl, placement }: { c: typeof COLORS.white; designUrl?: string | null; placement: 'front' | 'one_point' | 'back' }) {
  const dp = placement !== 'back' ? DESIGN_AREA[placement] : null
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
      {/* Body + long sleeves */}
      <path
        d="M 74,42 C 78,24 122,24 126,42 L 152,30 L 191,192 L 170,200 L 143,93 L 143,222 L 57,222 L 57,93 L 30,200 L 9,192 L 48,30 Z"
        fill={c.base} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline rib */}
      <path d="M 74,42 C 78,24 122,24 126,42" fill="none" stroke={c.dark} strokeWidth="5" strokeLinecap="round" />
      {/* Cuffs */}
      <line x1="170" y1="200" x2="191" y2="192" stroke={c.dark} strokeWidth="4" strokeLinecap="round" />
      <line x1="9"   y1="192" x2="30"  y2="200" stroke={c.dark} strokeWidth="4" strokeLinecap="round" />
      {/* Sleeve seam */}
      <line x1="57" y1="93" x2="143" y2="93" stroke={c.dark} strokeWidth="0.8" strokeDasharray="4,3" opacity="0.5" />
      {designUrl && dp && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="100" y="158" textAnchor="middle" fontSize="11" fill={c.dark} opacity="0.6" fontFamily="sans-serif">BACK</text>
      )}
    </svg>
  )
}

// ── SWEATSHIRT ─────────────────────────────────────────────
function SweatshirtShape({ c, designUrl, placement }: { c: typeof COLORS.white; designUrl?: string | null; placement: 'front' | 'one_point' | 'back' }) {
  const dp = placement !== 'back' ? DESIGN_AREA[placement] : null
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
      {/* Body + long sleeves (slightly boxy) */}
      <path
        d="M 74,44 C 78,26 122,26 126,44 L 153,32 L 192,194 L 168,203 L 143,95 L 143,218 L 57,218 L 57,95 L 32,203 L 8,194 L 47,32 Z"
        fill={c.base} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline rib (wider for sweatshirt) */}
      <path d="M 74,44 C 78,26 122,26 126,44" fill="none" stroke={c.dark} strokeWidth="6" strokeLinecap="round" />
      {/* Ribbed hem */}
      <line x1="57" y1="214" x2="143" y2="214" stroke={c.dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* Cuffs */}
      <line x1="168" y1="203" x2="192" y2="194" stroke={c.dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <line x1="8"   y1="194" x2="32"  y2="203" stroke={c.dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* Sleeve seam */}
      <line x1="57" y1="95" x2="143" y2="95" stroke={c.dark} strokeWidth="0.8" strokeDasharray="4,3" opacity="0.5" />
      {designUrl && dp && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="100" y="158" textAnchor="middle" fontSize="11" fill={c.dark} opacity="0.6" fontFamily="sans-serif">BACK</text>
      )}
    </svg>
  )
}

// ── HOODIE ─────────────────────────────────────────────────
function HoodieShape({ c, designUrl, placement }: { c: typeof COLORS.white; designUrl?: string | null; placement: 'front' | 'one_point' | 'back' }) {
  // Design area shifts down a bit for hoodie (body starts lower due to hood)
  const HOODIE_DESIGN: typeof DESIGN_AREA = {
    one_point: { x: 66, y: 96,  w: 30, h: 30 },
    front:     { x: 62, y: 106, w: 76, h: 72 },
  }
  const dp = placement !== 'back' ? HOODIE_DESIGN[placement] : null
  return (
    <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
      {/* Hood */}
      <path
        d="M 50,58 C 48,44 50,10 100,4 C 150,10 152,44 150,58 C 140,48 130,56 126,58 C 122,40 78,40 74,58 C 70,56 60,48 50,58 Z"
        fill={c.base} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Body + long sleeves */}
      <path
        d="M 74,58 C 78,40 122,40 126,58 L 153,46 L 192,210 L 168,219 L 143,109 L 143,232 L 57,232 L 57,109 L 32,219 L 8,210 L 47,46 Z"
        fill={c.base} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Hood border line (where hood meets body) */}
      <path d="M 50,58 C 60,48 70,56 74,58 C 78,40 122,40 126,58 C 130,56 140,48 150,58" fill="none" stroke={c.dark} strokeWidth="1" opacity="0.6" />
      {/* Kangaroo pocket */}
      <rect x="72" y="162" width="56" height="38" rx="4" fill={c.dark} opacity="0.15" stroke={c.dark} strokeWidth="1" />
      <line x1="100" y1="162" x2="100" y2="200" stroke={c.dark} strokeWidth="0.8" opacity="0.3" />
      {/* Ribbed hem */}
      <line x1="57" y1="228" x2="143" y2="228" stroke={c.dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* Cuffs */}
      <line x1="168" y1="219" x2="192" y2="210" stroke={c.dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <line x1="8"   y1="210" x2="32"  y2="219" stroke={c.dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* Zipper hint */}
      <line x1="100" y1="58" x2="100" y2="130" stroke={c.dark} strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
      {designUrl && dp && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="100" y="172" textAnchor="middle" fontSize="11" fill={c.dark} opacity="0.6" fontFamily="sans-serif">BACK</text>
      )}
    </svg>
  )
}

// ── Main export ────────────────────────────────────────────
export function ProductMockup({ bodyType, color, designUrl, placement = 'front', className = '' }: Props) {
  const c = COLORS[color]
  const p = placement as 'front' | 'one_point' | 'back'
  const bg = color === 'white' ? 'bg-gray-100' : 'bg-gray-200'

  return (
    <div className={`${bg} rounded-2xl flex items-center justify-center p-6 ${className}`}>
      <div className="w-full max-w-[280px] aspect-[5/6]">
        {bodyType === 'tshirt'      && <TshirtShape     c={c} designUrl={designUrl} placement={p} />}
        {bodyType === 'long_sleeve' && <LongSleeveShape  c={c} designUrl={designUrl} placement={p} />}
        {bodyType === 'sweatshirt'  && <SweatshirtShape  c={c} designUrl={designUrl} placement={p} />}
        {bodyType === 'hoodie'      && <HoodieShape      c={c} designUrl={designUrl} placement={p} />}
      </div>
    </div>
  )
}
