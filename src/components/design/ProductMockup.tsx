'use client'

import type { BodyType, ProductColor } from '@/types'

interface Props {
  bodyType: BodyType
  color: ProductColor
  designUrl?: string | null
  placement?: 'front' | 'one_point' | 'back'
  className?: string
}

// Color tokens per product color
const PALETTE = {
  white: {
    base:      '#F4F4F2',
    highlight: '#FFFFFF',
    mid:       '#E8E8E6',
    shadow:    '#D0D0CE',
    deep:      '#B8B8B6',
    collar:    '#E0E0DE',
    text:      '#C0C0BE',
    bg:        '#E8E8E8',
  },
  black: {
    base:      '#202020',
    highlight: '#303030',
    mid:       '#181818',
    shadow:    '#101010',
    deep:      '#080808',
    collar:    '#282828',
    text:      '#555555',
    bg:        '#404040',
  },
  gray: {
    base:      '#9A9A98',
    highlight: '#B8B8B6',
    mid:       '#888886',
    shadow:    '#707070',
    deep:      '#585856',
    collar:    '#929290',
    text:      '#707070',
    bg:        '#C0C0BE',
  },
}

// Design overlay positions in the 400×460 coordinate space
const DESIGN_POS = {
  front:     { x: 138, y: 165, w: 124, h: 124 },
  one_point: { x: 118, y: 148, w:  64, h:  64 },
  back:      { x: 138, y: 165, w: 124, h: 124 },
}

