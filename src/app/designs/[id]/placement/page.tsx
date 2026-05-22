'use client'

import { useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ImagePlus, Check, Loader2 } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'
import { ProductMockup } from '@/components/design/ProductMockup'
import { removeBackground } from '@imgly/background-removal'

// ── 型定義 ───────────────────────────────────────────────────
type FrontOption = 'none' | 'A' | 'A2' | 'A3' | 'C1' | 'C2' | 'C3' | 'AT1' | 'AT2' | 'AT3' | 'CT1' | 'F1' | 'F2'
type BackOption  = 'none' | 'B1' | 'B2' | 'BT1' | 'BT2' | 'BT3' | 'D1' | 'D2' | 'E1' | 'E2'
type FontOption  = 'gothic' | 'square' | 'mincho' | 'handwritten' | 'classic'

// ── 配置データ ───────────────────────────────────────────────
const FRONT_DESIGN: { id: FrontOption; code: string; label: string }[] = [
  { id: 'none', code: 'なし',   label: '配置なし'           },
  { id: 'A',    code: 'A-1',    label: 'ワンポイント'        },
  { id: 'A2',   code: 'A-2',    label: 'ビックワンポイント'  },
  { id: 'A3',   code: 'A-3',    label: 'オリジナルロゴ追加用' },
  { id: 'C1',   code: 'C-1',    label: 'フロント スモール'   },
  { id: 'C2',   code: 'C-2',    label: 'フロント ビッグ'    },
  { id: 'C3',   code: 'C-3',    label: 'フロント 縦長'      },
]
const FRONT_TEXT: { id: FrontOption; code: string; label: string }[] = [
  { id: 'AT1', code: 'A.T-1', label: 'ワンポイント位置' },
  { id: 'AT2', code: 'A.T-2', label: '中間位置'        },
  { id: 'AT3', code: 'A.T-3', label: '右下位置'        },
  { id: 'CT1', code: 'C.T-1', label: 'フロント中央'    },
]
const FRONT_COMBO: { id: FrontOption; code: string; label: string }[] = [
  { id: 'F1', code: 'F-1', label: 'フロント＋テキスト上' },
  { id: 'F2', code: 'F-2', label: 'フロント＋テキスト下' },
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
  { id: 'D1', code: 'D-1', label: '縦長＋テキスト 小'       },
  { id: 'D2', code: 'D-2', label: '縦長＋テキスト 大'       },
  { id: 'E1', code: 'E-1', label: 'バック横長＋テキスト下'  },
  { id: 'E2', code: 'E-2', label: 'バック横長＋テキスト上'  },
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

const TEXT_IDS = new Set<string>(['AT1','AT2','AT3','CT1','F1','F2','BT1','BT2','BT3','D1','D2','E1','E2'])

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
    case 'A2':        return { side: 'front', design: { x: 54, y: 44, w: 28, h: 28 } }
    case 'A3':        return { side: 'front', design: { x: 54, y: 44, w: 28, h: 28 } }
    case 'C1':        return { side: 'front', design: { x: 34, y: 54, w: 32, h: 24 } }
    case 'C2':        return { side: 'front', design: { x: 18, y: 48, w: 64, h: 36 } }
    case 'C3':        return { side: 'front', design: { x: 36, y: 46, w: 28, h: 54 } }
    case 'AT1':       return { side: 'front', textMark: { x: 30, y: 56 } }
    case 'AT2':       return { side: 'front', textMark: { x: 50, y: 72 } }
    case 'AT3':       return { side: 'front', textMark: { x: 68, y: 88 } }
    case 'CT1':       return { side: 'front', textMark: { x: 50, y: 74 } }
    case 'F1':        return { side: 'front', text: { x: 18, y: 46, w: 64, h: 8 }, design: { x: 18, y: 56, w: 64, h: 34 } }
    case 'F2':        return { side: 'front', design: { x: 18, y: 46, w: 64, h: 34 }, text: { x: 18, y: 82, w: 64, h: 8 } }
    case 'none-back': return { side: 'back' }
    case 'B1':        return { side: 'back',  design: { x: 36, y: 30, w: 28, h: 66 } }
    case 'B2':        return { side: 'back',  design: { x: 18, y: 50, w: 64, h: 36 } }
    case 'BT1':       return { side: 'back',  textMark: { x: 50, y: 50 } }
    case 'BT2':       return { side: 'back',  textMark: { x: 50, y: 70 } }
    case 'BT3':       return { side: 'back',  textMark: { x: 50, y: 90 } }
    case 'D1':        return { side: 'back',  design: { x: 39, y: 30, w: 22, h: 54 }, text: { x: 18, y: 88, w: 64, h: 10 } }
    case 'D2':        return { side: 'back',  design: { x: 36, y: 28, w: 28, h: 52 }, text: { x: 14, y: 84, w: 72, h: 14 } }
    case 'E1':        return { side: 'back',  design: { x: 18, y: 50, w: 64, h: 36 }, text: { x: 18, y: 88, w: 64, h: 10 } }
    case 'E2':        return { side: 'back',  text: { x: 18, y: 38, w: 64, h: 10 }, design: { x: 18, y: 50, w: 64, h: 36 } }
    default:          return { side: 'front' }
  }
}

