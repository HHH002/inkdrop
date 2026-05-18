'use client'

import { useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'
import { ProductMockup } from '@/components/design/ProductMockup'

// ── 型定義 ──────────────────────────────────────────────────
type FrontOption = 'none' | 'A' | 'C1' | 'C2' | 'AT1' | 'AT2' | 'AT3' | 'CT1' | 'CT3' | 'CT4'
type BackOption  = 'none' | 'B1' | 'B2' | 'BT1' | 'BT2' | 'BT3' | 'D1' | 'D2' | 'D3' | 'D4'
type FontOption  = 'gothic' | 'square' | 'mincho' | 'handwritten' | 'classic'

// ── 配置データ ───────────────────────────────────────────────
// フロント：デザインのみ
const FRONT_DESIGN: { id: FrontOption; label: string; desc: string }[] = [
  { id: 'none', label: 'なし',                  desc: '配置なし'        },
  { id: 'A',    label: 'A｜ワンポイント',        desc: '左胸・小ロゴ'    },
  { id: 'C1',   label: 'C-1｜フロント スモール', desc: 'フロント中央・小' },
  { id: 'C2',   label: 'C-2｜フロント ビッグ',   desc: 'フロント中央・大' },
]
// フロント：テキストのみ
const FRONT_TEXT: { id: FrontOption; label: string; desc: string }[] = [
  { id: 'AT1', label: 'A.T-1', desc: 'ワンポイント位置テキスト' },
  { id: 'AT2', label: 'A.T-2', desc: '中間位置テキスト'        },
  { id: 'AT3', label: 'A.T-3', desc: '右下位置テキスト'        },
  { id: 'CT1', label: 'C.T-1', desc: 'フロント中央テキスト'    },
]
// フロント：デザイン+テキスト
const FRONT_COMBO: { id: FrontOption; label: string; desc: string }[] = [
  { id: 'CT3', label: 'C.T-3', desc: 'C-2+上テキスト' },
  { id: 'CT4', label: 'C.T-4', desc: 'C-2+下テキスト' },
]

// バック：デザインのみ
const BACK_DESIGN: { id: BackOption; label: string; desc: string }[] = [
  { id: 'none', label: 'なし',               desc: '配置なし'     },
  { id: 'B1',   label: 'B-1｜縦長デザイン', desc: '背面中央・縦長' },
  { id: 'B2',   label: 'B-2｜横長デザイン', desc: '背面中央・横長' },
]
// バック：テキストのみ
const BACK_TEXT: { id: BackOption; label: string; desc: string }[] = [
  { id: 'BT1', label: 'B.T-1', desc: '背面上部テキスト' },
  { id: 'BT2', label: 'B.T-2', desc: '背面中央テキスト' },
  { id: 'BT3', label: 'B.T-3', desc: '背面下部テキスト' },
]
// バック：デザイン+テキスト
const BACK_COMBO: { id: BackOption; label: string; desc: string }[] = [
  { id: 'D1', label: '縦長とテキスト（小）', desc: '縦長デザイン＋小テキスト' },
  { id: 'D2', label: '縦長とテキスト（大）', desc: '縦長デザイン＋大テキスト' },
  { id: 'D3', label: '横長とテキスト（小）', desc: '横長デザイン＋小テキスト' },
  { id: 'D4', label: '横長とテキスト（大）', desc: '横長デザイン＋大テキスト' },
]

const FONT_OPTIONS: { id: FontOption; label: string }[] = [
  { id: 'gothic',      label: 'ゴシック'   },
  { id: 'square',      label: '角ゴシック' },
  { id: 'mincho',      label: '明朝体'     },
  { id: 'handwritten', label: '手書き風'   },
  { id: 'classic',     label: 'クラシック' },
]

const TEXT_COLORS = [
  { hex: '#000000', label: '黒'     },
  { hex: '#FFFFFF', label: '白'     },
  { hex: '#EF4444', label: '赤'     },
  { hex: '#3B82F6', label: '青'     },
  { hex: '#22C55E', label: '緑'     },
  { hex: '#EAB308', label: '黄'     },
  { hex: '#F97316', label: 'オレンジ' },
  { hex: '#A855F7', label: '紫'     },
  { hex: '#6B7280', label: 'グレー'  },
]

// テキストを含むパターン ID セット
const TEXT_IDS = new Set<string>(['AT1','AT2','AT3','CT1','CT3','CT4','BT1','BT2','BT3','D1','D2','D3','D4'])

// ── TシャツSVGプレビュー ─────────────────────────────────────
interface Zone { x: number; y: number; w: number; h: number }

function TshirtSVG({
  side, design, text, textMark, designUrl, designName, bodyType, color,
}: {
  side: 'front' | 'back'
  design?: Zone
  text?: Zone
  textMark?: { x: number; y: number }
  designUrl?: string | null
  designName?: string | null
  bodyType?: BodyType
  color?: ProductColor
}) {
  // 実写モックアップ写真を背景に使用
  const photoSrc = bodyType && color
    ? `/mockups/${bodyType}_${color}_${side}.png`
    : null

  return (
    <svg viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 実写背景 or フォールバックSVG */}
      {photoSrc ? (
        <image href={photoSrc} x="0" y="0" width="100" height="115"
          preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <path d="M18,30 L2,34 L0,54 L18,50 L18,110 L82,110 L82,50 L100,54 L98,34 L82,30 Z"
            fill="#FFFFFF" stroke="#C5C5C5" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="50" cy="28" rx="16" ry="9" fill="#E6E6E6" stroke="#C5C5C5" strokeWidth="1" />
          <path d={side === 'front' ? 'M34,28 C38,40 62,40 66,28 C62,22 38,22 34,28 Z' : 'M34,28 C38,33 62,33 66,28 C62,22 38,22 34,28 Z'} fill="white" />
          <path d={side === 'front' ? 'M34,28 C38,40 62,40 66,28' : 'M34,28 C38,33 62,33 66,28'} stroke="#C5C5C5" strokeWidth="0.8" fill="none" />
          <line x1="0" y1="54" x2="18" y2="50" stroke="#C5C5C5" strokeWidth="0.9" />
          <line x1="100" y1="54" x2="82" y2="50" stroke="#C5C5C5" strokeWidth="0.9" />
          <line x1="18" y1="107" x2="82" y2="107" stroke="#C5C5C5" strokeWidth="0.8" />
          {side === 'back' && !design && !text && !textMark && (
            <text x="50" y="78" textAnchor="middle" fontSize="7" fill="#C5C5C5" fontFamily="sans-serif" letterSpacing="1">BACK</text>
          )}
        </>
      )}

      {/* デザインエリア */}
      {design && !designUrl && (
        <rect x={design.x} y={design.y} width={design.w} height={design.h}
          fill="rgba(34,197,94,0.28)" stroke="#16A34A" strokeWidth="1.1" rx="2" />
      )}
      {design && designUrl && (
        <>
          <image href={designUrl} x={design.x} y={design.y} width={design.w} height={design.h}
            preserveAspectRatio="xMidYMid meet" />
          <rect x={design.x} y={design.y} width={design.w} height={design.h}
            fill="none" stroke="#16A34A" strokeWidth="0.8" rx="2" />
        </>
      )}

      {/* テキストエリア */}
      {text && (
        <>
          <rect x={text.x} y={text.y} width={text.w} height={text.h}
            fill="rgba(34,197,94,0.18)" stroke="#16A34A" strokeWidth="0.9" rx="1" strokeDasharray="3,2" />
          <text x={text.x + text.w / 2} y={text.y + text.h / 2 + 2}
            textAnchor="middle" fontSize="4" fontWeight="700" fill="#16A34A" fontFamily="sans-serif">
            {designName ? designName.slice(0, 14) : 'TEXT'}
          </text>
        </>
      )}

      {/* テキストマーク（テキストのみパターン） */}
      {textMark && (
        <>
          <rect x={textMark.x - 18} y={textMark.y - 4} width="36" height="8"
            fill="rgba(34,197,94,0.18)" stroke="#16A34A" strokeWidth="0.9" rx="1" strokeDasharray="3,2" />
          <text x={textMark.x} y={textMark.y + 1}
            textAnchor="middle" fontSize="4" fontWeight="700" fill="#16A34A" fontFamily="sans-serif">
            {designName ? designName.slice(0, 14) : 'TEXT'}
          </text>
        </>
      )}
    </svg>
  )
}