// ─── T-SHIRT ─────────────────────────────────────────────────────────────────
function TshirtFront({ p, designUrl, placement }: {
  p: typeof PALETTE.white; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = DESIGN_POS[placement]
  const id = `ts-${p.base.replace('#','')}`
  return (
    <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Body gradient - light center, darker edges */}
        <radialGradient id={`${id}-body`} cx="48%" cy="42%" r="58%">
          <stop offset="0%"   stopColor={p.highlight} />
          <stop offset="55%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        {/* Left sleeve gradient */}
        <linearGradient id={`${id}-sl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={p.mid} />
          <stop offset="60%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        {/* Right sleeve gradient */}
        <linearGradient id={`${id}-sr`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={p.mid} />
          <stop offset="60%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        {/* Drop shadow filter */}
        <filter id={`${id}-shadow`} x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.18" />
        </filter>
        {/* Collar inner shadow */}
        <radialGradient id={`${id}-collar`} cx="50%" cy="100%" r="80%">
          <stop offset="0%"   stopColor={p.deep} />
          <stop offset="100%" stopColor={p.collar} />
        </radialGradient>
      </defs>

      {/* ── Left sleeve ── */}
      <path
        d="M 100,58 L 22,108 L 36,172 L 110,148 Z"
        fill={`url(#${id}-sl)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* ── Right sleeve ── */}
      <path
        d="M 300,58 L 378,108 L 364,172 L 290,148 Z"
        fill={`url(#${id}-sr)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* ── Main body ── */}
      <path
        d="M 100,58 C 120,50 150,44 154,68 C 162,30 238,30 246,68 C 250,44 280,50 300,58 L 290,148 L 294,440 L 106,440 L 110,148 Z"
        fill={`url(#${id}-body)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* ── Collar opening ── */}
      <path
        d="M 154,68 C 162,30 238,30 246,68 C 232,84 168,84 154,68 Z"
        fill={`url(#${id}-collar)`}
      />
      {/* ── Collar rib border ── */}
      <path
        d="M 154,68 C 162,30 238,30 246,68"
        fill="none" stroke={p.deep} strokeWidth="5" strokeLinecap="round"
      />
      {/* ── Sleeve fold crease (left) ── */}
      <path d="M 80,88 C 90,110 100,130 110,148" fill="none" stroke={p.shadow} strokeWidth="1" opacity="0.5" />
      {/* ── Sleeve fold crease (right) ── */}
      <path d="M 320,88 C 310,110 300,130 290,148" fill="none" stroke={p.shadow} strokeWidth="1" opacity="0.5" />
      {/* ── Side seam lines ── */}
      <path d="M 110,150 C 106,250 106,340 106,440" fill="none" stroke={p.shadow} strokeWidth="0.8" opacity="0.4" />
      <path d="M 290,150 C 294,250 294,340 294,440" fill="none" stroke={p.shadow} strokeWidth="0.8" opacity="0.4" />
      {/* ── Shoulder seam lines ── */}
      <path d="M 154,68 L 100,58" fill="none" stroke={p.shadow} strokeWidth="1" opacity="0.4" />
      <path d="M 246,68 L 300,58" fill="none" stroke={p.shadow} strokeWidth="1" opacity="0.4" />
      {/* ── Hem rib ── */}
      <path d="M 106,436 L 294,436" fill="none" stroke={p.deep} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* ── Sleeve cuff ribs ── */}
      <path d="M 36,169 L 22,112" fill="none" stroke={p.deep} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M 364,169 L 378,112" fill="none" stroke={p.deep} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* ── Subtle body highlight ── */}
      <path
        d="M 175,100 C 200,95 225,95 225,100 L 225,300 C 225,305 200,305 175,300 Z"
        fill={p.highlight} opacity="0.15"
      />

      {/* ── Design overlay ── */}
      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="200" y="300" textAnchor="middle" fontSize="14" fill={p.text} fontFamily="sans-serif" opacity="0.7">BACK PRINT</text>
      )}
    </svg>
  )
}

// ─── LONG SLEEVE ─────────────────────────────────────────────────────────────
function LongSleeveFront({ p, designUrl, placement }: {
  p: typeof PALETTE.white; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = DESIGN_POS[placement]
  const id = `ls-${p.base.replace('#','')}`
  return (
    <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`${id}-body`} cx="48%" cy="42%" r="58%">
          <stop offset="0%"   stopColor={p.highlight} />
          <stop offset="55%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <linearGradient id={`${id}-sl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        <linearGradient id={`${id}-sr`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.18" />
        </filter>
        <radialGradient id={`${id}-collar`} cx="50%" cy="100%" r="80%">
          <stop offset="0%"   stopColor={p.deep} />
          <stop offset="100%" stopColor={p.collar} />
        </radialGradient>
      </defs>
      {/* Long left sleeve */}
      <path
        d="M 100,58 L 18,385 L 52,398 L 110,148 Z"
        fill={`url(#${id}-sl)`} filter={`url(#${id}-shadow)`}
      />
      {/* Long right sleeve */}
      <path
        d="M 300,58 L 382,385 L 348,398 L 290,148 Z"
        fill={`url(#${id}-sr)`} filter={`url(#${id}-shadow)`}
      />
      {/* Main body */}
      <path
        d="M 100,58 C 120,50 150,44 154,68 C 162,30 238,30 246,68 C 250,44 280,50 300,58 L 290,148 L 294,440 L 106,440 L 110,148 Z"
        fill={`url(#${id}-body)`} filter={`url(#${id}-shadow)`}
      />
      {/* Collar */}
      <path d="M 154,68 C 162,30 238,30 246,68 C 232,84 168,84 154,68 Z" fill={`url(#${id}-collar)`} />
      <path d="M 154,68 C 162,30 238,30 246,68" fill="none" stroke={p.deep} strokeWidth="5" strokeLinecap="round" />
      {/* Cuffs */}
      <path d="M 18,385 L 52,398" fill="none" stroke={p.deep} strokeWidth="6" strokeLinecap="round" />
      <path d="M 382,385 L 348,398" fill="none" stroke={p.deep} strokeWidth="6" strokeLinecap="round" />
      {/* Side seams */}
      <path d="M 110,150 C 106,250 106,340 106,440" fill="none" stroke={p.shadow} strokeWidth="0.8" opacity="0.4" />
      <path d="M 290,150 C 294,250 294,340 294,440" fill="none" stroke={p.shadow} strokeWidth="0.8" opacity="0.4" />
      {/* Hem rib */}
      <path d="M 106,436 L 294,436" fill="none" stroke={p.deep} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Highlight */}
      <path d="M 175,100 C 200,95 225,95 225,100 L 225,300 C 225,305 200,305 175,300 Z" fill={p.highlight} opacity="0.15" />

      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="200" y="300" textAnchor="middle" fontSize="14" fill={p.text} fontFamily="sans-serif" opacity="0.7">BACK PRINT</text>
      )}
    </svg>
  )
}

