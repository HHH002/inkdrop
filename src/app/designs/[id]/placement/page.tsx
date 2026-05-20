'use client'

import { useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ImagePlus, Check } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'
import { ProductMockup } from '@/components/design/ProductMockup'

// ── 型定義 ───────────────────────────────────────────────────
type FrontOption = 'none' | 'A' | 'C1' | 'C2' | 'AT1' | 'AT2' | 'AT3' | 'CT1' | 'CT3' | 'CT4'
type BackOption  = 'none' | 'B1' | 'B2' | 'BT1' | 'BT2' | 'BT3' | 'D1' | 'D2' | 'D3' | 'D4'
type FontOption  = 'gothic' | 'square' | 'mincho' | 'handwritten' | 'classic'

// ── 配置データ ───────────────────────────────────────────────
const FRONT_DESIGN: { id: FrontOption; code: string; label: string }[] = [
  { id: 'none', code: 'なし',   label: '配置なし'         },
  { id: 'A',    code: 'A',      label: 'ワンポイント'      },
  { id: 'C1',   code: 'C-1',    label: 'フロント スモール' },
  { id: 'C2',   code: 'C-2',    label: 'フロント ビッグ'  },
]
const FRONT_TEXT: { id: FrontOption; code: string; label: string }[] = [
  { id: 'AT1', code: 'A.T-1', label: 'ワンポイント位置' },
  { id: 'AT2', code: 'A.T-2', label: '中間位置'        },
  { id: 'AT3', code: 'A.T-3', label: '右下位置'        },
  { id: 'CT1', code: 'C.T-1', label: 'フロント中央'    },
]
const FRONT_COMBO: { id: FrontOption; code: string; label: string }[] = [
  { id: 'CT3', code: 'C.T-3', label: 'C-2＋テキスト上' },
  { id: 'CT4', code: 'C.T-4', label: 'C-2＋テキスト下' },
]

const BACK_DESIGN: { id: BackOption; code: string; label: string }[] = [
  { id: 'none', code: 'なし', label: '配置なし'     },
  { id: 'B1',   code: 'B-1', label: 'バック 縦長'  },
  { id: 'B2',   code: 'B-2', label: 'バック 横長'  },
]
const BACK_TEXT: { id: BackOption; code: string; label: string }[] = [
  { id: 'BT1', code: 'B.T-1', label: '背面 上部テキスト' },
  { id: 'BT2', code: 'B.T-2', label: '背面 中央テキスト' },
  { id: 'BT3', code: 'B.T-3', label: '背面 下部テキスト' },
]
const BACK_COMBO: { id: BackOption; code: string; label: string }[] = [
  { id: 'D1', code: 'D-1', label: '縦長＋テキスト 小' },
  { id: 'D2', code: 'D-2', label: '縦長＋テキスト 大' },
  { id: 'D3', code: 'D-3', label: '横長＋テキスト 小' },
  { id: 'D4', code: 'D-4', label: '横長＋テキスト 大' },
]

const FONT_OPTIONS: { id: FontOption; label: string }[] = [
  { id: 'gothic',      label: 'ゴシック'   },
  { id: 'square',      label: '角ゴシック' },
  { id: 'mincho',      label: '明朝体'     },
  { id: 'handwritten', label: '手書き風'   },
  { id: 'classic',     label: 'クラシック' },
]

const TEXT_COLORS = [
  { hex: '#000000', label: '黒'      },
  { hex: '#FFFFFF', label: '白'      },
  { hex: '#EF4444', label: '赤'      },
  { hex: '#3B82F6', label: '青'      },
  { hex: '#22C55E', label: '緑'      },
  { hex: '#EAB308', label: '黄'      },
  { hex: '#F97316', label: 'オレンジ' },
  { hex: '#A855F7', label: '紫'      },
  { hex: '#6B7280', label: 'グレー'  },
]

