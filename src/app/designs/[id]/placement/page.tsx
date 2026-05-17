'use client'

import { useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'

// ── 型定義 ──────────────────────────────────────────────────
type FrontPlacement     = 'none' | 'A' | 'C1' | 'C2'
type BackPlacement      = 'none' | 'B1' | 'B2' | 'D1' | 'D2' | 'D3' | 'D4'
type TextFrontPlacement = 'AT1' | 'AT2' | 'AT3' | 'CT1' | 'CT2'
type TextBackPlacement  = 'BT1' | 'BT2' | 'BT3'
type FontOption         = 'gothic' | 'square' | 'mincho' | 'handwritten' | 'classic'

// ── 配置データ ───────────────────────────────────────────────
const FRONT_PLACEMENTS: { id: FrontPlacement; label: string; desc: string }[] = [
  { id: 'none', label: 'なし',                 desc: '配置なし'        },
  { id: 'A',    label: 'A｜ワンポイント',       desc: '左胸・小ロゴ'    },
  { id: 'C1',   label: 'C-1｜フロント スモール', desc: 'フロント中央・小' },
  { id: 'C2',   label: 'C-2｜フロント ビッグ',  desc: 'フロント中央・大' },
]

const BACK_PLACEMENTS: { id: BackPlacement; label: string; desc: string }[] = [
  { id: 'none', label: 'なし',           desc: '配置なし'              },
  { id: 'B1',   label: 'B-1｜縦長デザイン', desc: '背面中央・縦長'        },
  { id: 'B2',   label: 'B-2｜横長デザイン', desc: '背面中央・横長'        },
  { id: 'D1',   label: 'D-1｜縦長 スモール', desc: '縦長デザイン＋小テキスト' },
  { id: 'D2',   label: 'D-2｜縦長 ビッグ',  desc: '縦長デザイン＋大テキスト' },
  { id: 'D3',   label: 'D-3｜横長 スモール', desc: '横長デザイン＋小テキスト' },
  { id: 'D4',   label: 'D-4｜横長 ビッグ',  desc: '横長デザイン＋大テキスト' },
]

const TEXT_FRONT_PLACEMENTS: { id: TextFrontPlacement; label: string; desc: string }[] = [
  { id: 'AT1', label: 'A.T-1', desc: 'ワンポイント位置テキスト' },
  { id: 'AT2', label: 'A.T-2', desc: '中間位置テキスト'       },
  { id: 'AT3', label: 'A.T-3', desc: '右下位置テキスト'       },
  { id: 'CT1', label: 'C.T-1', desc: 'フロント中央・小テキスト' },
  { id: 'CT2', label: 'C.T-2', desc: 'フロント中央・大テキスト' },
]

const TEXT_BACK_PLACEMENTS: { id: TextBackPlacement; label: string; desc: string }[] = [
  { id: 'BT1', label: 'B.T-1', desc: '背面上部テキスト' },
  { id: 'BT2', label: 'B.T-2', desc: '背面中央テキスト' },
  { id: 'BT3', label: 'B.T-3', desc: '背面下部テキスト' },
]

const FONT_OPTIONS: { id: FontOption; label: string }[] = [
  { id: 'gothic',      label: 'ゴシック'  },
  { id: 'square',      label: '角ゴシック' },
  { id: 'mincho',      label: '明朝体'    },
  { id: 'handwritten', label: '手書き風'  },
  { id: 'classic',     label: 'クラシック' },
]

const TEXT_COLORS = [
  { hex: '#000000', label: '黒'    },
  { hex: '#FFFFFF', label: '白'    },
  { hex: '#EF4444', label: '赤'    },
  { hex: '#3B82F6', label: '青'    },
  { hex: '#22C55E', label: '緑'    },
  { hex: '#EAB308', label: '黄'    },
  { hex: '#F97316', label: 'オレンジ' },
  { hex: '#A855F7', label: '紫'    },
  { hex: '#6B7280', label: 'グレー'  },
]

// ── TシャツSVGプレビュー ─────────────────────────────────────
// viewBox: 0 0 100 110  body: x110~290 → scaled to 22~78, y60~424 → scaled to 22~100
interface Zone { x: number; y: number; w: number; h: number }

function TshirtSVG({
  side,
  design,
  text,
  textMark,
}: {
  side: 'front' | 'back'
  design?: Zone
  text?: Zone
  textMark?: { x: number; y: number; size?: number }
}) {
  const BODY  = 'M28,22 L14,14 L0,20 L8,46 L22,42 L22,100 L78,100 L78,42 L92,46 L100,20 L86,14 L72,22'
  const COLF  = 'C68,32 32,32 28,22'   // front collar (deeper)
  const COLB  = 'C68,28 32,28 28,22'   // back collar (shallower)
  const collar = side === 'front' ? COLF : COLB

  return (
    <svg viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* シャツ本体 */}
      <path d={`${BODY} ${collar} Z`} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round" />
      {/* 衿 */}
      <path d={`M28,22 ${collar}`} fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
      {/* 袖縫い目 */}
      <line x1="22" y1="42" x2="8"  y2="46" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="78" y1="42" x2="92" y2="46" stroke="#D1D5DB" strokeWidth="0.8" />
      {/* 脇縫い目 */}
      <line x1="22" y1="42" x2="22" y2="100" stroke="#D1D5DB" strokeWidth="0.6" strokeDasharray="2,2" />
      <line x1="78" y1="42" x2="78" y2="100" stroke="#D1D5DB" strokeWidth="0.6" strokeDasharray="2,2" />

      {/* バック表示 */}
      {side === 'back' && !design && !textMark && (
        <text x="50" y="68" textAnchor="middle" fontSize="7" fill="#9CA3AF" fontFamily="sans-serif" letterSpacing="1">BACK</text>
      )}

      {/* デザインエリア（青） */}
      {design && (
        <rect x={design.x} y={design.y} width={design.w} height={design.h}
          fill="rgba(59,130,246,0.18)" stroke="#3B82F6" strokeWidth="1.2" rx="2" />
      )}

      {/* テキストエリア（黄/オレンジ） */}
      {text && (
        <rect x={text.x} y={text.y} width={text.w} height={text.h}
          fill="rgba(234,179,8,0.18)" stroke="#F59E0B" strokeWidth="1" rx="2" strokeDasharray="3,2" />
      )}

      {/* テキストマーク */}
      {textMark && (
        <text
          x={textMark.x} y={textMark.y}
          textAnchor="middle"
          fontSize={textMark.size ?? 9}
          fontWeight="700"
          fill="#3B82F6"
          fontFamily="sans-serif"
        >T</text>
      )}
    </svg>
  )
}

