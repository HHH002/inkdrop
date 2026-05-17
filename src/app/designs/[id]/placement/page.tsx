'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'

// ── モックアップ写真URL ────────────────────────────────────────
const PHOTO = {
  front: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?fm=jpg&q=80&w=400&auto=format&fit=crop',
  back:  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?fm=jpg&q=80&w=400&auto=format&fit=crop',
}

// カラーごとのCSSフィルター（白ベース写真を近似）
const COLOR_FILTER: Record<string, string> = {
  white: 'none',
  black: 'grayscale(100%) brightness(20%)',
  gray:  'grayscale(100%) brightness(65%)',
}

// ── 型定義 ────────────────────────────────────────────────────
interface PhotoGuide {
  top: number; left: number; width: number; height: number  // %値
}
interface PhotoText {
  top: number; left: number  // %値
}
interface PatternOpt {
  id: string
  label: string
  desc: string
  side: 'front' | 'back'
  photoGuide?: PhotoGuide | null
  photoText?: PhotoText | null
  placement: string | null
  print_size: string | null
}

// ── SVG座標→写真%変換（シャツ領域: left18%, top8%, w64%, h84%） ─
function pct(svgX: number, svgY: number, svgW: number, svgH: number): PhotoGuide {
  const sL = 110, sW = 180, sT = 60, sH = 364
  const pL = 0.18, pW = 0.64, pT = 0.08, pH = 0.84
  return {
    left:   Math.round((pL + (svgX - sL) / sW * pW) * 1000) / 10,
    top:    Math.round((pT + (svgY - sT) / sH * pH) * 1000) / 10,
    width:  Math.round(svgW / sW * pW * 1000) / 10,
    height: Math.round(svgH / sH * pH * 1000) / 10,
  }
}
function pctXY(svgX: number, svgY: number): PhotoText {
  const sL = 110, sW = 180, sT = 60, sH = 364
  return {
    left: Math.round((0.18 + (svgX - sL) / sW * 0.64) * 1000) / 10,
    top:  Math.round((0.08 + (svgY - sT) / sH * 0.84) * 1000) / 10,
  }
}

// ── パターン定義 ──────────────────────────────────────────────
const FRONT_PATTERNS: PatternOpt[] = [
  {
    id: 'A', label: 'A｜ワンポイント', desc: '左胸・小ロゴ配置', side: 'front',
    photoGuide: pct(116, 148, 60, 60),
    placement: 'one_point', print_size: 'small',
  },
  {
    id: 'C1', label: 'C-1｜フロントスモール', desc: '胸中央・中くらいのプリント', side: 'front',
    photoGuide: pct(142, 168, 116, 116),
    placement: 'front', print_size: 'medium',
  },
  {
    id: 'C2', label: 'C-2｜フロントビッグ', desc: '胸中央・大きめプリント', side: 'front',
    photoGuide: pct(118, 148, 164, 164),
    placement: 'front', print_size: 'large',
  },
]

const BACK_PATTERNS: PatternOpt[] = [
  {
    id: 'B1', label: 'B-1｜縦長デザイン', desc: '背面中央・縦長プリント', side: 'back',
    photoGuide: pct(160, 148, 80, 144),
    placement: 'back', print_size: 'large',
  },
  {
    id: 'B2', label: 'B-2｜横長デザイン', desc: '背面中央・横長プリント', side: 'back',
    photoGuide: pct(116, 196, 168, 84),
    placement: 'back', print_size: 'medium',
  },
  {
    id: 'BT1', label: '縦長とテキスト', desc: '縦長プリント＋テキスト', side: 'back',
    photoGuide: pct(160, 140, 80, 120),
    photoText:  pctXY(200, 308),
    placement: 'back', print_size: 'large',
  },
  {
    id: 'BT2', label: '横長とテキスト', desc: '横長プリント＋テキスト', side: 'back',
    photoGuide: pct(116, 168, 168, 84),
    photoText:  pctXY(200, 306),
    placement: 'back', print_size: 'medium',
  },
]