// ─── SWEATSHIRT ───────────────────────────────────────────────────────────────
function SweatshirtFront({ p, designUrl, placement }: {
  p: typeof PALETTE.white; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = DESIGN_POS[placement]
  const id = `sw-${p.base.replace('#','')}`
  return (
    <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`${id}-body`} cx="48%" cy="42%" r="58%">
          <stop offset="0%"   stopColor={p.highlight} />
          <stop offset="55%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <linearGradient id={`${id}-sl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        <linearGradient id={`${id}-sr`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.18" />
        </filter>
        <radialGradient id={`${id}-collar`} cx="50%" cy="100%" r="80%">
          <stop offset="0%"   stopColor={p.deep} />
          <stop offset="100%" stopColor={p.collar} />
        </radialGradient>
      </defs>
      {/* Long sleeves (slightly boxy) */}
      <path d="M 96,60 L 12,388 L 48,402 L 108,152 Z" fill={`url(#${id}-sl)`} filter={`url(#${id}-shadow)`} />
      <path d="M 304,60 L 388,388 L 352,402 L 292,152 Z" fill={`url(#${id}-sr)`} filter={`url(#${id}-shadow)`} />
      {/* Body - slightly boxy */}
      <path
        d="M 96,60 C 118,52 148,46 154,70 C 162,32 238,32 246,70 C 252,46 282,52 304,60 L 292,152 L 296,424 L 104,424 L 108,152 Z"
        fill={`url(#${id}-body)`} filter={`url(#${id}-shadow)`}
      />
      {/* Wide ribbed collar */}
      <path d="M 154,70 C 162,32 238,32 246,70 C 230,88 170,88 154,70 Z" fill={`url(#${id}-collar)`} />
      <path d="M 154,70 C 162,32 238,32 246,70" fill="none" stroke={p.deep} strokeWidth="7" strokeLinecap="round" />
      {/* Ribbed hem (wider for sweatshirt) */}
      <rect x="104" y="416" width="192" height="10" rx="2" fill={p.deep} opacity="0.3" />
      <path d="M 104,420 L 296,420" fill="none" stroke={p.deep} strokeWidth="2" opacity="0.4" />
      <path d="M 104,424 L 296,424" fill="none" stroke={p.deep} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      {/* Ribbed cuffs */}
      <path d="M 12,388 L 48,402" fill="none" stroke={p.deep} strokeWidth="7" strokeLinecap="round" />
      <path d="M 388,388 L 352,402" fill="none" stroke={p.deep} strokeWidth="7" strokeLinecap="round" />
      {/* Side seams */}
      <path d="M 108,154 L 104,424" fill="none" stroke={p.shadow} strokeWidth="0.8" opacity="0.4" />
      <path d="M 292,154 L 296,424" fill="none" stroke={p.shadow} strokeWidth="0.8" opacity="0.4" />
      {/* Highlight */}
      <path d="M 175,100 C 200,95 225,95 225,100 L 225,300 C 225,305 200,305 175,300 Z" fill={p.highlight} opacity="0.15" />

      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="200" y="300" textAnchor="middle" fontSize="14" fill={p.text} fontFamily="sans-serif" opacity="0.7">BACK PRINT</text>
      )}
    </svg>
  )
}

