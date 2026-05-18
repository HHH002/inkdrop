'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { BodyType, ProductColor } from '@/types'

interface Props {
  bodyType: BodyType
  color: ProductColor
  designUrl?: string | null
  placement?: 'front' | 'one_point' | 'back'
  patternId?: string
  className?: string
}

type Side = 'front' | 'back'

interface OverlayPos {
  top: string
  left: string
  width: string
  aspectRatio?: string
}

// ── patternId → 面 + オーバーレイ位置（コンテナの%）────────────
const PATTERN_POS: Record<string, { side: Side } & OverlayPos> = {
  A:   { side: 'front', top: '26%', left: '26%', width: '19%',  aspectRatio: '1/1' },
  C1:  { side: 'front', top: '27%', left: '22%', width: '56%',  aspectRatio: '1/1' },
  C2:  { side: 'front', top: '24%', left: '19%', width: '62%',  aspectRatio: '1/1' },
  B1:  { side: 'back',  top: '22%', left: '22%', width: '56%',  aspectRatio: '1/1' },
  B2:  { side: 'back',  top: '36%', left: '19%', width: '62%',  aspectRatio: '1/1' },
  AT1: { side: 'front', top: '26%', left: '25%', width: '22%',  aspectRatio: '3.2/1' },
  AT2: { side: 'front', top: '42%', left: '17%', width: '66%',  aspectRatio: '4.8/1' },
  AT3: { side: 'front', top: '56%', left: '18%', width: '64%',  aspectRatio: '4/1' },
  CT1: { side: 'front', top: '36%', left: '19%', width: '62%',  aspectRatio: '3.7/1' },
  CT2: { side: 'front', top: '35%', left: '17%', width: '66%',  aspectRatio: '2.9/1' },
  BT1: { side: 'back',  top: '22%', left: '17%', width: '66%',  aspectRatio: '4.2/1' },
  BT2: { side: 'back',  top: '46%', left: '17%', width: '66%',  aspectRatio: '4.2/1' },
  BT3: { side: 'back',  top: '68%', left: '17%', width: '66%',  aspectRatio: '4.2/1' },
  D1:  { side: 'back',  top: '20%', left: '22%', width: '56%',  aspectRatio: '1/1' },
  D2:  { side: 'back',  top: '22%', left: '22%', width: '56%',  aspectRatio: '1/1' },
  D3:  { side: 'back',  top: '36%', left: '18%', width: '64%',  aspectRatio: '3.75/1' },
  D4:  { side: 'back',  top: '32%', left: '18%', width: '64%',  aspectRatio: '3.75/1' },
}

// ── placement × bodyType → オーバーレイ位置 ─────────────────────
const PLACEMENT_POS: Record<'front' | 'one_point' | 'back', Record<BodyType, OverlayPos>> = {
  front: {
    tshirt:      { top: '27%', left: '22%', width: '56%', aspectRatio: '1/1' },
    long_sleeve: { top: '27%', left: '22%', width: '56%', aspectRatio: '1/1' },
    sweatshirt:  { top: '30%', left: '22%', width: '56%', aspectRatio: '1/1' },
    hoodie:      { top: '40%', left: '22%', width: '56%', aspectRatio: '1/1' },
  },
  one_point: {
    tshirt:      { top: '26%', left: '25%', width: '20%', aspectRatio: '1/1' },
    long_sleeve: { top: '26%', left: '25%', width: '20%', aspectRatio: '1/1' },
    sweatshirt:  { top: '28%', left: '25%', width: '20%', aspectRatio: '1/1' },
    hoodie:      { top: '36%', left: '25%', width: '20%', aspectRatio: '1/1' },
  },
  back: {
    tshirt:      { top: '26%', left: '22%', width: '56%', aspectRatio: '1/1' },
    long_sleeve: { top: '26%', left: '22%', width: '56%', aspectRatio: '1/1' },
    sweatshirt:  { top: '28%', left: '22%', width: '56%', aspectRatio: '1/1' },
    hoodie:      { top: '30%', left: '22%', width: '56%', aspectRatio: '1/1' },
  },
}

function getMockupSrc(bodyType: BodyType, color: ProductColor, side: Side): string {
  return `/mockups/${bodyType}_${color}_${side}.png`
}

export function ProductMockup({
  bodyType,
  color,
  designUrl,
  placement = 'front',
  patternId,
  className = '',
}: Props) {
  const pl = placement as 'front' | 'one_point' | 'back'

  // 面とオーバーレイ位置を決定
  let side: Side = pl === 'back' ? 'back' : 'front'
  let pos: OverlayPos

  if (patternId && PATTERN_POS[patternId]) {
    const pp = PATTERN_POS[patternId]
    side = pp.side
    pos = { top: pp.top, left: pp.left, width: pp.width, aspectRatio: pp.aspectRatio }
  } else {
    pos = PLACEMENT_POS[pl][bodyType]
  }

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    top:    pos.top,
    left:   pos.left,
    width:  pos.width,
    aspectRatio: pos.aspectRatio ?? '1/1',
  }

  return (
    <div className={`relative bg-white rounded-2xl overflow-hidden ${className}`}>
      {/* モックアップ写真 */}
      <Image
        src={getMockupSrc(bodyType, color, side)}
        alt={`${bodyType} ${color} ${side}`}
        fill
        className="object-contain"
        unoptimized
      />

      {/* デザインオーバーレイ */}
      {designUrl && (
        <div style={overlayStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={designUrl}
            alt="design"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