const TEXT_PATTERNS: PatternOpt[] = [
  {
    id: 'AT1', label: 'A.T-1', desc: '左胸テキスト', side: 'front',
    photoText: pctXY(152, 183), placement: 'one_point', print_size: 'small',
  },
  {
    id: 'AT2', label: 'A.T-2', desc: '胸中央テキスト', side: 'front',
    photoText: pctXY(200, 258), placement: 'front', print_size: 'medium',
  },
  {
    id: 'AT3', label: 'A.T-3', desc: '右下テキスト', side: 'front',
    photoText: pctXY(248, 352), placement: 'front', print_size: 'small',
  },
  {
    id: 'CT1', label: 'C.T-1', desc: '胸中央小テキスト', side: 'front',
    photoGuide: pct(142, 168, 116, 96),
    photoText:  pctXY(200, 302),
    placement: 'front', print_size: 'medium',
  },
  {
    id: 'CT3', label: 'C.T-3', desc: '大きめ中央＋上テキスト', side: 'front',
    photoGuide: pct(118, 180, 164, 144),
    photoText:  pctXY(200, 162),
    placement: 'front', print_size: 'large',
  },
]

// ── 写真ベースモックアップ ─────────────────────────────────────
function PhotoMockup({
  side, color, photoGuide, photoText,
}: {
  side: 'front' | 'back'
  color: string
  photoGuide?: PhotoGuide | null
  photoText?: PhotoText | null
}) {
  const filter = COLOR_FILTER[color] ?? 'none'
  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
      {/* ベース写真 */}
      <img
        src={PHOTO[side]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter }}
        draggable={false}
      />
      {/* バック表示 */}
      {side === 'back' && (
        <div className="absolute top-2 left-2 bg-black/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider">
          BACK
        </div>
      )}
      {/* ガイド矩形 */}
      {photoGuide && (
        <div
          className="absolute border-2 border-dashed border-green-400 bg-green-400/20 rounded"
          style={{
            top:    `${photoGuide.top}%`,
            left:   `${photoGuide.left}%`,
            width:  `${photoGuide.width}%`,
            height: `${photoGuide.height}%`,
          }}
        />
      )}
      {/* TEXTラベル */}
      {photoText && (
        <div
          className="absolute text-green-400 font-black text-[10px] tracking-widest leading-none -translate-x-1/2 -translate-y-1/2"
          style={{
            top:  `${photoText.top}%`,
            left: `${photoText.left}%`,
          }}
        >
          TEXT
        </div>
      )}
    </div>
  )
}

// ── ステップバー ──────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ['アイテム選択', '配置選択', 'デザイン編集', '確認・注文']
  return (
    <div className="flex items-start px-4 py-3 bg-white">
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
              <span className={`mt-1 text-[9px] font-medium text-center leading-tight px-0.5 ${
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

// ── パターンカード ────────────────────────────────────────────
function PatternCard({ opt, isSelected, color, onClick }: {
  opt: PatternOpt; isSelected: boolean; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all bg-white text-left w-full ${
        isSelected
          ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
          : 'border-gray-200'
      }`}
    >
      <div className="w-full mb-2 relative">
        <PhotoMockup
          side={opt.side}
          color={color}
          photoGuide={opt.photoGuide}
          photoText={opt.photoText}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      <div className="w-full">
        <p className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>{opt.label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
      </div>
    </button>
  )
}

// ── なし選択ボタン ───────────────────────────────────────────
function NoneButton({ isSelected, label, desc, onClick }: {
  isSelected: boolean; label: string; desc: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full mb-3 px-4 py-3 rounded-xl border-2 flex items-center gap-3 bg-white transition-all ${
        isSelected ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.10)]' : 'border-gray-200'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
      }`}>
        {isSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className="text-left">
        <p className={`text-sm font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </button>
  )
}