const TEXT_IDS = new Set<string>(['AT1','AT2','AT3','CT1','CT3','CT4','BT1','BT2','BT3','D1','D2','D3','D4'])

// ── TシャツSVGプレビュー ──────────────────────────────────────
interface Zone { x: number; y: number; w: number; h: number }

function TshirtSVG({
  side, design, text, textMark, designUrl, bodyType, color,
}: {
  side: 'front' | 'back'
  design?: Zone
  text?: Zone
  textMark?: { x: number; y: number }
  designUrl?: string | null
  bodyType?: BodyType
  color?: ProductColor
}) {
  const photoSrc = bodyType && color
    ? `/mockups/${bodyType}_${color}_${side}.png`
    : null

  return (
    <svg viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {photoSrc ? (
        <image href={photoSrc} x="0" y="0" width="100" height="115"
          preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <path d="M18,30 L2,34 L0,54 L18,50 L18,110 L82,110 L82,50 L100,54 L98,34 L82,30 Z"
            fill="#FFFFFF" stroke="#C5C5C5" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="50" cy="28" rx="16" ry="9" fill="#E6E6E6" stroke="#C5C5C5" strokeWidth="1" />
        </>
      )}

      {/* デザインエリア */}
      {design && !designUrl && (
        <rect x={design.x} y={design.y} width={design.w} height={design.h}
          fill="rgba(34,197,94,0.3)" stroke="#16A34A" strokeWidth="1.2" rx="2" />
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
            fill="rgba(34,197,94,0.2)" stroke="#16A34A" strokeWidth="0.9" rx="1" strokeDasharray="3,2" />
          <text x={text.x + text.w / 2} y={text.y + text.h / 2 + 2}
            textAnchor="middle" fontSize="4" fontWeight="700" fill="#16A34A" fontFamily="sans-serif">
            TEXT
          </text>
        </>
      )}

      {textMark && (
        <>
          <rect x={textMark.x - 18} y={textMark.y - 4} width="36" height="8"
            fill="rgba(34,197,94,0.2)" stroke="#16A34A" strokeWidth="0.9" rx="1" strokeDasharray="3,2" />
          <text x={textMark.x} y={textMark.y + 1.5}
            textAnchor="middle" fontSize="4" fontWeight="700" fill="#16A34A" fontFamily="sans-serif">
            TEXT
          </text>
        </>
      )}
    </svg>
  )
}

function getTshirtProps(id: string): Parameters<typeof TshirtSVG>[0] {
  switch (id) {
    case 'none':      return { side: 'front' }
    case 'A':         return { side: 'front', design: { x: 62, y: 50, w: 16, h: 16 } }
    case 'C1':        return { side: 'front', design: { x: 34, y: 54, w: 32, h: 24 } }
    case 'C2':        return { side: 'front', design: { x: 18, y: 48, w: 64, h: 36 } }
    case 'AT1':       return { side: 'front', textMark: { x: 30, y: 56 } }
    case 'AT2':       return { side: 'front', textMark: { x: 50, y: 72 } }
    case 'AT3':       return { side: 'front', textMark: { x: 68, y: 88 } }
    case 'CT1':       return { side: 'front', textMark: { x: 50, y: 74 } }
    case 'CT3':       return { side: 'front', text: { x: 18, y: 46, w: 64, h: 8 }, design: { x: 18, y: 56, w: 64, h: 34 } }
    case 'CT4':       return { side: 'front', design: { x: 18, y: 46, w: 64, h: 34 }, text: { x: 18, y: 82, w: 64, h: 8 } }
    case 'none-back': return { side: 'back' }
    case 'B1':        return { side: 'back',  design: { x: 36, y: 30, w: 28, h: 66 } }
    case 'B2':        return { side: 'back',  design: { x: 18, y: 50, w: 64, h: 36 } }
    case 'BT1':       return { side: 'back',  textMark: { x: 50, y: 50 } }
    case 'BT2':       return { side: 'back',  textMark: { x: 50, y: 70 } }
    case 'BT3':       return { side: 'back',  textMark: { x: 50, y: 90 } }
    case 'D1':        return { side: 'back',  design: { x: 39, y: 30, w: 22, h: 54 }, text: { x: 18, y: 88, w: 64, h: 10 } }
    case 'D2':        return { side: 'back',  design: { x: 36, y: 28, w: 28, h: 52 }, text: { x: 14, y: 84, w: 72, h: 14 } }
    case 'D3':        return { side: 'back',  text: { x: 18, y: 38, w: 64, h: 10 }, design: { x: 18, y: 50, w: 64, h: 36 } }
    case 'D4':        return { side: 'back',  design: { x: 18, y: 50, w: 64, h: 36 }, text: { x: 14, y: 90, w: 72, h: 14 } }
    default:          return { side: 'front' }
  }
}

