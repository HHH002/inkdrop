'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'

// ── カラーパレット（ProductMockupと同じ） ─────────────────────
const PALETTE: Record<string, { fill: string; stroke: string; shadow1: string; shadow2: string; hi: string }> = {
  white: { fill: '#F7F7F5', stroke: '#DDDDD8', shadow1: '#E4E4E0', shadow2: '#CACAC6', hi: '#FFFFFF' },
  black: { fill: '#1C1C1C', stroke: '#323232', shadow1: '#141414', shadow2: '#0A0A0A', hi: '#2E2E2E' },
  gray:  { fill: '#9C9C9A', stroke: '#888886', shadow1: '#7A7A78', shadow2: '#626260', hi: '#B4B4B2' },
}

// ── 型定義 ────────────────────────────────────────────────────
interface GuideRect  { x: number; y: number; w: number; h: number }
interface TextGuide  { x: number; y: number; fontSize: number }
interface PatternOpt {
  id: string
  label: string
  desc: string
  side: 'front' | 'back'
  guide?: GuideRect | null
  textGuide?: TextGuide | null
  placement: string | null
  print_size: string | null
}

// ── パターン定義 ──────────────────────────────────────────────
const FRONT_PATTERNS: PatternOpt[] = [
  { id: 'A',  label: 'A｜ワンポイント',      desc: '左胸・小ロゴ配置',        side: 'front', guide: { x: 116, y: 148, w: 60,  h: 60  }, placement: 'one_point', print_size: 'small'  },
  { id: 'C1', label: 'C-1｜フロントスモール', desc: '胸中央・中くらいのプリント', side: 'front', guide: { x: 142, y: 168, w: 116, h: 116 }, placement: 'front',     print_size: 'medium' },
  { id: 'C2', label: 'C-2｜フロントビッグ',  desc: '胸中央・大きめプリント',   side: 'front', guide: { x: 118, y: 148, w: 164, h: 164 }, placement: 'front',     print_size: 'large'  },
]

const BACK_PATTERNS: PatternOpt[] = [
  { id: 'B1',  label: 'B-1｜縦長デザイン', desc: '背面中央・縦長プリント',    side: 'back', guide: { x: 160, y: 148, w: 80,  h: 144 }, placement: 'back', print_size: 'large'  },
  { id: 'B2',  label: 'B-2｜横長デザイン', desc: '背面中央・横長プリント',    side: 'back', guide: { x: 116, y: 196, w: 168, h: 84  }, placement: 'back', print_size: 'medium' },
  { id: 'BT1', label: '縦長とテキスト',    desc: '縦長プリント＋テキスト',    side: 'back', guide: { x: 160, y: 140, w: 80,  h: 120 }, textGuide: { x: 200, y: 308, fontSize: 22 }, placement: 'back', print_size: 'large'  },
  { id: 'BT2', label: '横長とテキスト',    desc: '横長プリント＋テキスト',    side: 'back', guide: { x: 116, y: 168, w: 168, h: 84  }, textGuide: { x: 200, y: 306, fontSize: 22 }, placement: 'back', print_size: 'medium' },
]

const TEXT_PATTERNS: PatternOpt[] = [
  { id: 'AT1', label: 'A.T-1', desc: '左胸テキスト',          side: 'front', textGuide: { x: 152, y: 183, fontSize: 20 }, placement: 'one_point', print_size: 'small'  },
  { id: 'AT2', label: 'A.T-2', desc: '胸中央テキスト',        side: 'front', textGuide: { x: 200, y: 258, fontSize: 24 }, placement: 'front',     print_size: 'medium' },
  { id: 'AT3', label: 'A.T-3', desc: '右下テキスト',          side: 'front', textGuide: { x: 248, y: 352, fontSize: 20 }, placement: 'front',     print_size: 'small'  },
  { id: 'CT1', label: 'C.T-1', desc: '胸中央小テキスト',      side: 'front', guide: { x: 142, y: 168, w: 116, h: 96  }, textGuide: { x: 200, y: 302, fontSize: 20 }, placement: 'front', print_size: 'medium' },
  { id: 'CT3', label: 'C.T-3', desc: '大きめ中央＋上テキスト', side: 'front', guide: { x: 118, y: 180, w: 164, h: 144 }, textGuide: { x: 200, y: 162, fontSize: 22 }, placement: 'front', print_size: 'large'  },
]