// ── セクションヘッダー ─────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────
export default function PlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params)
  const router   = useRouter()
  const searchParams = useSearchParams()

  const bodyType       = searchParams.get('body_type')  as BodyType
  const color          = searchParams.get('color')       as ProductColor
  const size           = searchParams.get('size')        as Size
  const designImageUrl = searchParams.get('image_url')  ?? null

  const [frontPattern, setFrontPattern] = useState<string | null>(null)
  const [backPattern,  setBackPattern]  = useState<string | null>(null)
  const [textEnabled,  setTextEnabled]  = useState(false)
  const [textPattern,  setTextPattern]  = useState<string | null>(null)
  const [textContent,  setTextContent]  = useState('')
  const [fontStyle,    setFontStyle]    = useState<'gothic' | 'square' | 'mincho' | 'handwritten'>('gothic')
  const [fontSize,     setFontSize]     = useState<'large' | 'small'>('large')
  const [textColor,    setTextColor]    = useState('#000000')
  const [textOutline,  setTextOutline]  = useState<'none' | 'thin' | 'thick'>('none')

  const colorStr = color ?? 'white'

  const hasPrintSelection =
    FRONT_PATTERNS.some(p => p.id === frontPattern) ||
    BACK_PATTERNS.some(p => p.id === backPattern)

  function toggle<T>(current: T | null, value: T): T | null {
    return current === value ? null : value
  }

  function handleProceed() {
    if (!hasPrintSelection) return
    const frontOpt = FRONT_PATTERNS.find(p => p.id === frontPattern)
    const backOpt  = BACK_PATTERNS.find(p => p.id === backPattern)
    const textOpt  = TEXT_PATTERNS.find(p => p.id === textPattern)
    const primary  = frontOpt ?? backOpt
    if (!primary?.placement) return

    const p = new URLSearchParams()
    if (bodyType)       p.set('body_type',    bodyType)
    if (color)          p.set('color',        color)
    if (size)           p.set('size',         size)
    p.set('placement',  primary.placement)
    p.set('print_size', primary.print_size!)
    if (designImageUrl) p.set('image_url',    designImageUrl)
    if (textEnabled && textContent) {
      p.set('text',         textContent)
      p.set('font',         fontStyle)
      p.set('font_size',    fontSize)
      p.set('text_color',   textColor)
      p.set('text_outline', textOutline)
    }
    if (textOpt?.id)    p.set('text_pattern', textOpt.id)
    router.push(`/designs/${id}/preview?${p.toString()}`)
  }

  const FONT_OPTIONS: { id: typeof fontStyle; label: string }[] = [
    { id: 'gothic',      label: 'ゴシック'  },
    { id: 'square',      label: '角ゴシック' },
    { id: 'mincho',      label: '明朝体'    },
    { id: 'handwritten', label: '手書き風'  },
  ]

  const TEXT_COLORS = [
    { hex: '#000000', label: '黒'    },
    { hex: '#FFFFFF', label: '白'    },
    { hex: '#EF4444', label: '赤'    },
    { hex: '#3B82F6', label: '青'    },
    { hex: '#1E3A8A', label: '紺'    },
    { hex: '#EAB308', label: '黄'    },
    { hex: '#22C55E', label: '緑'    },
    { hex: '#6B7280', label: 'グレー' },
  ]

  return (
    <div className="min-h-dvh bg-gray-50 pb-32">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-2">
          <button onClick={() => router.back()} className="p-2 text-gray-500">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold ml-1">配置を選ぶ</h1>
        </div>
        <StepBar current={2} />
      </header>

      <div className="px-4 py-5 space-y-7">

        {/* ── フロントパターン ─────────────────── */}
        <section>
          <SectionHeader
            title="フロントパターンを選択"
            subtitle="Tシャツ正面のプリント位置を選択してください"
          />
          <NoneButton
            isSelected={frontPattern === 'none_front'}
            label="なし"
            desc="フロントは無地のまま"
            onClick={() => setFrontPattern(toggle(frontPattern, 'none_front'))}
          />
          <div className="grid grid-cols-2 gap-3">
            {FRONT_PATTERNS.map(opt => (
              <PatternCard
                key={opt.id}
                opt={opt}
                isSelected={frontPattern === opt.id}
                color={colorStr}
                onClick={() => setFrontPattern(toggle(frontPattern, opt.id))}
              />
            ))}
          </div>
        </section>

        {/* ── バックパターン ───────────────────── */}
        <section>
          <SectionHeader
            title="バックパターンを選択"
            subtitle="Tシャツ背面のプリント位置を選択してください"
          />
          <NoneButton
            isSelected={backPattern === 'none_back'}
            label="なし"
            desc="バックは無地のまま"
            onClick={() => setBackPattern(toggle(backPattern, 'none_back'))}
          />
          <div className="grid grid-cols-2 gap-3">
            {BACK_PATTERNS.map(opt => (
              <PatternCard
                key={opt.id}
                opt={opt}
                isSelected={backPattern === opt.id}
                color={colorStr}
                onClick={() => setBackPattern(toggle(backPattern, opt.id))}
              />
            ))}
          </div>
        </section>

        {/* ── テキスト追加トグル ───────────────── */}
        <section>
          <div className="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-800">テキストを追加する</p>
              <p className="text-xs text-gray-400 mt-0.5">文字をプリントできます</p>
            </div>
            <button
              onClick={() => setTextEnabled(!textEnabled)}
              aria-pressed={textEnabled}
              className={`relative flex-shrink-0 w-12 rounded-full transition-colors duration-200 ${textEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
              style={{ height: '26px' }}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                textEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </section>

        {/* ── テキストありパターン（トグルON時） ── */}
        {textEnabled && (
          <>
            <section>
              <SectionHeader
                title="テキストありフロントパターン"
                subtitle="テキストを配置する位置を選択してください"
              />
              <div className="grid grid-cols-2 gap-3">
                {TEXT_PATTERNS.map(opt => (
                  <PatternCard
                    key={opt.id}
                    opt={opt}
                    isSelected={textPattern === opt.id}
                    color={colorStr}
                    onClick={() => setTextPattern(toggle(textPattern, opt.id))}
                  />
                ))}
              </div>
            </section>

            {/* テキスト設定 */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">テキスト設定</p>
              </div>

              {/* 入力欄 */}
              <div className="px-4 pt-4 pb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={textContent}
                    onChange={e => setTextContent(e.target.value.slice(0, 20))}
                    placeholder="TEXTを入力してください"
                    className="w-full px-4 py-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
                    {textContent.length}/20
                  </span>
                </div>
              </div>

              {/* フォント選択 */}
              <div className="px-4 pb-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">フォント</p>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFontStyle(f.id)}
                      className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        fontStyle === f.id
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文字サイズ */}
              <div className="px-4 pb-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">文字サイズ</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['large', 'small'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        fontSize === s
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {s === 'large' ? '大' : '小'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文字カラー */}
              <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2.5">文字カラー</p>
                <div className="flex flex-wrap gap-2.5">
                  {TEXT_COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setTextColor(c.hex)}
                      title={c.label}
                      className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        textColor === c.hex
                          ? 'border-blue-500 scale-110 shadow-md'
                          : 'border-gray-200'
                      } ${c.hex === '#FFFFFF' ? 'shadow-sm' : ''}`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {textColor === c.hex && (
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
              </div>

              {/* 文字のふち */}
              <div className="px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">文字のふち</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'none',  label: 'なし'  },
                    { id: 'thin',  label: '細ふち' },
                    { id: 'thick', label: '太ふち' },
                  ] as const).map(o => (
                    <button
                      key={o.id}
                      onClick={() => setTextOutline(o.id)}
                      className={`py-2.5 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        textOutline === o.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <span
                        className="text-lg font-black leading-none"
                        style={{
                          color: textColor,
                          WebkitTextStroke:
                            o.id === 'thin'  ? '1.5px #374151' :
                            o.id === 'thick' ? '3px #374151'   : 'unset',
                        }}
                      >
                        A
                      </span>
                      <span className={`text-[10px] font-medium ${textOutline === o.id ? 'text-blue-600' : 'text-gray-500'}`}>
                        {o.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ── 固定下部ボタン ─────────────────────── */}
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