function getTshirtProps(id: string): Parameters<typeof TshirtSVG>[0] {
  switch (id) {
    // フロント デザイン
    case 'none':      return { side: 'front' }
    case 'A':         return { side: 'front', design: { x: 22, y: 50, w: 16, h: 16 } }
    case 'C1':        return { side: 'front', design: { x: 34, y: 54, w: 32, h: 24 } }
    case 'C2':        return { side: 'front', design: { x: 18, y: 48, w: 64, h: 36 } }
    // フロント テキスト
    case 'AT1':       return { side: 'front', textMark: { x: 30, y: 56 } }
    case 'AT2':       return { side: 'front', textMark: { x: 66, y: 72 } }
    case 'AT3':       return { side: 'front', textMark: { x: 68, y: 88 } }
    case 'CT1':       return { side: 'front', textMark: { x: 50, y: 74 } }
    // フロント デザイン+テキスト
    case 'CT3':       return { side: 'front', text: { x: 18, y: 46, w: 64, h: 8 }, design: { x: 18, y: 56, w: 64, h: 34 } }
    case 'CT4':       return { side: 'front', design: { x: 18, y: 46, w: 64, h: 34 }, text: { x: 18, y: 82, w: 64, h: 8 } }
    // バック デザイン
    case 'none-back': return { side: 'back' }
    case 'B1':        return { side: 'back',  design: { x: 39, y: 42, w: 22, h: 54 } }
    case 'B2':        return { side: 'back',  design: { x: 18, y: 62, w: 64, h: 26 } }
    // バック テキスト
    case 'BT1':       return { side: 'back',  textMark: { x: 50, y: 50 } }
    case 'BT2':       return { side: 'back',  textMark: { x: 50, y: 70 } }
    case 'BT3':       return { side: 'back',  textMark: { x: 50, y: 90 } }
    // バック デザイン+テキスト
    case 'D1':        return { side: 'back',  design: { x: 39, y: 40, w: 22, h: 48 }, text: { x: 18, y: 92, w: 64, h: 10 } }
    case 'D2':        return { side: 'back',  design: { x: 39, y: 38, w: 22, h: 46 }, text: { x: 14, y: 88, w: 72, h: 14 } }
    case 'D3':        return { side: 'back',  design: { x: 18, y: 56, w: 64, h: 24 }, text: { x: 28, y: 84, w: 44, h: 10 } }
    case 'D4':        return { side: 'back',  design: { x: 18, y: 54, w: 64, h: 24 }, text: { x: 14, y: 82, w: 72, h: 14 } }
    default:          return { side: 'front' }
  }
}