// ── 配置カード（2列・大型） ───────────────────────────────────
function PlacementCard({
  svgId, code, label, isSelected, onClick, designUrl, bodyType, color,
}: {
  svgId: string
  code: string
  label: string
  isSelected: boolean
  onClick: () => void
  designUrl?: string | null
  bodyType?: BodyType
  color?: ProductColor
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all text-left w-full bg-white ${
        isSelected
          ? 'border-black shadow-md'
          : 'border-gray-200 active:border-gray-400'
      }`}
    >
      {/* プレビューエリア */}
      <div className="w-full aspect-[4/5] bg-white overflow-hidden">
        <TshirtSVG
          {...getTshirtProps(svgId)}
          designUrl={designUrl}
          bodyType={bodyType}
          color={color}
        />
      </div>

      {/* ラベルエリア */}
      <div className={`px-3 py-2.5 border-t-2 transition-colors ${
        isSelected ? 'border-black bg-black' : 'border-gray-200 bg-white'
      }`}>
        <p className={`text-sm font-black leading-none tracking-tight ${
          isSelected ? 'text-white' : 'text-gray-900'
        }`}>
          {code}
        </p>
        <p className={`text-[10px] font-medium mt-1 leading-tight ${
          isSelected ? 'text-gray-300' : 'text-gray-500'
        }`}>
          / {label}
        </p>
      </div>

      {/* 選択チェック */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center shadow-sm">
          <Check size={13} strokeWidth={3} className="text-white" />
        </div>
      )}
    </button>
  )
}

// ── ステップバー ──────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ['アイテム', '配置', '確認・注文']
  return (
    <div className="flex items-center px-5 py-3 gap-0">
      {steps.map((label, i) => {
        const idx = i + 1
        const isActive = idx === current
        const isDone   = idx < current
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                isActive ? 'border-black bg-black text-white'
                : isDone  ? 'border-gray-400 bg-gray-100 text-gray-400'
                :           'border-gray-200 bg-white text-gray-300'
              }`}>
                {isDone ? <Check size={10} strokeWidth={3} /> : idx}
              </div>
              <span className={`mt-1 text-[9px] font-semibold text-center ${
                isActive ? 'text-black' : isDone ? 'text-gray-400' : 'text-gray-300'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1.5 ${isDone ? 'bg-gray-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── セクションヘッダー ────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
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
            selected === c.hex ? 'border-black scale-110 shadow-md' : 'border-gray-200'
          } ${c.hex === '#FFFFFF' ? 'shadow-sm' : ''}`}
          style={{ backgroundColor: c.hex }}
        >
          {selected === c.hex && (
            <Check
              size={12}
              strokeWidth={3}
              className={c.hex === '#FFFFFF' || c.hex === '#EAB308' ? 'text-gray-800' : 'text-white'}
            />
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

  const bodyType       = sp.get('body_type')   as BodyType
  const color          = sp.get('color')        as ProductColor
  const size           = sp.get('size')         as Size
  const designImageUrl = sp.get('image_url')   ?? null
  const designName     = sp.get('design_name') ?? null

  const [selectedFront, setSelectedFront] = useState<FrontOption>('none')
  const [selectedBack,  setSelectedBack]  = useState<BackOption>('none')
  const [textValue,     setTextValue]     = useState(designName ?? '')
  const [selectedFont,  setSelectedFont]  = useState<FontOption>('gothic')
  const [textOutline,   setTextOutline]   = useState(false)
  const [textColor,     setTextColor]     = useState('#000000')
  const [outlineColor,  setOutlineColor]  = useState('#FFFFFF')
  const [myLogoImage,   setMyLogoImage]   = useState<string | null>(null)
  const [activeTab,     setActiveTab]     = useState<'front' | 'back'>('front')

  const hasPrintSelection = selectedFront !== 'none' || selectedBack !== 'none'
  const hasTextSetting    = TEXT_IDS.has(selectedFront) || TEXT_IDS.has(selectedBack)

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMyLogoImage(URL.createObjectURL(file))
  }

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

  // ライブプレビュー用
  const activePlacement: 'front' | 'one_point' | 'back' =
    selectedFront === 'A' ? 'one_point' :
    selectedFront !== 'none' ? 'front' :
    selectedBack !== 'none' ? 'back' : 'front'
  const activePatternId =
    selectedFront !== 'none' ? selectedFront :
    selectedBack !== 'none' ? selectedBack : undefined

  return (
    <div className="min-h-dvh bg-white pb-32">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-2 gap-1">
          <button onClick={() => router.back()} className="p-2 text-gray-500">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-gray-900">配置を選ぶ</h1>
        </div>
        <StepBar current={2} />
      </header>

      {/* ライブプレビュー */}
      {designImageUrl && bodyType && color && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <ProductMockup
              bodyType={bodyType}
              color={color}
              designUrl={designImageUrl}
              placement={activePlacement}
              patternId={activePatternId}
              className="aspect-square"
            />
          </div>
          {hasPrintSelection && (
            <p className="text-center text-[11px] text-gray-400 font-medium mt-2">
              {selectedFront !== 'none'
                ? [...FRONT_DESIGN, ...FRONT_TEXT, ...FRONT_COMBO].find(o => o.id === selectedFront)?.code ?? ''
                : [...BACK_DESIGN, ...BACK_TEXT, ...BACK_COMBO].find(o => o.id === selectedBack)?.code ?? ''}
              {' '}
              {selectedFront !== 'none'
                ? [...FRONT_DESIGN, ...FRONT_TEXT, ...FRONT_COMBO].find(o => o.id === selectedFront)?.label ?? ''
                : [...BACK_DESIGN, ...BACK_TEXT, ...BACK_COMBO].find(o => o.id === selectedBack)?.label ?? ''}
            </p>
          )}
        </div>
      )}

      {/* フロント / バック タブ */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-white rounded-2xl p-1 border border-gray-200">
          {(['front', 'back'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab === 'front' ? 'フロント' : 'バック'}
              {tab === 'front' && selectedFront !== 'none' && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-white/20 rounded-full text-[9px]">✓</span>
              )}
              {tab === 'back' && selectedBack !== 'none' && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-white/20 rounded-full text-[9px]">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">

        {/* ════ フロントタブ ════ */}
        {activeTab === 'front' && (
          <>
            <section>
              <SectionHeader label="デザイン" />
              <div className="grid grid-cols-2 gap-3">
                {FRONT_DESIGN.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    code={opt.code}
                    label={opt.label}
                    isSelected={selectedFront === opt.id}
                    onClick={() => setSelectedFront(opt.id)}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader label="テキスト" />
              <div className="grid grid-cols-2 gap-3">
                {FRONT_TEXT.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    code={opt.code}
                    label={opt.label}
                    isSelected={selectedFront === opt.id}
                    onClick={() => setSelectedFront(selectedFront === opt.id ? 'none' : opt.id)}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader label="デザイン ＋ テキスト" />
              <div className="grid grid-cols-2 gap-3">
                {FRONT_COMBO.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    code={opt.code}
                    label={opt.label}
                    isSelected={selectedFront === opt.id}
                    onClick={() => setSelectedFront(selectedFront === opt.id ? 'none' : opt.id)}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ════ バックタブ ════ */}
        {activeTab === 'back' && (
          <>
            <section>
              <SectionHeader label="デザイン" />
              <div className="grid grid-cols-2 gap-3">
                {BACK_DESIGN.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id === 'none' ? 'none-back' : opt.id}
                    code={opt.code}
                    label={opt.label}
                    isSelected={selectedBack === opt.id}
                    onClick={() => setSelectedBack(opt.id)}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader label="テキスト" />
              <div className="grid grid-cols-2 gap-3">
                {BACK_TEXT.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    code={opt.code}
                    label={opt.label}
                    isSelected={selectedBack === opt.id}
                    onClick={() => setSelectedBack(selectedBack === opt.id ? 'none' : opt.id)}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader label="デザイン ＋ テキスト" />
              <div className="grid grid-cols-2 gap-3">
                {BACK_COMBO.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    code={opt.code}
                    label={opt.label}
                    isSelected={selectedBack === opt.id}
                    onClick={() => setSelectedBack(selectedBack === opt.id ? 'none' : opt.id)}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* テキスト設定 */}
        {hasTextSetting && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-black text-gray-900">テキスト設定</p>
            </div>

            <div className="px-4 pt-4 pb-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={textValue}
                  onChange={e => setTextValue(e.target.value.slice(0, 20))}
                  placeholder="テキストを入力"
                  className="w-full px-4 py-3 pr-14 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
                  {textValue.length}/20
                </span>
              </div>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-3">フォント</p>
              <div className="grid grid-cols-3 gap-2">
                {FONT_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setSelectedFont(f.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedFont === f.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-3">文字のふち</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: false, l: 'なし' }, { v: true, l: 'あり' }].map(o => (
                  <button key={String(o.v)} onClick={() => setTextOutline(o.v)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      textOutline === o.v
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}>{o.l}</button>
                ))}
              </div>
            </div>

            <div className={`px-4 py-4 ${textOutline ? 'border-b border-gray-100' : ''}`}>
              <p className="text-xs font-bold text-gray-500 mb-3">テキストカラー</p>
              <ColorPicker colors={TEXT_COLORS} selected={textColor} onSelect={setTextColor} />
            </div>

            {textOutline && (
              <div className="px-4 py-4">
                <p className="text-xs font-bold text-gray-500 mb-3">ふちカラー</p>
                <ColorPicker colors={TEXT_COLORS} selected={outlineColor} onSelect={setOutlineColor} />
              </div>
            )}
          </section>
        )}

        {/* マイロゴ追加 */}
        {hasTextSetting && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-black text-gray-900">マイロゴ追加</p>
              <p className="text-[11px] text-gray-400 mt-0.5">写真を読み込むとAIが2Dデザインに変換します</p>
            </div>
            <div className="px-4 py-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 bg-white hover:bg-gray-100 transition-colors"
              >
                <ImagePlus size={18} className="text-gray-400" />
                写真を読み込む
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
              {myLogoImage && (
                <div className="relative mt-3">
                  <div className="w-full aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={myLogoImage} alt="マイロゴ" className="w-full h-full object-contain" />
                  </div>
                  <button
                    onClick={() => setMyLogoImage(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* 固定下部ボタン */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-4 z-50">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700 bg-white"
          >
            戻る
          </button>
          <button
            onClick={handleProceed}
            disabled={!hasPrintSelection}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wide transition-all ${
              hasPrintSelection
                ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {hasPrintSelection ? 'プレビューへ進む →' : 'パターンを選択してください'}
          </button>
        </div>
      </div>
    </div>
  )
}
