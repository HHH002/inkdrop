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
  showFrame?: boolean
  // テキスト描画
  textValue?: string
  textFont?: string
  textColor?: string
  textOutline?: boolean
  outlineColor?: string
  // テキストゾーンのロゴ（テキストの代わりにロゴを表示）
  textZoneLogoUrl?: string | null
}

type Side = 'front' | 'back'

interface OverlayPos {
  top: string
  left: string
  width: string
  height?: string
  aspectRatio?: string
}

// ヘルパー: [top, left, width, height] → OverlayPos
const p = (t: number, l: number, w: number, h: number): OverlayPos => ({
  top: `${t}%`, left: `${l}%`, width: `${w}%`, height: `${h}%`,
})

type PerBody = Record<BodyType, OverlayPos>

interface PatternEntry {
  side: Side
  z1: PerBody
  z2?: PerBody       // コンボパターン用（テキストゾーン）
  textOnly?: boolean // trueのときデザイン画像を表示しない（テキストのみパターン）
  logoZone?: boolean // trueのときロゴ画像を表示（A3：オリジナルロゴ追加用）
}

// フォントファミリーマップ
const FONT_FAMILY: Record<string, string> = {
  gothic:      '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif',
  square:      '"M PLUS Rounded 1c", "Arial Rounded MT Bold", "Rounded Mplus 1c", sans-serif',
  mincho:      '"Noto Serif JP", "Hiragino Mincho Pro", "Yu Mincho", Georgia, serif',
  handwritten: '"Klee One", "HG Gyoshotai", "Comic Sans MS", cursive',
  classic:     '"Libre Baskerville", "Palatino Linotype", "Book Antiqua", Palatino, serif',
}