// ── 配置カード（2列・大型） ───────────────────────────────────
function PlacementCard({
  svgId, code, label, isSelected, onClick, designUrl, bodyType, color,
  textValue, textFont, textColor, textOutline, outlineColor, textZoneLogoUrl,
}: {
  svgId: string
  code: string
  label: string
  isSelected: boolean
  onClick: () => void
  designUrl?: string | null
  bodyType?: BodyType
  color?: ProductColor
  textValue?: string
  textFont?: string
  textColor?: string
  textOutline?: boolean
  outlineColor?: string
  textZoneLogoUrl?: string | null
}) {
  const bt: BodyType       = bodyType ?? 'tshirt'
  const cl: ProductColor   = color    ?? 'white'
  const isNone             = svgId === 'none' || svgId === 'none-back'
  const patternId          = isNone ? undefined : svgId
  const placementFallback  = svgId === 'none-back' ? 'back' : 'front'

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all text-left w-full bg-white ${
        isSelected
          ? 'border-black shadow-md'
          : 'border-gray-200 active:border-gray-400'
      }`}
    >
      {/* モックアップ写真プレビュー */}
      <div className="w-full aspect-square overflow-hidden">
        <ProductMockup
          bodyType={bt}
          color={cl}
          designUrl={patternId ? designUrl : null}
          patternId={patternId}
          placement={placementFallback}
          showFrame={!!patternId}
          className="w-full h-full"
          textValue={textValue}
          textZoneLogoUrl={textZoneLogoUrl}
          textFont={textFont}
          textColor={textColor}
          textOutline={textOutline}
          outlineColor={outlineColor}
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

  const [selectedFront,    setSelectedFront]    = useState<FrontOption>('none')
  const [selectedBack,     setSelectedBack]     = useState<BackOption>('none')
  // フロントテキスト設定
  const [textFront,        setTextFront]        = useState(designName ?? '')
  const [useFrontLogo,     setUseFrontLogo]     = useState(false)
  const [logoFront,        setLogoFront]        = useState<string | null>(null)
  // バックテキスト設定
  const [textBack,         setTextBack]         = useState('')
  const [useBackLogo,      setUseBackLogo]      = useState(false)
  const [logoBack,         setLogoBack]         = useState<string | null>(null)
  const [backSameAsFront,  setBackSameAsFront]  = useState(false)
  // 共通テキストスタイル
  const [selectedFont,     setSelectedFont]     = useState<FontOption>('gothic')
  const [textOutline,      setTextOutline]      = useState(false)
  const [textColor,        setTextColor]        = useState('#000000')
  const [outlineColor,     setOutlineColor]     = useState('#FFFFFF')
  // A3 用ロゴ（デザインゾーン）
  const [myLogoImage,      setMyLogoImage]      = useState<string | null>(null)
  const [activeTab,        setActiveTab]        = useState<'front' | 'back'>('front')
  const [previewSide,      setPreviewSide]      = useState<'front' | 'back'>('front')

  // バックの実効値（「フロントと同じ」チェック時はフロントの値を使用）
  const effectiveBackText    = backSameAsFront ? textFront    : textBack
  const effectiveUseBackLogo = backSameAsFront ? useFrontLogo : useBackLogo
  const effectiveBackLogo    = backSameAsFront ? logoFront    : logoBack

  const hasPrintSelection    = selectedFront !== 'none' || selectedBack !== 'none'
  const showFrontTextSection = TEXT_IDS.has(selectedFront)
  const showBackTextSection  = TEXT_IDS.has(selectedBack)

  // テキスト入力ヘルパー（2行 × 各20文字まで）
  function clampText(val: string): string {
    return val.split('\n').slice(0, 2).map(l => l.slice(0, 20)).join('\n')
  }

  const [removingBgFront, setRemovingBgFront] = useState(false)
  const [removingBgBack,  setRemovingBgBack]  = useState(false)

  const frontLogoRef = useRef<HTMLInputElement>(null)
  const backLogoRef  = useRef<HTMLInputElement>(null)

  async function removeBgAndSet(file: File, setter: (url: string) => void, setLoading: (v: boolean) => void) {
    setLoading(true)
    try {
      const blob = await removeBackground(file)
      setter(URL.createObjectURL(blob))
    } catch {
      // 透過失敗時はそのまま表示
      setter(URL.createObjectURL(file))
    } finally {
      setLoading(false)
    }
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMyLogoImage(URL.createObjectURL(file))
  }

  function handleProceed() {
    if (!hasPrintSelection) return
    const placementMap: Record<string, { placement: string; print_size: string }> = {
      A:   { placement: 'one_point', print_size: 'small'  },
      A2:  { placement: 'one_point', print_size: 'medium' },
      A3:  { placement: 'one_point', print_size: 'medium' },
      C1:  { placement: 'front',     print_size: 'medium' },
      C2:  { placement: 'front',     print_size: 'large'  },
      C3:  { placement: 'front',     print_size: 'large'  },
      AT1: { placement: 'one_point', print_size: 'small'  },
      AT2: { placement: 'front',     print_size: 'small'  },
      AT3: { placement: 'front',     print_size: 'small'  },
      CT1: { placement: 'front',     print_size: 'medium' },
      F1:  { placement: 'front',     print_size: 'large'  },
      F2:  { placement: 'front',     print_size: 'large'  },
      B1:  { placement: 'back',      print_size: 'large'  },
      B2:  { placement: 'back',      print_size: 'medium' },
      BT1: { placement: 'back',      print_size: 'small'  },
      BT2: { placement: 'back',      print_size: 'medium' },
      BT3: { placement: 'back',      print_size: 'small'  },
      D1:  { placement: 'back',      print_size: 'large'  },
      D2:  { placement: 'back',      print_size: 'large'  },
      E1:  { placement: 'back',      print_size: 'medium' },
      E2:  { placement: 'back',      print_size: 'medium' },
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
    // テキスト・ロゴ設定を sessionStorage で引き渡す
    sessionStorage.setItem('inkdrop_preview', JSON.stringify({
      selectedFront,
      selectedBack,
      textFront,
      textBack:      effectiveBackText,
      useFrontLogo,
      useBackLogo:   effectiveUseBackLogo,
      logoFront,
      logoBack:      effectiveBackLogo,
      selectedFont,
      textColor,
      textOutline,
      outlineColor,
    }))
    router.push(`/designs/${id}/preview?${p.toString()}`)
  }

  // ライブプレビュー用
  const activePlacement: 'front' | 'one_point' | 'back' =
    (selectedFront === 'A' || selectedFront === 'A2' || selectedFront === 'A3') ? 'one_point' :
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
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm">
            {/* 左矢印 */}
            <button
              onClick={() => setPreviewSide(s => s === 'front' ? 'back' : 'front')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            {/* 右矢印 */}
            <button
              onClick={() => setPreviewSide(s => s === 'front' ? 'back' : 'front')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>

            {(() => {
              const curPattern = previewSide === 'front' ? selectedFront : selectedBack
              // テキストのみパターン（デザイン画像不要）
              const TEXT_ONLY_PATTERNS = new Set(['AT1','AT2','AT3','CT1','BT1','BT2','BT3'])
              // ロゴゾーン（myLogoImageを使用）
              const isLogoPattern  = curPattern === 'A3'
              const isTextOnly     = TEXT_ONLY_PATTERNS.has(curPattern)
              const previewDesignUrl =
                curPattern === 'none' ? null :
                isLogoPattern  ? myLogoImage :
                isTextOnly     ? null :
                designImageUrl

              return (
                <ProductMockup
                  bodyType={bodyType}
                  color={color}
                  designUrl={previewDesignUrl}
                  patternId={curPattern !== 'none' ? curPattern : undefined}
                  placement={previewSide === 'back' ? 'back' : activePlacement}
                  className="aspect-square"
                  textValue={
                    !(previewSide === 'front' ? useFrontLogo : effectiveUseBackLogo)
                      ? (previewSide === 'front' ? textFront : effectiveBackText) || undefined
                      : undefined
                  }
                  textZoneLogoUrl={
                    (previewSide === 'front' ? useFrontLogo : effectiveUseBackLogo)
                      ? (previewSide === 'front' ? logoFront : effectiveBackLogo)
                      : null
                  }
                  textFont={selectedFont}
                  textColor={textColor}
                  textOutline={textOutline}
                  outlineColor={outlineColor}
                />
              )
            })()}

            {/* フロント/バック インジケーター */}
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${previewSide === 'front' ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${previewSide === 'back'  ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* ラベル */}
          <p className="text-center text-[11px] text-gray-400 font-medium mt-2">
            <span className="font-bold text-gray-500">{previewSide === 'front' ? 'FRONT' : 'BACK'}</span>
            {hasPrintSelection && (() => {
              const opt = previewSide === 'front'
                ? [...FRONT_DESIGN, ...FRONT_TEXT, ...FRONT_COMBO].find(o => o.id === selectedFront && selectedFront !== 'none')
                : [...BACK_DESIGN,  ...BACK_TEXT,  ...BACK_COMBO ].find(o => o.id === selectedBack  && selectedBack  !== 'none')
              return opt ? <> · {opt.code} {opt.label}</> : null
            })()}
          </p>
        </div>
      )}

      {/* フロント / バック タブ */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-white rounded-2xl p-1 border border-gray-200">
          {(['front', 'back'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPreviewSide(tab) }}
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
                    onClick={() => { setSelectedFront(opt.id); if (opt.id !== 'none') setPreviewSide('front') }}
                    designUrl={opt.id === 'A3' ? myLogoImage : designImageUrl}
                    bodyType={bodyType}
                    color={color}
                    textValue={textFront || undefined}
                    textFont={selectedFont}
                    textColor={textColor}
                    textOutline={textOutline}
                    outlineColor={outlineColor}
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
                    onClick={() => { const next = selectedFront === opt.id ? 'none' : opt.id; setSelectedFront(next); if (next !== 'none') setPreviewSide('front') }}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                    textValue={!useFrontLogo ? textFront || undefined : undefined}
                    textZoneLogoUrl={useFrontLogo ? logoFront : null}
                    textFont={selectedFont}
                    textColor={textColor}
                    textOutline={textOutline}
                    outlineColor={outlineColor}
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
                    onClick={() => { const next = selectedFront === opt.id ? 'none' : opt.id; setSelectedFront(next); if (next !== 'none') setPreviewSide('front') }}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                    textValue={!useFrontLogo ? textFront || undefined : undefined}
                    textZoneLogoUrl={useFrontLogo ? logoFront : null}
                    textFont={selectedFont}
                    textColor={textColor}
                    textOutline={textOutline}
                    outlineColor={outlineColor}
                  />
                ))}
              </div>
            </section>

            {/* ── フロント テキスト設定（テキストパターン選択時のみ）── */}
            {showFrontTextSection && (
              <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* ヘッダー */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <p className="text-sm font-black text-gray-900">テキスト設定</p>
                </div>

                {/* テキスト入力 */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                  <div className="relative">
                    <textarea
                      rows={textFront.includes('\n') ? 2 : 1}
                      value={textFront}
                      onChange={e => setTextFront(clampText(e.target.value))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && textFront.split('\n').length >= 2) e.preventDefault()
                      }}
                      disabled={useFrontLogo}
                      placeholder="テキストを入力（Enterで改行）"
                      className={`w-full px-4 py-3 pr-14 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none leading-relaxed ${useFrontLogo ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
                    />
                    <span className="absolute right-3.5 bottom-3.5 text-[10px] text-gray-400 tabular-nums leading-tight text-right pointer-events-none">
                      {textFront.split('\n').map((l, i) => <span key={i} className="block">{l.length}/20</span>)}
                    </span>
                  </div>
                </div>

                {/* マイロゴ チェックボックス + アップロード */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useFrontLogo}
                      onChange={e => setUseFrontLogo(e.target.checked)}
                      className="w-4 h-4 rounded accent-black cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">マイロゴ（テキストの代わりに使用）</span>
                  </label>
                  {useFrontLogo && (
                    <>
                      <button
                        onClick={() => frontLogoRef.current?.click()}
                        disabled={removingBgFront}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 bg-white active:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <ImagePlus size={16} className="text-gray-400" />
                        ロゴを読み込む（横長推奨）
                      </button>
                      <input ref={frontLogoRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) removeBgAndSet(f, setLogoFront, setRemovingBgFront) }} />
                      {removingBgFront && (
                        <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-500">
                          <Loader2 size={14} className="animate-spin" />
                          背景を透過しています…
                        </div>
                      )}
                      {logoFront && !removingBgFront && (
                        <div className="relative">
                          <div className="w-full h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoFront} alt="マイロゴ" className="max-w-full max-h-full object-contain" />
                          </div>
                          <button onClick={() => setLogoFront(null)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px] font-bold">✕</button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* フォント */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2.5">フォント</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setSelectedFont(f.id)}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedFont === f.id ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'
                        }`}>{f.label}</button>
                    ))}
                  </div>
                </div>

                {/* 文字のふち */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2.5">文字のふち</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: false, l: 'なし' }, { v: true, l: 'あり' }].map(o => (
                      <button key={String(o.v)} onClick={() => setTextOutline(o.v)}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          textOutline === o.v ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'
                        }`}>{o.l}</button>
                    ))}
                  </div>
                </div>

                {/* テキストカラー */}
                <div className={`px-4 pt-3 pb-3 ${textOutline ? 'border-b border-gray-100' : ''}`}>
                  <p className="text-xs font-bold text-gray-500 mb-2.5">テキストカラー</p>
                  <ColorPicker colors={TEXT_COLORS} selected={textColor} onSelect={setTextColor} />
                </div>

                {/* ふちカラー */}
                {textOutline && (
                  <div className="px-4 pt-3 pb-4">
                    <p className="text-xs font-bold text-gray-500 mb-2.5">ふちカラー</p>
                    <ColorPicker colors={TEXT_COLORS} selected={outlineColor} onSelect={setOutlineColor} />
                  </div>
                )}
              </section>
            )}

            {/* A3 選択時：デザインゾーン用ロゴ */}
            {selectedFront === 'A3' && (
              <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <p className="text-sm font-black text-gray-900">マイロゴ（A-3 デザインゾーン）</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">写真を読み込むとAIが2Dデザインに変換します</p>
                </div>
                <div className="px-4 py-4">
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 bg-white active:bg-gray-50 transition-colors">
                    <ImagePlus size={18} className="text-gray-400" />写真を読み込む
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                  {myLogoImage && (
                    <div className="relative mt-3">
                      <div className="w-full aspect-video bg-white rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={myLogoImage} alt="マイロゴ" className="max-w-full max-h-full object-contain" />
                      </div>
                      <button onClick={() => setMyLogoImage(null)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-bold">✕</button>
                    </div>
                  )}
                </div>
              </section>
            )}
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
                    onClick={() => { setSelectedBack(opt.id); if (opt.id !== 'none') setPreviewSide('back') }}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                    textValue={!effectiveUseBackLogo ? effectiveBackText || undefined : undefined}
                    textZoneLogoUrl={effectiveUseBackLogo ? effectiveBackLogo : null}
                    textFont={selectedFont}
                    textColor={textColor}
                    textOutline={textOutline}
                    outlineColor={outlineColor}
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
                    onClick={() => { const next = selectedBack === opt.id ? 'none' : opt.id; setSelectedBack(next); if (next !== 'none') setPreviewSide('back') }}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                    textValue={!effectiveUseBackLogo ? effectiveBackText || undefined : undefined}
                    textZoneLogoUrl={effectiveUseBackLogo ? effectiveBackLogo : null}
                    textFont={selectedFont}
                    textColor={textColor}
                    textOutline={textOutline}
                    outlineColor={outlineColor}
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
                    onClick={() => { const next = selectedBack === opt.id ? 'none' : opt.id; setSelectedBack(next); if (next !== 'none') setPreviewSide('back') }}
                    designUrl={designImageUrl}
                    bodyType={bodyType}
                    color={color}
                    textValue={!effectiveUseBackLogo ? effectiveBackText || undefined : undefined}
                    textZoneLogoUrl={effectiveUseBackLogo ? effectiveBackLogo : null}
                    textFont={selectedFont}
                    textColor={textColor}
                    textOutline={textOutline}
                    outlineColor={outlineColor}
                  />
                ))}
              </div>
            </section>

            {/* ── バック テキスト設定（テキストパターン選択時のみ）── */}
            {showBackTextSection && (
              <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* ヘッダー + フロントと同じチェック */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-gray-900">テキスト設定</p>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 cursor-pointer shrink-0">
                    <input type="checkbox" checked={backSameAsFront}
                      onChange={e => setBackSameAsFront(e.target.checked)}
                      className="w-4 h-4 rounded accent-black cursor-pointer" />
                    フロントと同じ
                  </label>
                </div>

                {/* テキスト入力 */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                  <div className="relative">
                    <textarea
                      rows={effectiveBackText.includes('\n') ? 2 : 1}
                      value={effectiveBackText}
                      onChange={e => { if (!backSameAsFront) setTextBack(clampText(e.target.value)) }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && effectiveBackText.split('\n').length >= 2) e.preventDefault()
                      }}
                      disabled={backSameAsFront || effectiveUseBackLogo}
                      placeholder="テキストを入力（Enterで改行）"
                      className={`w-full px-4 py-3 pr-14 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none leading-relaxed ${(backSameAsFront || effectiveUseBackLogo) ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
                    />
                    <span className="absolute right-3.5 bottom-3.5 text-[10px] text-gray-400 tabular-nums leading-tight text-right pointer-events-none">
                      {effectiveBackText.split('\n').map((l, i) => <span key={i} className="block">{l.length}/20</span>)}
                    </span>
                  </div>
                </div>

                {/* マイロゴ チェックボックス + アップロード */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100 space-y-3">
                  <label className={`flex items-center gap-2.5 ${backSameAsFront ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={effectiveUseBackLogo}
                      onChange={e => { if (!backSameAsFront) setUseBackLogo(e.target.checked) }}
                      disabled={backSameAsFront}
                      className="w-4 h-4 rounded accent-black cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">
                      マイロゴ（テキストの代わりに使用）
                    </span>
                  </label>
                  {effectiveUseBackLogo && (
                    <>
                      {!backSameAsFront ? (
                        <>
                          <button onClick={() => backLogoRef.current?.click()}
                            disabled={removingBgBack}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 bg-white active:bg-gray-50 transition-colors disabled:opacity-50">
                            <ImagePlus size={16} className="text-gray-400" />
                            ロゴを読み込む（横長推奨）
                          </button>
                          <input ref={backLogoRef} type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) removeBgAndSet(f, setLogoBack, setRemovingBgBack) }} />
                          {removingBgBack && (
                            <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-500">
                              <Loader2 size={14} className="animate-spin" />
                              背景を透過しています…
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-1">フロントのロゴを使用</p>
                      )}
                      {effectiveBackLogo && !removingBgBack && (
                        <div className="relative">
                          <div className="w-full h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={effectiveBackLogo} alt="マイロゴ" className="max-w-full max-h-full object-contain" />
                          </div>
                          {!backSameAsFront && (
                            <button onClick={() => setLogoBack(null)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px] font-bold">✕</button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* フォント */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2.5">フォント</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setSelectedFont(f.id)}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedFont === f.id ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'
                        }`}>{f.label}</button>
                    ))}
                  </div>
                </div>

                {/* 文字のふち */}
                <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2.5">文字のふち</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: false, l: 'なし' }, { v: true, l: 'あり' }].map(o => (
                      <button key={String(o.v)} onClick={() => setTextOutline(o.v)}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          textOutline === o.v ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'
                        }`}>{o.l}</button>
                    ))}
                  </div>
                </div>

                {/* テキストカラー */}
                <div className={`px-4 pt-3 pb-3 ${textOutline ? 'border-b border-gray-100' : ''}`}>
                  <p className="text-xs font-bold text-gray-500 mb-2.5">テキストカラー</p>
                  <ColorPicker colors={TEXT_COLORS} selected={textColor} onSelect={setTextColor} />
                </div>

                {/* ふちカラー */}
                {textOutline && (
                  <div className="px-4 pt-3 pb-4">
                    <p className="text-xs font-bold text-gray-500 mb-2.5">ふちカラー</p>
                    <ColorPicker colors={TEXT_COLORS} selected={outlineColor} onSelect={setOutlineColor} />
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* フロント / バック タブ（コンテンツ最下部） */}
        <div className="pt-2">
          <div className="flex bg-white rounded-2xl p-1 border border-gray-200">
            {(['front', 'back'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPreviewSide(tab) }}
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
