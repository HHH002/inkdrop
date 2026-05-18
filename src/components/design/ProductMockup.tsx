'use client'

import type { BodyType, ProductColor } from '@/types'

interface Props {
  bodyType: BodyType
  color: ProductColor
  designUrl?: string | null
  placement?: 'front' | 'one_point' | 'back'
  patternId?: string
  className?: string
}

// カラーごとの値
const COLOR_CFG: Record<ProductColor, {
  body: string; shadow: string; highlight: string
  collar: string; collarShadow: string; seam: string; rib: string; outline: string
  label: string; bg: string
}> = {
  white: {
    body:         '#F4F3EF',
    shadow:       'rgba(0,0,0,0.14)',
    highlight:    'rgba(255,255,255,0.55)',
    collar:       '#E4E3DE',
    collarShadow: 'rgba(0,0,0,0.18)',
    seam:         '#BBBBB5',
    rib:          '#DDDDD8',
    outline:      '#999994',
    label:        '#BBBBBB',
    bg:           '#E8E8E4',
  },
  black: {
    body:         '#1C1C1C',
    shadow:       'rgba(0,0,0,0.55)',
    highlight:    'rgba(255,255,255,0.08)',
    collar:       '#2A2A2A',
    collarShadow: 'rgba(0,0,0,0.6)',
    seam:         '#383838',
    rib:          '#242424',
    outline:      '#555555',
    label:        '#606060',
    bg:           '#3A3A3A',
  },
  gray: {
    body:         '#9C9C98',
    shadow:       'rgba(0,0,0,0.25)',
    highlight:    'rgba(255,255,255,0.22)',
    collar:       '#8C8C88',
    collarShadow: 'rgba(0,0,0,0.3)',
    seam:         '#7A7A76',
    rib:          '#888884',
    outline:      '#666662',
    label:        '#AAAAAA',
    bg:           '#BCBCB8',
  },
}

const DESIGN_POS = {
  front:     { x: 142, y: 165, w: 116, h: 116 },
  one_point: { x: 120, y: 148, w:  60, h:  60 },
  back:      { x: 142, y: 165, w: 116, h: 116 },
}

const BASE_DP: Record<string, { x: number; y: number; w: number; h: number }> = {
  A:   { x: 122, y: 100, w:  30, h:  30 },
  C1:  { x: 177, y: 118, w:  46, h:  46 },
  C2:  { x: 163, y: 110, w:  74, h:  74 },
  B1:  { x: 162, y: 110, w:  76, h: 163 },
  B2:  { x: 155, y: 148, w:  90, h:  50 },
  D1:  { x: 165, y: 100, w:  70, h: 140 },
  D2:  { x: 165, y:  95, w:  70, h: 130 },
  D3:  { x: 155, y: 138, w:  90, h:  48 },
  D4:  { x: 155, y: 130, w:  90, h:  48 },
  AT1: { x: 122, y: 100, w:  58, h:  18 },
  AT2: { x: 152, y: 158, w:  96, h:  20 },
  AT3: { x: 182, y: 210, w:  72, h:  18 },
  CT1: { x: 163, y: 145, w:  74, h:  20 },
  CT2: { x: 150, y: 142, w: 100, h:  34 },
  BT1: { x: 145, y:  90, w: 110, h:  26 },
  BT2: { x: 145, y: 185, w: 110, h:  26 },
  BT3: { x: 145, y: 280, w: 110, h:  26 },
}

const Y_ADJ: Record<BodyType, number> = {
  tshirt:       0,
  long_sleeve: -5,
  sweatshirt:  -8,
  hoodie:      34,
}

function resolveDP(patternId: string | undefined, placement: 'front' | 'one_point' | 'back', bodyType: BodyType) {
  if (patternId && BASE_DP[patternId]) {
    const base = BASE_DP[patternId]
    return { ...base, y: base.y + Y_ADJ[bodyType] }
  }
  const pos = DESIGN_POS[placement]
  return { ...pos, y: pos.y + Y_ADJ[bodyType] }
}

// ─── 共通 SVG Defs（グラデーション・シャドウ）─────────────────
function Defs({ id, c }: { id: string; c: ReturnType<typeof getColor> }) {
  return (
    <defs>
      {/* ドロップシャドウ */}
      <filter id={`${id}-ds`} x="-15%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor={c.shadow} floodOpacity="1" />
      </filter>

      {/* 上から当たる光（ハイライト） */}
      <linearGradient id={`${id}-light`} x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%"   stopColor={c.highlight} />
        <stop offset="35%"  stopColor="rgba(255,255,255,0)" />
        <stop offset="100%" stopColor={c.shadow} stopOpacity="0.5" />
      </linearGradient>

      {/* 左右の影（立体感） */}
      <linearGradient id={`${id}-side`} x1="0" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
        <stop offset="0%"   stopColor={c.shadow} stopOpacity="0.35" />
        <stop offset="18%"  stopColor="rgba(0,0,0,0)" />
        <stop offset="82%"  stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor={c.shadow} stopOpacity="0.35" />
      </linearGradient>

      {/* 衿の内側シャドウ */}
      <radialGradient id={`${id}-collar`} cx="50%" cy="60%" r="60%">
        <stop offset="0%"   stopColor={c.collarShadow} stopOpacity="0.5" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
  )
}