// ── patternId → 配置データ（アイテム別）────────────────────────
const PATTERN_POS: Record<string, PatternEntry> = {
  // ── フロント デザイン ─────────────────────────────────────────
  A: {
    side: 'front',
    z1: {
      tshirt:      p(31,   58,   6,    6   ),
      long_sleeve: p(31.5, 57,   6,    6   ),
      sweatshirt:  p(29.5, 57.5, 6.5,  6.5 ),
      hoodie:      p(34,   57,   6.5,  6.5 ),
    },
  },
  A2: {
    side: 'front',
    z1: {
      tshirt:      p(27,   54.5, 13,   13   ),
      long_sleeve: p(27.5, 53.5, 13,   13.5 ),
      sweatshirt:  p(29.5, 54.5, 13,   13.5 ),
      hoodie:      p(30.5, 53.5, 13,   13   ),
    },
  },
  A3: {
    side: 'front',
    textOnly: true,
    logoZone: true,   // ロゴ画像を表示するゾーン（テキストは表示しない）
    z1: {
      tshirt:      p(27,   54.5, 13,   13   ),
      long_sleeve: p(27.5, 53.5, 13,   13.5 ),
      sweatshirt:  p(29.5, 54.5, 13,   13.5 ),
      hoodie:      p(30.5, 53.5, 13,   13   ),
    },
  },
  C1: {
    side: 'front',
    z1: {
      tshirt:      p(29.5, 42, 18, 18 ),
      long_sleeve: p(27.5, 41, 18, 18 ),
      sweatshirt:  p(29.5, 42, 17, 17 ),
      hoodie:      p(30.5, 41, 17, 17 ),
    },
  },
  C2: {
    side: 'front',
    z1: {
      tshirt:      p(27,   35,   32, 32 ),
      long_sleeve: p(27,   34.5, 32, 32 ),
      sweatshirt:  p(28.5, 34.5, 32, 32 ),
      hoodie:      p(27.5, 34,   32, 27 ),
    },
  },
  C3: {
    side: 'front',
    z1: {
      tshirt:      p(25.5, 35.5, 31,   50.5 ),
      long_sleeve: p(26,   34.5, 31.5, 50   ),
      sweatshirt:  p(27,   35,   30,   41.5 ),
      hoodie:      p(27,   39.5, 20.5, 27.5 ),
    },
  },

  // ── バック デザイン ───────────────────────────────────────────
  B1: {
    side: 'back',
    z1: {
      tshirt:      p(22.5, 34,   33.5, 54   ),
      long_sleeve: p(22.5, 33.5, 34,   48   ),
      sweatshirt:  p(22.5, 33.5, 33.5, 47   ),
      hoodie:      p(26.5, 33,   33.5, 45.5 ),
    },
  },
  B2: {
    side: 'back',
    z1: {
      tshirt:      p(24,   33.5, 35,   23   ),
      long_sleeve: p(24,   34,   33,   21   ),
      sweatshirt:  p(26.5, 33.5, 33.5, 21   ),
      hoodie:      p(29,   33.5, 34,   21.5 ),
    },
  },

  // ── フロント テキスト（デザイン画像なし・テキストゾーンのみ）───
  AT1: {
    side: 'front',
    textOnly: true,
    z1: {
      tshirt:      p(33,   53,   15, 5.5 ),
      long_sleeve: p(31,   52.5, 15, 5.5 ),
      sweatshirt:  p(30,   53,   15, 5.5 ),
      hoodie:      p(32.5, 53.5, 15, 5.5 ),
    },
  },
  AT2: {
    side: 'front',
    textOnly: true,
    z1: {
      tshirt:      p(58.5, 55.5, 15, 5 ),
      long_sleeve: p(55,   55,   15, 5 ),
      sweatshirt:  p(50.5, 55.5, 15, 5 ),
      hoodie:      p(50,   54.5, 15, 5 ),
    },
  },
  AT3: {
    side: 'front',
    textOnly: true,
    z1: {
      tshirt:      p(76.5, 57,   15, 5 ),
      long_sleeve: p(74,   56.5, 15, 5 ),
      sweatshirt:  p(66,   55,   15, 5 ),
      hoodie:      p(58,   41.5, 15, 5 ),
    },
  },
  CT1: {
    side: 'front',
    textOnly: true,
    z1: {
      tshirt:      p(30,   34.5, 33.5, 12 ),
      long_sleeve: p(29.5, 33.5, 33,   12 ),
      sweatshirt:  p(31,   32.5, 35.5, 12 ),
      hoodie:      p(32,   34.5, 32.5, 12 ),
    },
  },

  // ── バック テキスト（デザイン画像なし・テキストゾーンのみ）────
  BT1: {
    side: 'back',
    textOnly: true,
    z1: {
      tshirt:      p(23.5, 33.5, 33.5, 12 ),
      long_sleeve: p(23,   34,   33,   12 ),
      sweatshirt:  p(24,   33,   34,   12 ),
      hoodie:      p(30,   32,   35.5, 12 ),
    },
  },
  BT2: {
    side: 'back',
    textOnly: true,
    z1: {
      tshirt:      p(48.5, 31,   39.5, 12 ),
      long_sleeve: p(46,   33,   36,   12 ),
      sweatshirt:  p(46.5, 31.5, 38.5, 12 ),
      hoodie:      p(48,   30,   39.5, 12 ),
    },
  },
  BT3: {
    side: 'back',
    textOnly: true,
    z1: {
      tshirt:      p(69,   29,   42.5, 12 ),
      long_sleeve: p(63,   31.5, 38,   12 ),
      sweatshirt:  p(62.5, 31,   39,   12 ),
      hoodie:      p(63.5, 30.5, 40,   12 ),
    },
  },

  // ── フロント コンボ（デザイン＋テキスト） ─────────────────────
  F1: {
    side: 'front',
    z1: {
      tshirt:      p(36,   35.5, 31,   31   ),
      long_sleeve: p(35.5, 35.5, 29.5, 29.5 ),
      sweatshirt:  p(36,   34.5, 31.5, 31.5 ),
      hoodie:      p(35.5, 36.5, 28.5, 19.5 ),
    },
    z2: {
      tshirt:      p(28,   35.5, 31,   8 ),
      long_sleeve: p(28.5, 35.5, 29.5, 8 ),
      sweatshirt:  p(28.5, 34.5, 31.5, 8 ),
      hoodie:      p(28,   36.5, 28.5, 8 ),
    },
  },
  F2: {
    side: 'front',
    z1: {
      tshirt:      p(31,   35,   32,   32 ),
      long_sleeve: p(27.5, 34.5, 32,   32 ),
      sweatshirt:  p(28.5, 35,   31,   31 ),
      hoodie:      p(29,   36,   30,   25 ),
    },
    z2: {
      tshirt:      p(63,   35,   32,   8 ),
      long_sleeve: p(59,   34.5, 32,   8 ),
      sweatshirt:  p(59,   35,   31,   8 ),
      hoodie:      p(57,   40,   19.5, 6 ),
    },
  },

  // ── バック コンボ（デザイン＋テキスト） ──────────────────────
  D1: {
    side: 'back',
    z1: {
      tshirt:      p(31,   34,   32,   47   ),
      long_sleeve: p(31,   34,   33.5, 41.5 ),
      sweatshirt:  p(32.5, 34.5, 31.5, 38  ),
      hoodie:      p(36,   33.5, 33.5, 37.5 ),
    },
    z2: {
      tshirt:      p(23.5, 34,   32,   8 ),
      long_sleeve: p(23,   34,   33.5, 8 ),
      sweatshirt:  p(25.5, 34.5, 31.5, 8 ),
      hoodie:      p(28.5, 33.5, 33.5, 8 ),
    },
  },
  D2: {
    side: 'back',
    z1: {
      tshirt:      p(22,   34.5, 32.5, 47   ),
      long_sleeve: p(22,   34,   33,   39.5 ),
      sweatshirt:  p(24,   34,   32.5, 37   ),
      hoodie:      p(26.5, 33.5, 33.5, 36.5 ),
    },
    z2: {
      tshirt:      p(68.5, 34.5, 32.5, 8 ),
      long_sleeve: p(61,   34,   33,   8 ),
      sweatshirt:  p(60.5, 34,   32.5, 8 ),
      hoodie:      p(62.5, 33.5, 33.5, 8 ),
    },
  },
  E1: {
    side: 'back',
    z1: {
      tshirt:      p(32.5, 34,   34,   22.5 ),
      long_sleeve: p(31,   33,   34,   22.5 ),
      sweatshirt:  p(29.5, 32.5, 35,   22.5 ),
      hoodie:      p(35.5, 33.5, 33,   22   ),
    },
    z2: {
      tshirt:      p(54.5, 34,   34.5, 8 ),
      long_sleeve: p(53,   33,   34.5, 8 ),
      sweatshirt:  p(52,   32.5, 35.5, 8 ),
      hoodie:      p(57.5, 33.5, 33,   8 ),
    },
  },
  E2: {
    side: 'back',
    z1: {
      tshirt:      p(34,   33,   34.5, 23   ),
      long_sleeve: p(35,   33,   35,   22.5 ),
      sweatshirt:  p(35.5, 32.5, 36,   22   ),
      hoodie:      p(40.5, 33,   35.5, 22.5 ),
    },
    z2: {
      tshirt:      p(26.5, 33,   34.5, 8 ),
      long_sleeve: p(27,   33,   35,   8 ),
      sweatshirt:  p(27.5, 32.5, 36,   8 ),
      hoodie:      p(33,   33,   35.5, 8 ),
    },
  },
}