// ─── HOODIE ───────────────────────────────────────────────────────────────────
function HoodieFront({ p, designUrl, placement }: {
  p: typeof PALETTE.white; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = { ...DESIGN_POS[placement], y: DESIGN_POS[placement].y + 30 }
  const id = `hd-${p.base.replace('#','')}`
  return (
    <svg viewBox="0 0 400 490" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`${id}-body`} cx="48%" cy="42%" r="58%">
          <stop offset="0%"   stopColor={p.highlight} />
          <stop offset="55%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <radialGradient id={`${id}-hood`} cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={p.highlight} />
          <stop offset="60%"  stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <linearGradient id={`${id}-sl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        <linearGradient id={`${id}-sr`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor={p.mid} />
          <stop offset="100%" stopColor={p.shadow} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>
      {/* Hood */}
      <path
        d="M 96,88 C 88,62 90,10 200,4 C 310,10 312,62 304,88 C 280,68 248,82 246,88 C 238,56 162,56 154,88 C 152,82 120,68 96,88 Z"
        fill={`url(#${id}-hood)`} filter={`url(#${id}-shadow)`}
      />
      {/* Long sleeves */}
      <path d="M 96,88 L 12,405 L 50,418 L 108,178 Z" fill={`url(#${id}-sl)`} filter={`url(#${id}-shadow)`} />
      <path d="M 304,88 L 388,405 L 350,418 L 292,178 Z" fill={`url(#${id}-sr)`} filter={`url(#${id}-shadow)`} />
      {/* Body */}
      <path
        d="M 96,88 C 118,80 148,76 154,88 C 162,56 238,56 246,88 C 252,76 282,80 304,88 L 292,178 L 296,455 L 104,455 L 108,178 Z"
        fill={`url(#${id}-body)`} filter={`url(#${id}-shadow)`}
      />
      {/* Hood opening line */}
      <path d="M 96,88 C 120,72 152,84 154,88 C 162,56 238,56 246,88 C 248,84 280,72 304,88"
        fill="none" stroke={p.deep} strokeWidth="1.5" opacity="0.6" />
      {/* Center zipper pull */}
      <line x1="200" y1="88" x2="200" y2="172" stroke={p.shadow} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
      <rect x="194" y="138" width="12" height="8" rx="2" fill={p.mid} stroke={p.shadow} strokeWidth="0.8" />
      {/* Kangaroo pocket */}
      <path
        d="M 138,295 C 138,285 148,280 200,280 C 252,280 262,285 262,295 L 262,355 C 262,362 252,365 200,365 C 148,365 138,362 138,355 Z"
        fill={p.mid} stroke={p.deep} strokeWidth="1" opacity="0.7"
      />
      <line x1="200" y1="280" x2="200" y2="365" stroke={p.deep} strokeWidth="1" opacity="0.4" />
      {/* Ribbed cuffs */}
      <path d="M 12,405 L 50,418" fill="none" stroke={p.deep} strokeWidth="7" strokeLinecap="round" />
      <path d="M 388,405 L 350,418" fill="none" stroke={p.deep} strokeWidth="7" strokeLinecap="round" />
      {/* Ribbed hem */}
      <path d="M 104,451 L 296,451" fill="none" stroke={p.deep} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      {/* Highlight */}
      <path d="M 175,130 C 200,125 225,125 225,130 L 225,270 C 225,275 200,275 175,270 Z" fill={p.highlight} opacity="0.12" />

      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="200" y="330" textAnchor="middle" fontSize="14" fill={p.text} fontFamily="sans-serif" opacity="0.7">BACK PRINT</text>
      )}
    </svg>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function ProductMockup({ bodyType, color, designUrl, placement = 'front', className = '' }: Props) {
  const p = PALETTE[color]
  const pl = placement as 'front' | 'one_point' | 'back'
  const bg = color === 'black' ? 'bg-zinc-700' : color === 'gray' ? 'bg-zinc-300' : 'bg-zinc-200'

  return (
    <div className={`${bg} rounded-2xl flex items-center justify-center ${className}`} style={{ padding: '6%' }}>
      <div className="w-full max-w-[320px] aspect-[400/460]">
        {bodyType === 'tshirt'      && <TshirtFront     p={p} designUrl={designUrl} placement={pl} />}
        {bodyType === 'long_sleeve' && <LongSleeveFront  p={p} designUrl={designUrl} placement={pl} />}
        {bodyType === 'sweatshirt'  && <SweatshirtFront  p={p} designUrl={designUrl} placement={pl} />}
        {bodyType === 'hoodie'      && <HoodieFront      p={p} designUrl={designUrl} placement={pl} />}
      </div>
    </div>
  )
}
