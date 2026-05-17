'use client'

import type { BodyType, ProductColor } from '@/types'

interface Props {
  bodyType: BodyType
  color: ProductColor
  designUrl?: string | null
  placement?: 'front' | 'one_point' | 'back'
  className?: string
}

// カラートークン
const PALETTE = {
  white: { fill: '#F7F7F5', stroke: '#DDDDD8', shadow1: '#E4E4E0', shadow2: '#CACAC6', hi: '#FFFFFF', bg: '#E0E0DC' },
  black: { fill: '#1C1C1C', stroke: '#323232', shadow1: '#141414', shadow2: '#0A0A0A', hi: '#2E2E2E', bg: '#484848' },
  gray:  { fill: '#9C9C9A', stroke: '#888886', shadow1: '#7A7A78', shadow2: '#626260', hi: '#B4B4B2', bg: '#C4C4C2' },
}

// デザイン配置（400×440 座標系）
const DESIGN_POS = {
  front:     { x: 142, y: 168, w: 116, h: 116 },
  one_point: { x: 116, y: 148, w:  60, h:  60 },
  back:      { x: 142, y: 168, w: 116, h: 116 },
}

// ─── 共通シャドウ定義 ─────────────────────────────────────────
function Defs({ id, p }: { id: string; p: typeof PALETTE.white }) {
  return (
    <defs>
      {/* メインボディグラデーション */}
      <linearGradient id={`${id}-lg`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={p.shadow1} />
        <stop offset="18%"  stopColor={p.fill} />
        <stop offset="50%"  stopColor={p.hi} />
        <stop offset="82%"  stopColor={p.fill} />
        <stop offset="100%" stopColor={p.shadow1} />
      </linearGradient>
      {/* 袖グラデーション左 */}
      <linearGradient id={`${id}-sl`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={p.shadow2} />
        <stop offset="50%"  stopColor={p.shadow1} />
        <stop offset="100%" stopColor={p.fill} />
      </linearGradient>
      {/* 袖グラデーション右 */}
      <linearGradient id={`${id}-sr`} x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%"   stopColor={p.shadow2} />
        <stop offset="50%"  stopColor={p.shadow1} />
        <stop offset="100%" stopColor={p.fill} />
      </linearGradient>
      {/* ドロップシャドウ */}
      <filter id={`${id}-ds`} x="-8%" y="-4%" width="116%" height="116%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.20" />
      </filter>
      {/* ハイライトフィルター */}
      <radialGradient id={`${id}-hl`} cx="50%" cy="35%" r="50%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

// ─── Tシャツ ──────────────────────────────────────────────────
function Tshirt({ p, id, designUrl, placement }: {
  p: typeof PALETTE.white; id: string; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = DESIGN_POS[placement]
  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} p={p} />
      {/* 影 */}
      <ellipse cx="200" cy="434" rx="148" ry="8" fill="#000" opacity="0.12" />
      {/* 左袖 */}
      <path
        d="M102,62 L20,108 L36,168 L112,142 Z"
        fill={`url(#${id}-sl)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      {/* 右袖 */}
      <path
        d="M298,62 L380,108 L364,168 L288,142 Z"
        fill={`url(#${id}-sr)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      {/* ボディ */}
      <path
        d="M102,62 C118,54 146,48 152,70 C160,34 240,34 248,70 C254,48 282,54 298,62 L288,142 L290,424 L110,424 L112,142 Z"
        fill={`url(#${id}-lg)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      {/* カラーリブ（内側） */}
      <path d="M152,70 C160,34 240,34 248,70 C234,90 166,90 152,70 Z" fill={p.shadow1} />
      {/* カラーリブ縁取り */}
      <path d="M152,70 C160,34 240,34 248,70" fill="none" stroke={p.shadow2} strokeWidth="5" strokeLinecap="round" />
      {/* 肩ライン */}
      <path d="M152,70 L102,62" fill="none" stroke={p.shadow1} strokeWidth="1.2" opacity="0.6" />
      <path d="M248,70 L298,62" fill="none" stroke={p.shadow1} strokeWidth="1.2" opacity="0.6" />
      {/* 袖付けライン */}
      <path d="M112,142 L288,142" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.5" />
      {/* 脇ライン */}
      <path d="M112,142 L110,424" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.4" />
      <path d="M288,142 L290,424" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.4" />
      {/* 袖折り目 */}
      <path d="M78,88 C88,112 100,132 112,142" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.4" />
      <path d="M322,88 C312,112 300,132 288,142" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.4" />
      {/* 袖口リブ */}
      <path d="M20,108 L36,168" fill="none" stroke={p.shadow2} strokeWidth="4" strokeLinecap="round" />
      <path d="M380,108 L364,168" fill="none" stroke={p.shadow2} strokeWidth="4" strokeLinecap="round" />
      {/* 裾リブ */}
      <path d="M110,420 L290,420" fill="none" stroke={p.shadow2} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* 中央ハイライト */}
      <rect x="110" y="62" width="180" height="362" rx="4" fill={`url(#${id}-hl)`} />
      {/* デザイン */}
      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
      {placement === 'back' && (
        <text x="200" y="296" textAnchor="middle" fontSize="13" fill={p.shadow2} fontFamily="sans-serif" opacity="0.6">BACK PRINT</text>
      )}
    </svg>
  )
}

// ─── ロングスリーブ ───────────────────────────────────────────
function LongSleeve({ p, id, designUrl, placement }: {
  p: typeof PALETTE.white; id: string; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = DESIGN_POS[placement]
  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} p={p} />
      <ellipse cx="200" cy="434" rx="148" ry="8" fill="#000" opacity="0.12" />
      {/* 左長袖 */}
      <path d="M102,62 L16,384 L52,396 L112,142 Z" fill={`url(#${id}-sl)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`} />
      {/* 右長袖 */}
      <path d="M298,62 L384,384 L348,396 L288,142 Z" fill={`url(#${id}-sr)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`} />
      {/* ボディ */}
      <path
        d="M102,62 C118,54 146,48 152,70 C160,34 240,34 248,70 C254,48 282,54 298,62 L288,142 L290,424 L110,424 L112,142 Z"
        fill={`url(#${id}-lg)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      <path d="M152,70 C160,34 240,34 248,70 C234,90 166,90 152,70 Z" fill={p.shadow1} />
      <path d="M152,70 C160,34 240,34 248,70" fill="none" stroke={p.shadow2} strokeWidth="5" strokeLinecap="round" />
      <path d="M152,70 L102,62" fill="none" stroke={p.shadow1} strokeWidth="1.2" opacity="0.6" />
      <path d="M248,70 L298,62" fill="none" stroke={p.shadow1} strokeWidth="1.2" opacity="0.6" />
      <path d="M112,142 L288,142" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.5" />
      <path d="M112,142 L110,424" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.4" />
      <path d="M288,142 L290,424" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.4" />
      {/* 袖折り目 */}
      <path d="M72,128 C62,220 40,310 16,384" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.35" />
      <path d="M328,128 C338,220 360,310 384,384" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.35" />
      {/* カフスリブ */}
      <path d="M16,384 L52,396" fill="none" stroke={p.shadow2} strokeWidth="6" strokeLinecap="round" />
      <path d="M384,384 L348,396" fill="none" stroke={p.shadow2} strokeWidth="6" strokeLinecap="round" />
      <path d="M110,420 L290,420" fill="none" stroke={p.shadow2} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <rect x="110" y="62" width="180" height="362" rx="4" fill={`url(#${id}-hl)`} />
      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
    </svg>
  )
}

// ─── スウェット ───────────────────────────────────────────────
function Sweatshirt({ p, id, designUrl, placement }: {
  p: typeof PALETTE.white; id: string; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = DESIGN_POS[placement]
  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} p={p} />
      <ellipse cx="200" cy="434" rx="150" ry="8" fill="#000" opacity="0.12" />
      {/* 左長袖（やや太め） */}
      <path d="M100,64 L12,390 L50,404 L110,144 Z" fill={`url(#${id}-sl)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`} />
      {/* 右長袖 */}
      <path d="M300,64 L388,390 L350,404 L290,144 Z" fill={`url(#${id}-sr)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`} />
      {/* ボディ（少し縦長・ゆったり） */}
      <path
        d="M100,64 C118,56 146,50 152,72 C160,36 240,36 248,72 C254,50 282,56 300,64 L290,144 L292,420 L108,420 L110,144 Z"
        fill={`url(#${id}-lg)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      {/* 太めのクルーネックリブ */}
      <path d="M152,72 C160,36 240,36 248,72 C234,95 166,95 152,72 Z" fill={p.shadow1} />
      <path d="M152,72 C160,36 240,36 248,72" fill="none" stroke={p.shadow2} strokeWidth="7" strokeLinecap="round" />
      <path d="M110,144 L290,144" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.5" />
      <path d="M110,144 L108,420" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.4" />
      <path d="M290,144 L292,420" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.4" />
      {/* 袖折り目 */}
      <path d="M70,130 C58,220 36,316 12,390" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.35" />
      <path d="M330,130 C342,220 364,316 388,390" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.35" />
      {/* 太めカフス・裾リブ */}
      <path d="M12,390 L50,404" fill="none" stroke={p.shadow2} strokeWidth="8" strokeLinecap="round" />
      <path d="M388,390 L350,404" fill="none" stroke={p.shadow2} strokeWidth="8" strokeLinecap="round" />
      <path d="M108,415" fill="none" stroke={p.shadow2} strokeWidth="1" />
      <rect x="108" y="410" width="184" height="10" rx="3" fill={p.shadow1} opacity="0.5" />
      <path d="M108,420 L292,420" fill="none" stroke={p.shadow2} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <rect x="110" y="64" width="180" height="356" rx="4" fill={`url(#${id}-hl)`} />
      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
    </svg>
  )
}

// ─── パーカー ─────────────────────────────────────────────────
function Hoodie({ p, id, designUrl, placement }: {
  p: typeof PALETTE.white; id: string; designUrl?: string | null; placement: 'front'|'one_point'|'back'
}) {
  const dp = { ...DESIGN_POS[placement], y: DESIGN_POS[placement].y + 34 }
  return (
    <svg viewBox="0 0 400 478" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} p={p} />
      <ellipse cx="200" cy="472" rx="150" ry="8" fill="#000" opacity="0.12" />
      {/* フード */}
      <path
        d="M100,96 C92,70 94,14 200,6 C306,14 308,70 300,96 C280,78 258,88 248,96 C240,60 160,60 152,96 C142,88 120,78 100,96 Z"
        fill={`url(#${id}-lg)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      {/* フード内側の影 */}
      <path
        d="M152,96 C160,60 240,60 248,96 C234,116 166,116 152,96 Z"
        fill={p.shadow2} opacity="0.6"
      />
      {/* 左袖 */}
      <path d="M100,96 L12,404 L50,418 L110,174 Z" fill={`url(#${id}-sl)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`} />
      {/* 右袖 */}
      <path d="M300,96 L388,404 L350,418 L290,174 Z" fill={`url(#${id}-sr)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`} />
      {/* ボディ */}
      <path
        d="M100,96 C120,88 148,84 152,96 C160,60 240,60 248,96 C252,84 280,88 300,96 L290,174 L292,454 L108,454 L110,174 Z"
        fill={`url(#${id}-lg)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${id}-ds)`}
      />
      {/* フード境界線 */}
      <path d="M100,96 C120,82 142,90 152,96 C160,60 240,60 248,96 C258,90 280,82 300,96"
        fill="none" stroke={p.shadow1} strokeWidth="1.2" opacity="0.7" />
      {/* センタージッパー */}
      <line x1="200" y1="96" x2="200" y2="196" stroke={p.shadow1} strokeWidth="2" strokeDasharray="5,3" opacity="0.5" />
      <rect x="193" y="158" width="14" height="10" rx="2" fill={p.shadow1} stroke={p.shadow2} strokeWidth="0.8" opacity="0.8" />
      {/* カンガルーポケット */}
      <path
        d="M140,300 C140,290 152,285 200,285 C248,285 260,290 260,300 L260,366 C260,374 248,378 200,378 C152,378 140,374 140,366 Z"
        fill={p.shadow1} stroke={p.shadow2} strokeWidth="1" opacity="0.65"
      />
      <line x1="200" y1="285" x2="200" y2="378" stroke={p.shadow2} strokeWidth="1" opacity="0.4" />
      {/* 袖付けライン */}
      <path d="M110,174 L290,174" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.5" />
      {/* 袖折り目 */}
      <path d="M70,162 C56,244 34,330 12,404" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.35" />
      <path d="M330,162 C344,244 366,330 388,404" fill="none" stroke={p.shadow1} strokeWidth="1.5" opacity="0.35" />
      {/* カフス・裾リブ */}
      <path d="M12,404 L50,418" fill="none" stroke={p.shadow2} strokeWidth="8" strokeLinecap="round" />
      <path d="M388,404 L350,418" fill="none" stroke={p.shadow2} strokeWidth="8" strokeLinecap="round" />
      <rect x="108" y="444" width="184" height="10" rx="3" fill={p.shadow1} opacity="0.5" />
      <path d="M108,454 L292,454" fill="none" stroke={p.shadow2} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {/* ハイライト */}
      <rect x="110" y="96" width="180" height="358" rx="4" fill={`url(#${id}-hl)`} />
      {designUrl && placement !== 'back' && (
        <image href={designUrl} x={dp.x} y={dp.y} width={dp.w} height={dp.h} preserveAspectRatio="xMidYMid meet" />
      )}
    </svg>
  )
}

// ─── メインエクスポート ──────────────────────────────────────
export function ProductMockup({ bodyType, color, designUrl, placement = 'front', className = '' }: Props) {
  const p  = PALETTE[color]
  const pl = placement as 'front' | 'one_point' | 'back'
  const id = `${bodyType}-${color}`
  const bg = color === 'black' ? 'bg-zinc-600' : color === 'gray' ? 'bg-zinc-300' : 'bg-zinc-200'

  return (
    <div className={`${bg} rounded-2xl flex items-center justify-center ${className}`} style={{ padding: '5%' }}>
      <div className="w-full max-w-[300px]" style={{ aspectRatio: bodyType === 'hoodie' ? '400/478' : '400/440' }}>
        {bodyType === 'tshirt'      && <Tshirt     p={p} id={id} designUrl={designUrl} placement={pl} />}
        {bodyType === 'long_sleeve' && <LongSleeve  p={p} id={id} designUrl={designUrl} placement={pl} />}
        {bodyType === 'sweatshirt'  && <Sweatshirt  p={p} id={id} designUrl={designUrl} placement={pl} />}
        {bodyType === 'hoodie'      && <Hoodie      p={p} id={id} designUrl={designUrl} placement={pl} />}
      </div>
    </div>
  )
}