// ── placement × bodyType → オーバーレイ位置（patternId なし用）──
const PLACEMENT_POS: Record<'front' | 'one_point' | 'back', Record<BodyType, OverlayPos>> = {
  front: {
    tshirt:      { top: '27%', left: '22%', width: '56%', aspectRatio: '1/1' },
    long_sleeve: { top: '27%', left: '22%', width: '56%', aspectRatio: '1/1' },
    sweatshirt:  { top: '30%', left: '22%', width: '56%', aspectRatio: '1/1' },
    hoodie:      { top: '40%', left: '22%', width: '56%', aspectRatio: '1/1' },
  },
  one_point: {
    tshirt:      { top: '31%',   left: '58%',   width: '6%',   height: '6%'   },
    long_sleeve: { top: '31.5%', left: '57%',   width: '6%',   height: '6%'   },
    sweatshirt:  { top: '29.5%', left: '57.5%', width: '6.5%', height: '6.5%' },
    hoodie:      { top: '34%',   left: '57%',   width: '6.5%', height: '6.5%' },
  },
  back: {
    tshirt:      { top: '26%', left: '22%', width: '56%', aspectRatio: '1/1' },
    long_sleeve: { top: '26%', left: '22%', width: '56%', aspectRatio: '1/1' },
    sweatshirt:  { top: '28%', left: '22%', width: '56%', aspectRatio: '1/1' },
    hoodie:      { top: '30%', left: '22%', width: '56%', aspectRatio: '1/1' },
  },
}