// 各配置IDに対応するSVG props
function getTshirtProps(id: string): Parameters<typeof TshirtSVG>[0] {
  switch (id) {
    // Front
    case 'none': return { side: 'front' }
    case 'A':    return { side: 'front', design: { x: 26, y: 36, w: 14, h: 14 } }
    case 'C1':   return { side: 'front', design: { x: 35, y: 46, w: 30, h: 24 } }
    case 'C2':   return { side: 'front', design: { x: 27, y: 40, w: 46, h: 36 } }
    // Back
    case 'none-back': return { side: 'back' }
    case 'B1':   return { side: 'back',  design: { x: 40, y: 32, w: 20, h: 44 } }
    case 'B2':   return { side: 'back',  design: { x: 26, y: 50, w: 48, h: 22 } }
    case 'D1':   return { side: 'back',  design: { x: 40, y: 28, w: 20, h: 36 }, text: { x: 30, y: 68, w: 40, h:  9 } }
    case 'D2':   return { side: 'back',  design: { x: 40, y: 26, w: 20, h: 34 }, text: { x: 26, y: 64, w: 48, h: 13 } }
    case 'D3':   return { side: 'back',  design: { x: 26, y: 44, w: 48, h: 20 }, text: { x: 34, y: 68, w: 32, h:  9 } }
    case 'D4':   return { side: 'back',  design: { x: 26, y: 42, w: 48, h: 20 }, text: { x: 26, y: 66, w: 48, h: 13 } }
    // Text front
    case 'AT1':  return { side: 'front', textMark: { x: 32, y: 46 } }
    case 'AT2':  return { side: 'front', textMark: { x: 50, y: 56 } }
    case 'AT3':  return { side: 'front', textMark: { x: 66, y: 66 } }
    case 'CT1':  return { side: 'front', textMark: { x: 50, y: 60 } }
    case 'CT2':  return { side: 'front', textMark: { x: 50, y: 57, size: 13 } }
    // Text back
    case 'BT1':  return { side: 'back',  textMark: { x: 50, y: 38 } }
    case 'BT2':  return { side: 'back',  textMark: { x: 50, y: 56 } }
    case 'BT3':  return { side: 'back',  textMark: { x: 50, y: 72 } }
    default:     return { side: 'front' }
  }
}