// ── ミニモックアップSVG ───────────────────────────────────────
function MiniMockup({
  color,
  side = 'front',
  guide,
  textGuide,
  uid,
}: {
  color: string
  side?: 'front' | 'back'
  guide?: GuideRect | null
  textGuide?: TextGuide | null
  uid: string
}) {
  const p = PALETTE[color] ?? PALETTE.white
  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id={`${uid}-lg`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={p.shadow1} />
          <stop offset="18%"  stopColor={p.fill} />
          <stop offset="50%"  stopColor={p.hi} />
          <stop offset="82%"  stopColor={p.fill} />
          <stop offset="100%" stopColor={p.shadow1} />
        </linearGradient>
        <linearGradient id={`${uid}-sl`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={p.shadow2} />
          <stop offset="60%"  stopColor={p.shadow1} />
          <stop offset="100%" stopColor={p.fill} />
        </linearGradient>
        <linearGradient id={`${uid}-sr`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={p.shadow2} />
          <stop offset="60%"  stopColor={p.shadow1} />
          <stop offset="100%" stopColor={p.fill} />
        </linearGradient>
        <filter id={`${uid}-ds`} x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000" floodOpacity="0.17" />
        </filter>
        <radialGradient id={`${uid}-hl`} cx="50%" cy="35%" r="50%">
          <stop offset="0%"   stopColor="#FFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="434" rx="148" ry="7" fill="#000" opacity="0.09" />
      <path d="M102,62 L20,108 L36,168 L112,142 Z"  fill={`url(#${uid}-sl)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${uid}-ds)`} />
      <path d="M298,62 L380,108 L364,168 L288,142 Z" fill={`url(#${uid}-sr)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${uid}-ds)`} />
      <path
        d="M102,62 C118,54 146,48 152,70 C160,34 240,34 248,70 C254,48 282,54 298,62 L288,142 L290,424 L110,424 L112,142 Z"
        fill={`url(#${uid}-lg)`} stroke={p.stroke} strokeWidth="1" filter={`url(#${uid}-ds)`}
      />
      <path d="M152,70 C160,34 240,34 248,70 C234,90 166,90 152,70 Z" fill={p.shadow1} />
      <path d="M152,70 C160,34 240,34 248,70" fill="none" stroke={p.shadow2} strokeWidth="5" strokeLinecap="round" />
      <path d="M112,142 L288,142" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.5" />
      <path d="M112,142 L110,424" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.35" />
      <path d="M288,142 L290,424" fill="none" stroke={p.shadow1} strokeWidth="1" opacity="0.35" />
      <path d="M20,108 L36,168"   fill="none" stroke={p.shadow2} strokeWidth="4" strokeLinecap="round" />
      <path d="M380,108 L364,168" fill="none" stroke={p.shadow2} strokeWidth="4" strokeLinecap="round" />
      <path d="M110,420 L290,420" fill="none" stroke={p.shadow2} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <rect x="110" y="62" width="180" height="362" rx="4" fill={`url(#${uid}-hl)`} />

      {side === 'back' && (
        <text x="200" y="290" textAnchor="middle" fontSize="18" fill={p.shadow2} fontFamily="sans-serif" opacity="0.35" letterSpacing="3">BACK</text>
      )}
      {guide && (
        <rect x={guide.x} y={guide.y} width={guide.w} height={guide.h}
          fill="rgba(34,197,94,0.15)" stroke="rgb(22,163,74)" strokeWidth="2.5" rx="4" strokeDasharray="7,4" />
      )}
      {textGuide && (
        <text x={textGuide.x} y={textGuide.y} textAnchor="middle"
          fontSize={textGuide.fontSize} fill="rgb(22,163,74)"
          fontFamily="sans-serif" fontWeight="700" letterSpacing="2" opacity="0.9">
          TEXT
        </text>
      )}
    </svg>
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
      <div className="w-full aspect-[10/11] mb-2 relative">
        <MiniMockup
          color={color}
          side={opt.side}
          guide={opt.guide}
          textGuide={opt.textGuide}
          uid={`${opt.id}-${color}`}
        />
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
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

  // 実際の印刷パターンが選ばれているか
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
    if (bodyType)       p.set('body_type',  bodyType)
    if (color)          p.set('color',      color)
    if (size)           p.set('size',       size)
    p.set('placement',  primary.placement)
    p.set('print_size', primary.print_size!)
    if (designImageUrl) p.set('image_url',  designImageUrl)
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
                  {[
                    { hex: '#000000', label: '黒'  },
                    { hex: '#FFFFFF', label: '白'  },
                    { hex: '#EF4444', label: '赤'  },
                    { hex: '#3B82F6', label: '青'  },
                    { hex: '#1E3A8A', label: '紺'  },
                    { hex: '#EAB308', label: '黄'  },
                    { hex: '#22C55E', label: '緑'  },
                    { hex: '#6B7280', label: 'グレー' },
                  ].map(c => (
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
                          <path d="M1 5L4.5 8.5L11 1.5" stroke={c.hex === '#FFFFFF' || c.hex === '#EAB308' ? '#374151' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    { id: 'none',  label: 'なし',   preview: 'A' },
                    { id: 'thin',  label: '細ふち',  preview: 'A' },
                    { id: 'thick', label: '太ふち',  preview: 'A' },
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
                          textShadow: o.id === 'none' ? 'none' : undefined,
                          backgroundColor: 'transparent',
                        }}
                      >
                        {o.preview}
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