// ── テキストゾーンレンダラー ──────────────────────────────────────
function TextZone({
  pos, textValue, textFont, textColor, textOutline, outlineColor, logoUrl,
}: {
  pos: OverlayPos
  textValue?: string
  textFont?: string
  textColor?: string
  textOutline?: boolean
  outlineColor?: string
  logoUrl?: string | null
}) {
  // ロゴ表示モード
  if (logoUrl) {
    return (
      <div style={toStyle(pos)} className="pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
      </div>
    )
  }

  if (!textValue) {
    return (
      <div style={toStyle(pos)} className="border-2 border-dashed border-green-500 rounded-sm bg-green-100/20 pointer-events-none" />
    )
  }
  const lines = textValue.split('\n').filter((_, i) => i < 2)
  const isMultiLine = lines.length > 1
  // 2行のときはフォントを小さくしてゾーンに収める
  const fs = isMultiLine ? 'min(38cqh, 22cqw)' : 'min(62cqh, 28cqw)'

  return (
    <div
      style={toStyle(pos)}
      className="flex flex-col items-center justify-center overflow-hidden pointer-events-none [container-type:size] gap-0"
    >
      {lines.map((line, i) => (
        <span
          key={i}
          className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full [paint-order:stroke_fill]"
          style={{
            fontSize: fs,
            lineHeight: 1.25,
            fontFamily: FONT_FAMILY[textFont ?? 'gothic'] ?? 'sans-serif',
            color: textColor ?? '#000000',
            WebkitTextStroke: textOutline ? `0.08em ${outlineColor ?? '#FFFFFF'}` : undefined,
          }}
        >
          {line || ' '}
        </span>
      ))}
    </div>
  )
}

function getMockupSrc(bodyType: BodyType, color: ProductColor, side: Side): string {
  return `/design-cards/${bodyType}_${color}_${side}.png`
}

function toStyle(pos: OverlayPos): CSSProperties {
  return {
    position: 'absolute',
    top:         pos.top,
    left:        pos.left,
    width:       pos.width,
    height:      pos.height,
    aspectRatio: pos.aspectRatio ?? (pos.height ? undefined : '1/1'),
  }
}

export function ProductMockup({
  bodyType,
  color,
  designUrl,
  placement = 'front',
  patternId,
  className = '',
  showFrame = false,
  textValue,
  textFont,
  textColor,
  textOutline,
  outlineColor,
  textZoneLogoUrl,
}: Props) {
  const pl = placement as 'front' | 'one_point' | 'back'

  let side: Side = pl === 'back' ? 'back' : 'front'
  let pos: OverlayPos
  let pos2: OverlayPos | undefined
  let textOnly = false
  let logoZone = false

  if (patternId && PATTERN_POS[patternId]) {
    const pp  = PATTERN_POS[patternId]
    side      = pp.side
    pos       = pp.z1[bodyType]
    pos2      = pp.z2?.[bodyType]
    textOnly  = pp.textOnly ?? false
    logoZone  = pp.logoZone ?? false
  } else {
    pos = PLACEMENT_POS[pl][bodyType]
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

      {/* デザインオーバーレイ（z1） */}
      {textOnly && !logoZone ? (
        /* テキストゾーン：ロゴ or テキスト or 点線枠 */
        <TextZone
          pos={pos}
          textValue={textValue}
          textFont={textFont}
          textColor={textColor}
          textOutline={textOutline}
          outlineColor={outlineColor}
          logoUrl={textZoneLogoUrl}
        />
      ) : textOnly && logoZone ? (
        /* ロゴゾーン（A3）：ロゴ画像 or 青点線枠 */
        designUrl ? (
          <div style={toStyle(pos)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={designUrl} alt="logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div style={toStyle(pos)} className="border-2 border-dashed border-blue-400 rounded-sm bg-blue-50/30" />
        )
      ) : designUrl ? (
        <div style={toStyle(pos)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={designUrl} alt="design" className="w-full h-full object-contain" />
        </div>
      ) : showFrame ? (
        <div style={toStyle(pos)} className="border-2 border-dashed border-blue-400 rounded-sm" />
      ) : null}

      {/* テキストオーバーレイ（z2）— コンボパターンのみ */}
      {pos2 && (
        <TextZone
          pos={pos2}
          textValue={textValue}
          textFont={textFont}
          textColor={textColor}
          textOutline={textOutline}
          outlineColor={outlineColor}
          logoUrl={textZoneLogoUrl}
        />
      )}
    </div>
  )
}