function getColor(color: ProductColor) { return COLOR_CFG[color] }

// ─── Tシャツ ──────────────────────────────────────────────────
function Tshirt({ color, id, designUrl, placement, patternId, bodyType }: Omit<GarmentProps, 'p'> & { color: ProductColor }) {
  const c   = getColor(color)
  const dp  = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')
  const BODY = 'M155,68 C160,38 240,38 245,68 L280,80 L362,100 L347,162 L282,142 L285,422 L115,422 L118,142 L53,162 L38,100 L120,80 Z'

  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} c={c} />
      <defs>
        <clipPath id={`${id}-c`}><path d={BODY} /></clipPath>
      </defs>

      {/* 本体（シャドウ付き） */}
      <path d={BODY} fill={c.body} filter={`url(#${id}-ds)`} />
      {/* アウトライン */}
      <path d={BODY} fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinejoin="round" />
      {/* 光グラデーション */}
      <path d={BODY} fill={`url(#${id}-light)`} clipPath={`url(#${id}-c)`} />
      {/* 側面シャドウ */}
      <path d={BODY} fill={`url(#${id}-side)`} clipPath={`url(#${id}-c)`} />

      {/* 衿 */}
      <path d="M155,68 C160,95 240,95 245,68" fill={c.collar} />
      <path d="M155,68 C160,95 240,95 245,68" fill={`url(#${id}-collar)`} />
      <path d="M155,68 C160,38 240,38 245,68" fill="none" stroke={c.outline} strokeWidth="1.5" />
      <path d="M155,68 C160,95 240,95 245,68" fill="none" stroke={c.seam} strokeWidth="1.2" />

      {/* 縫い目 */}
      <line x1="155" y1="68" x2="120" y2="80" stroke={c.seam} strokeWidth="1" />
      <line x1="245" y1="68" x2="280" y2="80" stroke={c.seam} strokeWidth="1" />
      <line x1="120" y1="80" x2="118" y2="142" stroke={c.seam} strokeWidth="0.8" />
      <line x1="280" y1="80" x2="282" y2="142" stroke={c.seam} strokeWidth="0.8" />
      <line x1="118" y1="142" x2="115" y2="422" stroke={c.seam} strokeWidth="0.8" />
      <line x1="282" y1="142" x2="285" y2="422" stroke={c.seam} strokeWidth="0.8" />
      <line x1="38"  y1="100" x2="53"  y2="162" stroke={c.seam} strokeWidth="0.8" />
      <line x1="362" y1="100" x2="347" y2="162" stroke={c.seam} strokeWidth="0.8" />

      {/* 袖先のシャドウ（立体感） */}
      <path d="M38,100 L53,162" stroke={c.shadow} strokeWidth="6" strokeLinecap="round" opacity="0.18" />
      <path d="M362,100 L347,162" stroke={c.shadow} strokeWidth="6" strokeLinecap="round" opacity="0.18" />

      {/* 裾リブ */}
      <rect x="115" y="408" width="170" height="14" fill={c.rib} />
      <line x1="115" y1="408" x2="285" y2="408" stroke={c.seam} strokeWidth="1.2" />
      <line x1="115" y1="422" x2="285" y2="422" stroke={c.outline} strokeWidth="1.2" />

      {/* デザイン */}
      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="275" textAnchor="middle" fontSize="11" fill={c.label}
          fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── ロングスリーブ ───────────────────────────────────────────