// ── 配置カード ────────────────────────────────────────────────
function PlacementCard({
  svgId, label, desc, isSelected, onClick, designUrl, designName, bodyType, color,
}: {
  svgId: string; label: string; desc: string; isSelected: boolean; onClick: () => void
  designUrl?: string | null; designName?: string | null
  bodyType?: BodyType; color?: ProductColor
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center p-1.5 rounded-xl border-2 transition-colors bg-white text-left w-full ${
        isSelected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200 active:bg-gray-50'
      }`}
    >
      <div className="w-full aspect-square mb-1">
        <TshirtSVG {...getTshirtProps(svgId)} designUrl={designUrl} designName={designName} bodyType={bodyType} color={color} />
      </div>
      <p className={`w-full text-[9px] font-semibold leading-tight ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
        {label}
      </p>
      {isSelected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  )
}

// ── ステップバー ──────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ['アイテム選択', '配置選択', 'デザイン編集', '確認・注文']
  return (
    <div className="flex items-start px-5 py-3">
      {steps.map((label, i) => {
        const idx = i + 1
        const isActive = idx === current
        const isDone   = idx < current
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                isActive ? 'border-blue-500 bg-blue-500 text-white'
                : isDone  ? 'border-blue-300 bg-blue-50 text-blue-400'
                :           'border-gray-200 bg-white text-gray-400'
              }`}>{idx}</div>
              <span className={`mt-1 text-[9px] font-medium text-center leading-tight ${
                isActive ? 'text-blue-600' : isDone ? 'text-blue-300' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-0.5 ${isDone ? 'bg-blue-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SubLabel({ label }: { label: string }) {
  return <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4 first:mt-0">{label}</p>
}

function ColorPicker({ colors, selected, onSelect }: {
  colors: { hex: string; label: string }[]
  selected: string
  onSelect: (hex: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map(c => (
        <button
          key={c.hex}
          onClick={() => onSelect(c.hex)}
          title={c.label}
          className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
            selected === c.hex ? 'border-blue-500 scale-110 shadow-md' : 'border-gray-200'
          } ${c.hex === '#FFFFFF' ? 'shadow-sm' : ''}`}
          style={{ backgroundColor: c.hex }}
        >
          {selected === c.hex && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1.5"
                stroke={c.hex === '#FFFFFF' || c.hex === '#EAB308' ? '#374151' : 'white'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────
export default function PlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()
  const sp      = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const bodyType       = sp.get('body_type')    as BodyType
  const color          = sp.get('color')         as ProductColor
  const size           = sp.get('size')          as Size
  const designImageUrl = sp.get('image_url')    ?? null
  const designName     = sp.get('design_name')  ?? null

  // ── 選択状態 ──
  const [selectedFront, setSelectedFront] = useState<FrontOption>('none')
  const [selectedBack,  setSelectedBack]  = useState<BackOption>('none')
  const [textValue,     setTextValue]     = useState(designName ?? '')
  const [selectedFont,  setSelectedFont]  = useState<FontOption>('gothic')
  const [textOutline,   setTextOutline]   = useState(false)
  const [textColor,     setTextColor]     = useState('#000000')
  const [outlineColor,  setOutlineColor]  = useState('#FFFFFF')
  const [myLogoImage,   setMyLogoImage]   = useState<string | null>(null)

  // ── 派生状態 ──
  const hasPrintSelection = selectedFront !== 'none' || selectedBack !== 'none'
  const hasTextSetting    = TEXT_IDS.has(selectedFront) || TEXT_IDS.has(selectedBack)

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMyLogoImage(URL.createObjectURL(file))
  }

  // ── 進む ──
  function handleProceed() {
    if (!hasPrintSelection) return
    const placementMap: Record<string, { placement: string; print_size: string }> = {
      A:   { placement: 'one_point', print_size: 'small'  },
      C1:  { placement: 'front',     print_size: 'medium' },
      C2:  { placement: 'front',     print_size: 'large'  },
      AT1: { placement: 'one_point', print_size: 'small'  },
      AT2: { placement: 'front',     print_size: 'small'  },
      AT3: { placement: 'front',     print_size: 'small'  },
      CT1: { placement: 'front',     print_size: 'medium' },
      CT3: { placement: 'front',     print_size: 'large'  },
      CT4: { placement: 'front',     print_size: 'large'  },
      B1:  { placement: 'back',      print_size: 'large'  },
      B2:  { placement: 'back',      print_size: 'medium' },
      BT1: { placement: 'back',      print_size: 'small'  },
      BT2: { placement: 'back',      print_size: 'medium' },
      BT3: { placement: 'back',      print_size: 'small'  },
      D1:  { placement: 'back',      print_size: 'large'  },
      D2:  { placement: 'back',      print_size: 'large'  },
      D3:  { placement: 'back',      print_size: 'medium' },
      D4:  { placement: 'back',      print_size: 'medium' },
    }
    const primary = placementMap[selectedFront] ?? placementMap[selectedBack]
    if (!primary) return

    const p = new URLSearchParams()
    if (bodyType) p.set('body_type',  bodyType)
    if (color)    p.set('color',      color)
    if (size)     p.set('size',       size)
    p.set('placement',  primary.placement)
    p.set('print_size', primary.print_size)
    const patternId = selectedFront !== 'none' ? selectedFront : selectedBack
    if (patternId !== 'none') p.set('pattern_id', patternId)
    if (designImageUrl) p.set('image_url', designImageUrl)
    if (hasTextSetting && textValue) {
      p.set('text',          textValue)
      p.set('font',          selectedFont)
      p.set('text_color',    textColor)
      p.set('text_outline',  textOutline ? 'yes' : 'no')
      p.set('outline_color', outlineColor)
    }
    router.push(`/designs/${id}/preview?${p.toString()}`)
  }

  // ── ライブプレビュー用ラベル ──
  const allPatterns = [
    ...FRONT_DESIGN, ...FRONT_TEXT, ...FRONT_COMBO,
    ...BACK_DESIGN,  ...BACK_TEXT,  ...BACK_COMBO,
  ] as { id: string; label: string }[]
  const activeLabel = selectedFront !== 'none'
    ? (allPatterns.find(p => p.id === selectedFront)?.label ?? '')
    : selectedBack !== 'none'
      ? (allPatterns.find(p => p.id === selectedBack)?.label ?? '')
      : 'パターンを選択してください'

  return (
    <div className="min-h-dvh bg-gray-50 pb-32">

      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-2 gap-1">
          <button onClick={() => router.back()} className="p-2 text-gray-500">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-gray-900">オリジナルTシャツを作る</h1>
        </div>
        <StepBar current={2} />
      </header>

      {/* ── ライブプレビュー ── */}
      {designImageUrl && bodyType && color && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <ProductMockup
              bodyType={bodyType}
              color={color}
              designUrl={designImageUrl}
              placement={
                selectedFront !== 'none' ? (selectedFront === 'A' ? 'one_point' : 'front')
                : selectedBack !== 'none' ? 'back'
                : 'front'
              }
              patternId={
                selectedFront !== 'none' ? selectedFront
                : selectedBack !== 'none' ? selectedBack
                : undefined
              }
              className="aspect-square"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-lg backdrop-blur-sm">
              {activeLabel}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-5 space-y-6">

        {/* ════ フロント ════ */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">フロント</h2>

          <SubLabel label="デザイン" />
          <div className="grid grid-cols-4 gap-2">
            {FRONT_DESIGN.map(opt => (
              <PlacementCard key={opt.id} svgId={opt.id} label={opt.label} desc={opt.desc}
                isSelected={selectedFront === opt.id}
                onClick={() => setSelectedFront(opt.id)}
                designUrl={designImageUrl} designName={designName} bodyType={bodyType} color={color} />
            ))}
          </div>

          <SubLabel label="テキスト" />
          <div className="grid grid-cols-4 gap-2">
            {FRONT_TEXT.map(opt => (
              <PlacementCard key={opt.id} svgId={opt.id} label={opt.label} desc={opt.desc}
                isSelected={selectedFront === opt.id}
                onClick={() => setSelectedFront(selectedFront === opt.id ? 'none' : opt.id)}
                designUrl={designImageUrl} designName={designName} bodyType={bodyType} color={color} />
            ))}
          </div>

          <SubLabel label="デザイン + テキスト" />
          <div className="grid grid-cols-4 gap-2">
            {FRONT_COMBO.map(opt => (
              <PlacementCard key={opt.id} svgId={opt.id} label={opt.label} desc={opt.desc}
                isSelected={selectedFront === opt.id}
                onClick={() => setSelectedFront(selectedFront === opt.id ? 'none' : opt.id)}
                designUrl={designImageUrl} designName={designName} bodyType={bodyType} color={color} />
            ))}
          </div>
        </section>

        {/* ════ 区切り ════ */}
        <div className="border-t-2 border-gray-900" />

        {/* ════ バック ════ */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">バック</h2>

          <SubLabel label="デザイン" />
          <div className="grid grid-cols-4 gap-2">
            {BACK_DESIGN.map(opt => (
              <PlacementCard key={opt.id} svgId={opt.id === 'none' ? 'none-back' : opt.id}
                label={opt.label} desc={opt.desc}
                isSelected={selectedBack === opt.id}
                onClick={() => setSelectedBack(opt.id)}
                designUrl={designImageUrl} designName={designName} bodyType={bodyType} color={color} />
            ))}
          </div>

          <SubLabel label="テキスト" />
          <div className="grid grid-cols-4 gap-2">
            {BACK_TEXT.map(opt => (
              <PlacementCard key={opt.id} svgId={opt.id} label={opt.label} desc={opt.desc}
                isSelected={selectedBack === opt.id}
                onClick={() => setSelectedBack(selectedBack === opt.id ? 'none' : opt.id)}
                designUrl={designImageUrl} designName={designName} bodyType={bodyType} color={color} />
            ))}
          </div>

          <SubLabel label="デザイン + テキスト" />
          <div className="grid grid-cols-4 gap-2">
            {BACK_COMBO.map(opt => (
              <PlacementCard key={opt.id} svgId={opt.id} label={opt.label} desc={opt.desc}
                isSelected={selectedBack === opt.id}
                onClick={() => setSelectedBack(selectedBack === opt.id ? 'none' : opt.id)}
                designUrl={designImageUrl} designName={designName} bodyType={bodyType} color={color} />
            ))}
          </div>
        </section>

        {/* ── テキスト設定（テキスト含むパターン選択時） ── */}
        {hasTextSetting && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">テキスト設定</p>
            </div>

            <div className="px-4 pt-4 pb-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={textValue}
                  onChange={e => setTextValue(e.target.value.slice(0, 20))}
                  placeholder="TEXTを入力してください"
                  className="w-full px-4 py-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
                  {textValue.length}/20
                </span>
              </div>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">フォント</p>
              <div className="grid grid-cols-3 gap-2">
                {FONT_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setSelectedFont(f.id)}
                    className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                      selectedFont === f.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">文字のふち</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: false, l: 'なし' }, { v: true, l: 'あり' }].map(o => (
                  <button key={String(o.v)} onClick={() => setTextOutline(o.v)}
                    className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                      textOutline === o.v
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}>{o.l}</button>
                ))}
              </div>
            </div>

            <div className={`px-4 py-4 ${textOutline ? 'border-b border-gray-100' : ''}`}>
              <p className="text-xs font-semibold text-gray-500 mb-2.5">テキストカラー</p>
              <ColorPicker colors={TEXT_COLORS} selected={textColor} onSelect={setTextColor} />
            </div>

            {textOutline && (
              <div className="px-4 py-4">
                <p className="text-xs font-semibold text-gray-500 mb-2.5">ふちカラー</p>
                <ColorPicker colors={TEXT_COLORS} selected={outlineColor} onSelect={setOutlineColor} />
              </div>
            )}
          </section>
        )}

        {/* ── マイロゴ追加 ── */}
        {hasTextSetting && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">マイロゴ追加</p>
            </div>
            <div className="px-4 py-4 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                写真やロゴ画像を読み込むと、AIがフラットな2Dデザインに変換してプリント用デザインとして表示します。
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <ImagePlus size={18} className="text-gray-400" />
                写真を読み込む
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
              <p className="text-[11px] text-gray-400 text-center">AIが2Dのデザインに変換します</p>
              {myLogoImage && (
                <div className="relative mt-2">
                  <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={myLogoImage} alt="マイロゴ" className="w-full h-full object-contain" />
                  </div>
                  <button onClick={() => setMyLogoImage(null)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── 固定下部ボタン ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-4 z-50">
        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 bg-white">
            戻る
          </button>
          <button
            onClick={handleProceed}
            disabled={!hasPrintSelection}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              hasPrintSelection
                ? 'bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            プレビュー確認へ進む
          </button>
        </div>
      </div>
    </div>
  )
}
