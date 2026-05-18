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

const PALETTE = {
  white: {
    body:    '#F2F2EF',
    outline: '#2A2A2A',
    seam:    '#AAAAAA',
    inner:   '#E2E2DE',
    rib:     '#D8D8D4',
    bg:      '#DCDCD8',
    label:   '#AAAAAA',
  },
  black: {
    body:    '#1A1A1A',
    outline: '#888888',
    seam:    '#3A3A3A',
    inner:   '#282828',
    rib:     '#222222',
    bg:      '#444444',
    label:   '#666666',
  },
  gray: {
    body:    '#9A9A9A',
    outline: '#444444',
    seam:    '#777777',
    inner:   '#888888',
    rib:     '#858585',
    bg:      '#BCBCBA',
    label:   '#777777',
  },
}

// フォールバック配置（patternId 未指定時）
const DESIGN_POS = {
  front:     { x: 142, y: 165, w: 116, h: 116 },
  one_point: { x: 120, y: 148, w:  60, h:  60 },
  back:      { x: 142, y: 165, w: 116, h: 116 },
}

// パターン別配置座標（400×440 座標系、胴体 x:118-282 / y:80-422）
const BASE_DP: Record<string, { x: number; y: number; w: number; h: number }> = {
  A:   { x: 122, y: 100, w:  30, h:  30 },  // 18% torso width, 左胸
  C1:  { x: 177, y: 118, w:  46, h:  46 },  // 28% torso width, フロント中央
  C2:  { x: 163, y: 110, w:  74, h:  74 },  // 42% torso width, フロント大
  B1:  { x: 162, y: 110, w:  76, h: 163 },  // 45% height, 縦長バック
  B2:  { x: 155, y: 148, w:  90, h:  50 },  // 50% torso width, 横長バック
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

function resolveDP(
  patternId: string | undefined,
  placement: 'front' | 'one_point' | 'back',
  bodyType: BodyType,
) {
  if (patternId && BASE_DP[patternId]) {
    const base = BASE_DP[patternId]
    return { ...base, y: base.y + Y_ADJ[bodyType] }
  }
  const pos = DESIGN_POS[placement]
  return { ...pos, y: pos.y + Y_ADJ[bodyType] }
}

interface P { body: string; outline: string; seam: string; inner: string; rib: string; label: string }

interface GarmentProps {
  p: P
  id: string
  designUrl?: string | null
  placement: 'front' | 'one_point' | 'back'
  patternId?: string
  bodyType: BodyType
}

// ─── Tシャツ ──────────────────────────────────────────────────
function Tshirt({ p, id, designUrl, placement, patternId, bodyType }: GarmentProps) {
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')

  // T-shirt silhouette path
  const BODY = 'M155,68 C160,38 240,38 245,68 L280,80 L362,100 L347,162 L282,142 L285,422 L115,422 L118,142 L53,162 L38,100 L120,80 Z'

  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <clipPath id={`${id}-c`}><path d={BODY} /></clipPath>
      </defs>

      {/* 本体 */}
      <path d={BODY} fill={p.body} stroke={p.outline} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* 衿内側 */}
      <path d="M155,68 C160,98 240,98 245,68" fill={p.inner} stroke={p.outline} strokeWidth="1.8" />

      {/* 肩縫い目 */}
      <line x1="155" y1="68" x2="120" y2="80" stroke={p.seam} strokeWidth="1" />
      <line x1="245" y1="68" x2="280" y2="80" stroke={p.seam} strokeWidth="1" />

      {/* 袖付け線 */}
      <line x1="120" y1="80" x2="118" y2="142" stroke={p.seam} strokeWidth="1" />
      <line x1="280" y1="80" x2="282" y2="142" stroke={p.seam} strokeWidth="1" />

      {/* 脇縫い目 */}
      <line x1="118" y1="142" x2="115" y2="422" stroke={p.seam} strokeWidth="1" />
      <line x1="282" y1="142" x2="285" y2="422" stroke={p.seam} strokeWidth="1" />

      {/* 袖口縫い目 */}
      <line x1="38" y1="100" x2="53" y2="162" stroke={p.seam} strokeWidth="1" />
      <line x1="362" y1="100" x2="347" y2="162" stroke={p.seam} strokeWidth="1" />

      {/* 裾リブ */}
      <rect x="115" y="408" width="170" height="14" fill={p.rib} />
      <line x1="115" y1="408" x2="285" y2="408" stroke={p.outline} strokeWidth="1.5" />

      {/* デザイン */}
      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="275" textAnchor="middle" fontSize="11" fill={p.label}
          fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── ロングスリーブ ───────────────────────────────────────────
function LongSleeve({ p, id, designUrl, placement, patternId, bodyType }: GarmentProps) {
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')

  const BODY = 'M155,68 C160,38 240,38 245,68 L280,80 L388,378 L356,392 L282,142 L285,422 L115,422 L118,142 L44,392 L12,378 L120,80 Z'

  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <clipPath id={`${id}-c`}><path d={BODY} /></clipPath>
      </defs>

      <path d={BODY} fill={p.body} stroke={p.outline} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M155,68 C160,98 240,98 245,68" fill={p.inner} stroke={p.outline} strokeWidth="1.8" />

      <line x1="155" y1="68" x2="120" y2="80" stroke={p.seam} strokeWidth="1" />
      <line x1="245" y1="68" x2="280" y2="80" stroke={p.seam} strokeWidth="1" />
      <line x1="120" y1="80" x2="118" y2="142" stroke={p.seam} strokeWidth="1" />
      <line x1="280" y1="80" x2="282" y2="142" stroke={p.seam} strokeWidth="1" />
      <line x1="118" y1="142" x2="115" y2="422" stroke={p.seam} strokeWidth="1" />
      <line x1="282" y1="142" x2="285" y2="422" stroke={p.seam} strokeWidth="1" />

      {/* 袖縫い目 */}
      <line x1="12" y1="378" x2="44" y2="392" stroke={p.outline} strokeWidth="1.5" />
      <line x1="388" y1="378" x2="356" y2="392" stroke={p.outline} strokeWidth="1.5" />

      {/* カフスリブ */}
      <path d="M12,378 L44,392" stroke={p.rib} strokeWidth="8" strokeLinecap="round" />
      <path d="M388,378 L356,392" stroke={p.rib} strokeWidth="8" strokeLinecap="round" />
      <path d="M12,378 L44,392" stroke={p.outline} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M388,378 L356,392" stroke={p.outline} strokeWidth="1.8" strokeLinecap="round" />

      {/* 裾リブ */}
      <rect x="115" y="408" width="170" height="14" fill={p.rib} />
      <line x1="115" y1="408" x2="285" y2="408" stroke={p.outline} strokeWidth="1.5" />

      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="275" textAnchor="middle" fontSize="11" fill={p.label}
          fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── スウェット ───────────────────────────────────────────────
function Sweatshirt({ p, id, designUrl, placement, patternId, bodyType }: GarmentProps) {
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')

  const BODY = 'M150,76 C156,42 244,42 250,76 L288,90 L386,388 L352,404 L286,150 L290,422 L110,422 L114,150 L48,404 L14,388 L112,90 Z'

  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <clipPath id={`${id}-c`}><path d={BODY} /></clipPath>
      </defs>

      <path d={BODY} fill={p.body} stroke={p.outline} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* クルーネックリブ（スウェットは太め） */}
      <path d="M150,76 C156,106 244,106 250,76" fill={p.inner} stroke={p.outline} strokeWidth="2" />
      <path d="M150,76 C156,106 244,106 250,76 C244,118 156,118 150,76 Z" fill={p.inner} opacity="0.5" />
      <path d="M150,76 C154,62 200,58 250,76" fill="none" stroke={p.outline} strokeWidth="2.5" />

      <line x1="150" y1="76" x2="112" y2="90" stroke={p.seam} strokeWidth="1" />
      <line x1="250" y1="76" x2="288" y2="90" stroke={p.seam} strokeWidth="1" />
      <line x1="112" y1="90" x2="114" y2="150" stroke={p.seam} strokeWidth="1" />
      <line x1="288" y1="90" x2="286" y2="150" stroke={p.seam} strokeWidth="1" />
      <line x1="114" y1="150" x2="110" y2="422" stroke={p.seam} strokeWidth="1" />
      <line x1="286" y1="150" x2="290" y2="422" stroke={p.seam} strokeWidth="1" />

      {/* カフスリブ */}
      <path d="M14,388 L48,404" stroke={p.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M386,388 L352,404" stroke={p.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M14,388 L48,404" stroke={p.outline} strokeWidth="2" strokeLinecap="round" />
      <path d="M386,388 L352,404" stroke={p.outline} strokeWidth="2" strokeLinecap="round" />

      {/* 裾リブ */}
      <rect x="110" y="406" width="180" height="16" fill={p.rib} />
      <line x1="110" y1="406" x2="290" y2="406" stroke={p.outline} strokeWidth="1.8" />
      <line x1="110" y1="422" x2="290" y2="422" stroke={p.outline} strokeWidth="1.8" />

      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="275" textAnchor="middle" fontSize="11" fill={p.label}
          fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── パーカー ─────────────────────────────────────────────────
function Hoodie({ p, id, designUrl, placement, patternId, bodyType }: GarmentProps) {
  const dp = resolveDP(patternId, placement, bodyType)
  const showDesign = !!designUrl && (patternId ? true : placement !== 'back')

  const BODY = 'M148,100 C152,66 248,66 252,100 L292,116 L386,404 L352,420 L288,176 L292,456 L108,456 L112,176 L48,420 L14,404 L108,116 Z'
  const HOOD = 'M100,104 C88,74 88,14 200,6 C312,14 312,74 300,104 C280,84 256,94 252,100 C248,66 152,66 148,100 C144,94 120,84 100,104 Z'

  return (
    <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <clipPath id={`${id}-c`}><path d={BODY} /></clipPath>
      </defs>

      {/* フード */}
      <path d={HOOD} fill={p.body} stroke={p.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* フード内側の影 */}
      <path d="M148,100 C152,120 248,120 252,100 C236,128 164,128 148,100 Z" fill={p.inner} />
      <path d="M148,100 C152,120 248,120 252,100" stroke={p.outline} strokeWidth="1.8" />

      {/* ボディ */}
      <path d={BODY} fill={p.body} stroke={p.outline} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* フード境界線 */}
      <path d="M100,104 C120,90 144,98 148,100 C152,66 248,66 252,100 C256,98 280,90 300,104"
        fill="none" stroke={p.seam} strokeWidth="1.2" />

      {/* センタージッパー */}
      <line x1="200" y1="100" x2="200" y2="210" stroke={p.seam} strokeWidth="2" strokeDasharray="6,4" />
      <rect x="193" y="170" width="14" height="11" rx="2" fill={p.inner} stroke={p.seam} strokeWidth="1" />

      {/* カンガルーポケット */}
      <path d="M140,312 C140,300 154,294 200,294 C246,294 260,300 260,312 L260,378 C260,388 246,392 200,392 C154,392 140,388 140,378 Z"
        fill={p.inner} stroke={p.seam} strokeWidth="1.2" />
      <line x1="200" y1="294" x2="200" y2="392" stroke={p.seam} strokeWidth="1" />

      {/* 縫い目 */}
      <line x1="148" y1="100" x2="108" y2="116" stroke={p.seam} strokeWidth="1" />
      <line x1="252" y1="100" x2="292" y2="116" stroke={p.seam} strokeWidth="1" />
      <line x1="108" y1="116" x2="112" y2="176" stroke={p.seam} strokeWidth="1" />
      <line x1="292" y1="116" x2="288" y2="176" stroke={p.seam} strokeWidth="1" />
      <line x1="112" y1="176" x2="108" y2="456" stroke={p.seam} strokeWidth="1" />
      <line x1="288" y1="176" x2="292" y2="456" stroke={p.seam} strokeWidth="1" />

      {/* カフス */}
      <path d="M14,404 L48,420" stroke={p.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M386,404 L352,420" stroke={p.rib} strokeWidth="10" strokeLinecap="round" />
      <path d="M14,404 L48,420" stroke={p.outline} strokeWidth="2" strokeLinecap="round" />
      <path d="M386,404 L352,420" stroke={p.outline} strokeWidth="2" strokeLinecap="round" />

      {/* 裾リブ */}
      <rect x="108" y="440" width="184" height="16" fill={p.rib} />
      <line x1="108" y1="440" x2="292" y2="440" stroke={p.outline} strokeWidth="1.8" />
      <line x1="108" y1="456" x2="292" y2="456" stroke={p.outline} strokeWidth="1.8" />

      {showDesign && (
        <image href={designUrl!} x={dp.x} y={dp.y} width={dp.w} height={dp.h}
          preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-c)`} />
      )}
      {!showDesign && placement === 'back' && (
        <text x="200" y="310" textAnchor="middle" fontSize="11" fill={p.label}
          fontFamily="sans-serif" letterSpacing="3">BACK</text>
      )}
    </svg>
  )
}

// ─── メインエクスポート ──────────────────────────────────────
export function ProductMockup({ bodyType, color, designUrl, placement = 'front', patternId, className = '' }: Props) {
  const p  = PALETTE[color]
  const pl = placement as 'front' | 'one_point' | 'back'
  const id = `pm-${bodyType}-${color}`
  const bg = color === 'black' ? 'bg-zinc-700' : color === 'gray' ? 'bg-zinc-400' : 'bg-zinc-300'

  return (
    <div className={`${bg} rounded-2xl flex items-center justify-center ${className}`} style={{ padding: '6%' }}>
      <div className="w-full max-w-[300px]"
        style={{ aspectRatio: bodyType === 'hoodie' ? '400/480' : '400/440' }}>
        {bodyType === 'tshirt'      && <Tshirt     p={p} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
        {bodyType === 'long_sleeve' && <LongSleeve p={p} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
        {bodyType === 'sweatshirt'  && <Sweatshirt p={p} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
        {bodyType === 'hoodie'      && <Hoodie     p={p} id={id} designUrl={designUrl} placement={pl} patternId={patternId} bodyType={bodyType} />}
      </div>
    </div>
  )
}