function LongSleeve({ color, id, designUrl, placement, patternId, bodyType }: Omit<GarmentProps, 'p'> & { color: ProductColor }) {
  const c  = getColor(color)
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')
  const BODY = 'M155,68 C160,38 240,38 245,68 L280,80 L388,378 L356,392 L282,142 L285,422 L115,422 L118,142 L44,392 L12,378 L120,80 Z'

  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} c={c} />
      <defs><clipPath id={`${id}-c`}><path d={BODY} /></clipPath></defs>

      <path d={BODY} fill={c.body} filter={`url(#${id}-ds)`} />
      <path d={BODY} fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={BODY} fill={`url(#${id}-light)`} clipPath={`url(#${id}-c)`} />
      <path d={BODY} fill={`url(#${id}-side)`} clipPath={`url(#${id}-c)`} />

      <path d="M155,68 C160,95 240,95 245,68" fill={c.collar} />
      <path d="M155,68 C160,95 240,95 245,68" fill={`url(#${id}-collar)`} />
      <path d="M155,68 C160,38 240,38 245,68" fill="none" stroke={c.outline} strokeWidth="1.5" />
      <path d="M155,68 C160,95 240,95 245,68" fill="none" stroke={c.seam} strokeWidth="1.2" />

      <line x1="155" y1="68" x2="120" y2="80" stroke={c.seam} strokeWidth="1" />
      <line x1="245" y1="68" x2="280" y2="80" stroke={c.seam} strokeWidth="1" />
      <line x1="120" y1="80" x2="118" y2="142" stroke={c.seam} strokeWidth="0.8" />
      <line x1="280" y1="80" x2="282" y2="142" stroke={c.seam} strokeWidth="0.8" />
      <line x1="118" y1="142" x2="115" y2="422" stroke={c.seam} strokeWidth="0.8" />
      <line x1="282" y1="142" x2="285" y2="422" stroke={c.seam} strokeWidth="0.8" />

      {/* 袖縫い目 */}
      <line x1="12" y1="378" x2="44" y2="392" stroke={c.outline} strokeWidth="1.5" />
      <line x1="388" y1="378" x2="356" y2="392" stroke={c.outline} strokeWidth="1.5" />

      {/* カフスリブ */}
      <path d="M12,378 L44,392" stroke={c.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M388,378 L356,392" stroke={c.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M12,378 L44,392" stroke={c.seam} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M388,378 L356,392" stroke={c.seam} strokeWidth="1.8" strokeLinecap="round" />

      <rect x="115" y="408" width="170" height="14" fill={c.rib} />
      <line x1="115" y1="408" x2="285" y2="408" stroke={c.seam} strokeWidth="1.2" />
      <line x1="115" y1="422" x2="285" y2="422" stroke={c.outline} strokeWidth="1.2" />

      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="275" textAnchor="middle" fontSize="11" fill={c.label} fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── スウェット ───────────────────────────────────────────────
function Sweatshirt({ color, id, designUrl, placement, patternId, bodyType }: Omit<GarmentProps, 'p'> & { color: ProductColor }) {
  const c  = getColor(color)
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')
  const BODY = 'M150,76 C156,42 244,42 250,76 L288,90 L386,388 L352,404 L286,150 L290,422 L110,422 L114,150 L48,404 L14,388 L112,90 Z'

  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} c={c} />
      <defs><clipPath id={`${id}-c`}><path d={BODY} /></clipPath></defs>

      <path d={BODY} fill={c.body} filter={`url(#${id}-ds)`} />
      <path d={BODY} fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={BODY} fill={`url(#${id}-light)`} clipPath={`url(#${id}-c)`} />
      <path d={BODY} fill={`url(#${id}-side)`} clipPath={`url(#${id}-c)`} />

      {/* クルーネックリブ */}
      <path d="M150,76 C156,108 244,108 250,76" fill={c.collar} />
      <path d="M150,76 C156,108 244,108 250,76 C244,120 156,120 150,76 Z" fill={c.collar} opacity="0.5" />
      <path d="M150,76 C156,108 244,108 250,76" fill="none" stroke={c.seam} strokeWidth="1.5" />
      <path d="M150,76 C154,62 200,58 250,76" fill="none" stroke={c.outline} strokeWidth="2" />

      <line x1="150" y1="76" x2="112" y2="90" stroke={c.seam} strokeWidth="1" />
      <line x1="250" y1="76" x2="288" y2="90" stroke={c.seam} strokeWidth="1" />
      <line x1="112" y1="90" x2="114" y2="150" stroke={c.seam} strokeWidth="0.8" />
      <line x1="288" y1="90" x2="286" y2="150" stroke={c.seam} strokeWidth="0.8" />
      <line x1="114" y1="150" x2="110" y2="422" stroke={c.seam} strokeWidth="0.8" />
      <line x1="286" y1="150" x2="290" y2="422" stroke={c.seam} strokeWidth="0.8" />

      <path d="M14,388 L48,404" stroke={c.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M386,388 L352,404" stroke={c.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M14,388 L48,404" stroke={c.seam} strokeWidth="2" strokeLinecap="round" />
      <path d="M386,388 L352,404" stroke={c.seam} strokeWidth="2" strokeLinecap="round" />

      <rect x="110" y="406" width="180" height="16" fill={c.rib} />
      <line x1="110" y1="406" x2="290" y2="406" stroke={c.seam} strokeWidth="1.5" />
      <line x1="110" y1="422" x2="290" y2="422" stroke={c.outline} strokeWidth="1.5" />

      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="275" textAnchor="middle" fontSize="11" fill={c.label} fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── パーカー ─────────────────────────────────────────────────
function Hoodie({ color, id, designUrl, placement, patternId, bodyType }: Omit<GarmentProps, 'p'> & { color: ProductColor }) {
  const c  = getColor(color)
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')
  const BODY = 'M148,100 C152,66 248,66 252,100 L292,116 L386,404 L352,420 L288,176 L292,456 L108,456 L112,176 L48,420 L14,404 L108,116 Z'
  const HOOD = 'M100,104 C88,74 88,14 200,6 C312,14 312,74 300,104 C280,84 256,94 252,100 C248,66 152,66 148,100 C144,94 120,84 100,104 Z'

  return (
    <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} c={c} />
      <defs><clipPath id={`${id}-c`}><path d={BODY} /></clipPath></defs>

      <path d={HOOD} fill={c.body} filter={`url(#${id}-ds)`} />
      <path d={HOOD} fill={`url(#${id}-light)`} />
      <path d="M148,100 C152,122 248,122 252,100 C236,130 164,130 148,100 Z" fill={c.collar} />
      <path d="M148,100 C152,122 248,122 252,100" stroke={c.seam} strokeWidth="1.5" />

      <path d={BODY} fill={c.body} />
      <path d={BODY} fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={BODY} fill={`url(#${id}-light)`} clipPath={`url(#${id}-c)`} />
      <path d={BODY} fill={`url(#${id}-side)`} clipPath={`url(#${id}-c)`} />

      <path d="M100,104 C120,90 144,98 148,100 C152,66 248,66 252,100 C256,98 280,90 300,104"
        fill="none" stroke={c.seam} strokeWidth="1.2" />

      <line x1="200" y1="100" x2="200" y2="210" stroke={c.seam} strokeWidth="2" strokeDasharray="6,4" />
      <rect x="193" y="170" width="14" height="11" rx="2" fill={c.collar} stroke={c.seam} strokeWidth="1" />

      <path d="M140,312 C140,300 154,294 200,294 C246,294 260,300 260,312 L260,378 C260,388 246,392 200,392 C154,392 140,388 140,378 Z"
        fill={c.collar} stroke={c.seam} strokeWidth="1.2" />
      <line x1="200" y1="294" x2="200" y2="392" stroke={c.seam} strokeWidth="1" />

      <line x1="148" y1="100" x2="108" y2="116" stroke={c.seam} strokeWidth="1" />
      <line x1="252" y1="100" x2="292" y2="116" stroke={c.seam} strokeWidth="1" />
      <line x1="108" y1="116" x2="112" y2="176" stroke={c.seam} strokeWidth="0.8" />
      <line x1="292" y1="116" x2="288" y2="176" stroke={c.seam} strokeWidth="0.8" />
      <line x1="112" y1="176" x2="108" y2="456" stroke={c.seam} strokeWidth="0.8" />
      <line x1="288" y1="176" x2="292" y2="456" stroke={c.seam} strokeWidth="0.8" />

      <path d="M14,404 L48,420" stroke={c.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M386,404 L352,420" stroke={c.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M14,404 L48,420" stroke={c.seam} strokeWidth="2" strokeLinecap="round" />
      <path d="M386,404 L352,420" stroke={c.seam} strokeWidth="2" strokeLinecap="round" />

      <rect x="108" y="440" width="184" height="16" fill={c.rib} />
      <line x1="108" y1="440" x2="292" y2="440" stroke={c.seam} strokeWidth="1.5" />
      <line x1="108" y1="456" x2="292" y2="456" stroke={c.outline} strokeWidth="1.5" />

      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="310" textAnchor="middle" fontSize="11" fill={c.label} fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

interface GarmentProps {
  p: never
  color: ProductColor
  id: string
  designUrl?: string | null
  placement: 'front' | 'one_point' | 'back'
  patternId?: string
  bodyType: BodyType
}

// ─── メインエクスポート ──────────────────────────────────────
export function ProductMockup({ bodyType, color, designUrl, placement = 'front', patternId, className = '' }: Props) {
  const id = `pm-${bodyType}-${color}`
  const pl = placement as 'front' | 'one_point' | 'back'
  const cfg = COLOR_CFG[color]
  const bgStyle = { backgroundColor: cfg.bg }

  return (
    <div className={`rounded-2xl flex items-center justify-center ${className}`}
      style={{ ...bgStyle, padding: '6%' }}>
      <div className="w-full max-w-[300px]"
        style={{ aspectRatio: bodyType === 'hoodie' ? '400/480' : '400/440' }}>
        {bodyType === 'tshirt'      && <Tshirt      color={color} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
        {bodyType === 'long_sleeve' && <LongSleeve  color={color} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
        {bodyType === 'sweatshirt'  && <Sweatshirt  color={color} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
        {bodyType === 'hoodie'      && <Hoodie      color={color} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
      </div>
    </div>
  )
}