// ── 配置カード ────────────────────────────────────────────────
function PlacementCard({
  svgId, label, desc, isSelected, onClick,
}: {
  svgId: string; label: string; desc: string; isSelected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-colors bg-white text-left w-full ${
        isSelected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200 active:bg-gray-50'
      }`}
    >
      {/* Tシャツプレビュー */}
      <div className="w-full aspect-square mb-2">
        <TshirtSVG {...getTshirtProps(svgId)} />
      </div>
      <p className={`w-full text-[11px] font-semibold leading-tight ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
        {label}
      </p>
      {desc && (
        <p className="w-full text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
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

// ── セクションタイトル ─────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-[14px] font-bold text-gray-900 mb-3">{title}</h2>
}

// ── トグルスイッチ ─────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={enabled}
      className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
      style={{ width: 48, height: 26 }}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

// ── カラーサークル ─────────────────────────────────────────────
function ColorPicker({
  colors, selected, onSelect,
}: {
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
              <path
                d="M1 5L4.5 8.5L11 1.5"
                stroke={c.hex === '#FFFFFF' || c.hex === '#EAB308' ? '#374151' : 'white'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────
export default function PlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params)
  const router   = useRouter()
  const sp       = useSearchParams()
  const fileRef  = useRef<HTMLInputElement>(null)

  const bodyType       = sp.get('body_type')  as BodyType
  const color          = sp.get('color')       as ProductColor
  const size           = sp.get('size')        as Size
  const designImageUrl = sp.get('image_url')  ?? null

  // ── 選択状態 ──
  const [selectedFrontPlacement,     setSelectedFrontPlacement]     = useState<FrontPlacement>('none')
  const [selectedBackPlacement,      setSelectedBackPlacement]      = useState<BackPlacement>('none')
  const [textEnabled,                setTextEnabled]                = useState(false)
  const [selectedTextFrontPlacement, setSelectedTextFrontPlacement] = useState<TextFrontPlacement | null>(null)
  const [selectedTextBackPlacement,  setSelectedTextBackPlacement]  = useState<TextBackPlacement | null>(null)
  const [textValue,                  setTextValue]                  = useState('')
  const [selectedFont,               setSelectedFont]               = useState<FontOption>('gothic')
  const [textOutlineEnabled,         setTextOutlineEnabled]         = useState(false)
  const [textColor,                  setTextColor]                  = useState('#000000')
  const [outlineColor,               setOutlineColor]               = useState('#FFFFFF')
  const [myLogoImage,                setMyLogoImage]                = useState<string | null>(null)

  // ── 派生状態 ──
  const isDSelected = ['D1', 'D2', 'D3', 'D4'].includes(selectedBackPlacement)
  const shouldShowTextSettings      = textEnabled || isDSelected
  const shouldShowTextPlacements    = textEnabled
  const hasPrintSelection =
    selectedFrontPlacement !== 'none' ||
    selectedBackPlacement  !== 'none'

  // ── ロゴ読み込み ──
  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setMyLogoImage(url)
  }

  // ── 進む ──
  function handleProceed() {
    if (!hasPrintSelection) return
    const placementMap: Record<string, { placement: string; print_size: string }> = {
      A:  { placement: 'one_point', print_size: 'small'  },
      C1: { placement: 'front',     print_size: 'medium' },
      C2: { placement: 'front',     print_size: 'large'  },
      B1: { placement: 'back',      print_size: 'large'  },
      B2: { placement: 'back',      print_size: 'medium' },
      D1: { placement: 'back',      print_size: 'large'  },
      D2: { placement: 'back',      print_size: 'large'  },
      D3: { placement: 'back',      print_size: 'medium' },
      D4: { placement: 'back',      print_size: 'medium' },
    }
    const primary = placementMap[selectedFrontPlacement] ?? placementMap[selectedBackPlacement]
    if (!primary) return

    const p = new URLSearchParams()
    if (bodyType)       p.set('body_type',  bodyType)
    if (color)          p.set('color',      color)
    if (size)           p.set('size',       size)
    p.set('placement',  primary.placement)
    p.set('print_size', primary.print_size)
    if (designImageUrl) p.set('image_url',  designImageUrl)
    if (shouldShowTextSettings && textValue) {
      p.set('text',         textValue)
      p.set('font',         selectedFont)
      p.set('text_color',   textColor)
      p.set('text_outline', textOutlineEnabled ? 'yes' : 'no')
      p.set('outline_color', outlineColor)
    }
    router.push(`/designs/${id}/preview?${p.toString()}`)
  }

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

      <div className="px-4 py-5 space-y-6">

        {/* ── フロントパターン ── */}
        <section>
          <SectionTitle title="フロントパターンを選択" />
          <div className="grid grid-cols-2 gap-3">
            {FRONT_PLACEMENTS.map(opt => (
              <PlacementCard
                key={opt.id}
                svgId={opt.id === 'none' ? 'none' : opt.id}
                label={opt.label}
                desc={opt.desc}
                isSelected={selectedFrontPlacement === opt.id}
                onClick={() => setSelectedFrontPlacement(opt.id)}
              />
            ))}
          </div>
        </section>

        {/* ── バックパターン ── */}
        <section>
          <SectionTitle title="バックパターンを選択" />
          <div className="grid grid-cols-2 gap-3">
            {BACK_PLACEMENTS.map(opt => (
              <PlacementCard
                key={opt.id}
                svgId={opt.id === 'none' ? 'none-back' : opt.id}
                label={opt.label}
                desc={opt.desc}
                isSelected={selectedBackPlacement === opt.id}
                onClick={() => setSelectedBackPlacement(opt.id)}
              />
            ))}
          </div>
        </section>

        {/* ── テキスト追加トグル ── */}
        <section className="bg-white rounded-2xl border border-gray-200 px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">テキスト追加</p>
            <p className="text-xs text-gray-400 mt-0.5">文字をプリントできます</p>
          </div>
          <Toggle enabled={textEnabled} onToggle={() => setTextEnabled(v => !v)} />
        </section>

        {/* ── テキストON時：追加配置パターン ── */}
        {shouldShowTextPlacements && (
          <>
            <section>
              <SectionTitle title="テキストあり フロントパターン" />
              <div className="grid grid-cols-2 gap-3">
                {TEXT_FRONT_PLACEMENTS.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    label={opt.label}
                    desc={opt.desc}
                    isSelected={selectedTextFrontPlacement === opt.id}
                    onClick={() => setSelectedTextFrontPlacement(
                      selectedTextFrontPlacement === opt.id ? null : opt.id
                    )}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle title="テキストあり バックパターン" />
              <div className="grid grid-cols-2 gap-3">
                {TEXT_BACK_PLACEMENTS.map(opt => (
                  <PlacementCard
                    key={opt.id}
                    svgId={opt.id}
                    label={opt.label}
                    desc={opt.desc}
                    isSelected={selectedTextBackPlacement === opt.id}
                    onClick={() => setSelectedTextBackPlacement(
                      selectedTextBackPlacement === opt.id ? null : opt.id
                    )}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── テキスト設定（D系選択 or テキストON時） ── */}
        {shouldShowTextSettings && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">テキスト設定</p>
            </div>

            {/* テキスト入力 */}
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

            {/* フォント選択 */}
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">フォント</p>
              <div className="grid grid-cols-3 gap-2">
                {FONT_OPTIONS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                      selectedFont === f.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 文字のふち */}
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">文字のふち</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { enabled: false, label: 'なし' },
                  { enabled: true,  label: 'あり' },
                ].map(o => (
                  <button
                    key={String(o.enabled)}
                    onClick={() => setTextOutlineEnabled(o.enabled)}
                    className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                      textOutlineEnabled === o.enabled
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* テキストカラー */}
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">テキストカラー</p>
              <ColorPicker colors={TEXT_COLORS} selected={textColor} onSelect={setTextColor} />
            </div>

            {/* ふちカラー */}
            {textOutlineEnabled && (
              <div className="px-4 py-4">
                <p className="text-xs font-semibold text-gray-500 mb-2.5">ふちカラー</p>
                <ColorPicker colors={TEXT_COLORS} selected={outlineColor} onSelect={setOutlineColor} />
              </div>
            )}
          </section>
        )}

        {/* ── マイロゴ追加（テキストON時） ── */}
        {shouldShowTextSettings && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">マイロゴ追加</p>
            </div>
            <div className="px-4 py-4 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                写真やロゴ画像を読み込むと、AIがフラットな2Dデザインに変換してプリント用デザインとして表示します。
              </p>

              {/* アップロードボタン */}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <ImagePlus size={18} className="text-gray-400" />
                写真を読み込む
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoFile}
              />
              <p className="text-[11px] text-gray-400 text-center">
                AIが2Dのデザインに変換します
              </p>

              {/* プレビュー */}
              {myLogoImage && (
                <div className="relative mt-2">
                  <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={myLogoImage} alt="マイロゴ" className="w-full h-full object-contain" />
                  </div>
                  <button
                    onClick={() => setMyLogoImage(null)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── 固定下部ボタン ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-4 z-50">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 bg-white"
          >
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
