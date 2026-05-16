'use client'

import { useState, useRef, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'

// ==============================
// 型定義
// ==============================
type FrontPlacement = 'none' | 'A' | 'C1' | 'C2'
type BackPlacement = 'none' | 'B1' | 'B2' | 'D1' | 'D2' | 'D3' | 'D4'
type TextFrontPlacement = 'AT1' | 'AT2' | 'AT3' | 'CT1' | 'CT2'
type TextBackPlacement = 'BT1' | 'BT2' | 'BT3'
type FontType = 'gothic' | 'square_gothic' | 'mincho' | 'handwritten' | 'classic'

// ==============================
// 定数
// ==============================
const FRONT_PLACEMENTS: { id: FrontPlacement; label: string; desc: string }[] = [
  { id: 'none', label: 'なし', desc: '配置しない' },
  { id: 'A',   label: 'A｜ワンポイント',       desc: '左胸ワンポイント' },
  { id: 'C1',  label: 'C-1｜フロント スモール', desc: 'フロント中央・小さめ' },
  { id: 'C2',  label: 'C-2｜フロント ビッグ',   desc: 'フロント中央・大きめ' },
]

const BACK_PLACEMENTS: { id: BackPlacement; label: string; desc: string }[] = [
  { id: 'none', label: 'なし',            desc: '配置しない' },
  { id: 'B1',  label: 'B-1｜縦長デザイン', desc: '背面中央・縦長' },
  { id: 'B2',  label: 'B-2｜横長デザイン', desc: '背面中央・横長' },
  { id: 'D1',  label: 'D-1｜縦長 スモール', desc: 'デザイン＋テキスト・小' },
  { id: 'D2',  label: 'D-2｜縦長 ビッグ',  desc: 'デザイン＋テキスト・大' },
  { id: 'D3',  label: 'D-3｜横長 スモール', desc: '横長デザイン＋テキスト・小' },
  { id: 'D4',  label: 'D-4｜横長 ビッグ',  desc: '横長デザイン＋テキスト・大' },
]

const TEXT_FRONT_PLACEMENTS: { id: TextFrontPlacement; label: string; desc: string }[] = [
  { id: 'AT1', label: 'A.T-1', desc: 'ワンポイント位置のテキスト' },
  { id: 'AT2', label: 'A.T-2', desc: '左胸・中間位置のテキスト' },
  { id: 'AT3', label: 'A.T-3', desc: '右側下のテキスト' },
  { id: 'CT1', label: 'C.T-1', desc: 'フロント中央・スモール' },
  { id: 'CT2', label: 'C.T-2', desc: 'フロント中央・ビッグ' },
]

const TEXT_BACK_PLACEMENTS: { id: TextBackPlacement; label: string; desc: string }[] = [
  { id: 'BT1', label: 'B.T-1', desc: '背面上部テキスト' },
  { id: 'BT2', label: 'B.T-2', desc: '背面中央テキスト' },
  { id: 'BT3', label: 'B.T-3', desc: '背面下部テキスト' },
]

const FONTS: { id: FontType; label: string; fontFamily: string }[] = [
  { id: 'gothic',       label: 'ゴシック',   fontFamily: 'sans-serif' },
  { id: 'square_gothic',label: '角ゴシック', fontFamily: 'monospace' },
  { id: 'mincho',       label: '明朝体',     fontFamily: 'serif' },
  { id: 'handwritten',  label: '手書き風',   fontFamily: 'cursive' },
  { id: 'classic',      label: 'クラシック', fontFamily: 'Georgia, serif' },
]

const TEXT_COLORS = [
  { id: '#000000', label: '黒' },
  { id: '#FFFFFF', label: '白' },
  { id: '#EF4444', label: '赤' },
  { id: '#3B82F6', label: '青' },
  { id: '#22C55E', label: '緑' },
  { id: '#EAB308', label: '黄' },
  { id: '#F97316', label: 'オレンジ' },
  { id: '#A855F7', label: '紫' },
  { id: '#9CA3AF', label: 'グレー' },
]

// ==============================
// Tシャツ SVGプレビュー
// ==============================
function TshirtSVG({
  side = 'front',
  placement,
  highlight = '#3B82F6',
}: {
  side?: 'front' | 'back'
  placement?: string
  highlight?: string
}) {
  // Tシャツ基本シルエット（フロント・バック共通）
  const body = (
    <path
      d="M28 22 L16 12 L2 18 L10 44 L20 41 L20 98 L80 98 L80 41 L90 44 L98 18 L84 12 L72 22 C68 32 32 32 28 22 Z"
      fill="#F3F4F6"
      stroke="#D1D5DB"
      strokeWidth="1.5"
    />
  )
  const collar = (
    <path
      d="M28 22 C32 34 68 34 72 22"
      fill="#E5E7EB"
      stroke="#D1D5DB"
      strokeWidth="1"
    />
  )

  // 配置インジケーター
  let indicator: React.ReactNode = null

  if (side === 'front') {
    switch (placement) {
      case 'A':
        indicator = <rect x="22" y="38" width="14" height="14" rx="2" fill={highlight} opacity="0.85" />
        break
      case 'C1':
        indicator = <rect x="38" y="52" width="24" height="20" rx="2" fill={highlight} opacity="0.85" />
        break
      case 'C2':
        indicator = <rect x="30" y="46" width="40" height="32" rx="2" fill={highlight} opacity="0.85" />
        break
      case 'AT1':
        indicator = (
          <>
            <rect x="22" y="38" width="14" height="6" rx="1" fill={highlight} opacity="0.85" />
            <rect x="22" y="46" width="14" height="3" rx="1" fill={highlight} opacity="0.5" />
          </>
        )
        break
      case 'AT2':
        indicator = (
          <rect x="22" y="52" width="18" height="6" rx="1" fill={highlight} opacity="0.85" />
        )
        break
      case 'AT3':
        indicator = (
          <rect x="58" y="68" width="18" height="6" rx="1" fill={highlight} opacity="0.85" />
        )
        break
      case 'CT1':
        indicator = (
          <>
            <rect x="38" y="52" width="24" height="8" rx="1" fill={highlight} opacity="0.85" />
            <rect x="42" y="62" width="16" height="4" rx="1" fill={highlight} opacity="0.5" />
          </>
        )
        break
      case 'CT2':
        indicator = (
          <>
            <rect x="30" y="46" width="40" height="10" rx="1" fill={highlight} opacity="0.85" />
            <rect x="34" y="58" width="32" height="6" rx="1" fill={highlight} opacity="0.5" />
          </>
        )
        break
    }
  } else {
    // バック
    switch (placement) {
      case 'B1':
        indicator = <rect x="36" y="38" width="28" height="42" rx="2" fill={highlight} opacity="0.85" />
        break
      case 'B2':
        indicator = <rect x="26" y="52" width="48" height="22" rx="2" fill={highlight} opacity="0.85" />
        break
      case 'D1':
        indicator = (
          <>
            <rect x="36" y="38" width="28" height="32" rx="2" fill={highlight} opacity="0.85" />
            <rect x="32" y="72" width="36" height="6" rx="1" fill={highlight} opacity="0.6" />
          </>
        )
        break
      case 'D2':
        indicator = (
          <>
            <rect x="34" y="34" width="32" height="38" rx="2" fill={highlight} opacity="0.85" />
            <rect x="28" y="74" width="44" height="8" rx="1" fill={highlight} opacity="0.6" />
          </>
        )
        break
      case 'D3':
        indicator = (
          <>
            <rect x="26" y="50" width="48" height="18" rx="2" fill={highlight} opacity="0.85" />
            <rect x="32" y="70" width="36" height="5" rx="1" fill={highlight} opacity="0.6" />
          </>
        )
        break
      case 'D4':
        indicator = (
          <>
            <rect x="22" y="46" width="56" height="24" rx="2" fill={highlight} opacity="0.85" />
            <rect x="26" y="72" width="48" height="7" rx="1" fill={highlight} opacity="0.6" />
          </>
        )
        break
      case 'BT1':
        indicator = <rect x="28" y="30" width="44" height="7" rx="1" fill={highlight} opacity="0.85" />
        break
      case 'BT2':
        indicator = <rect x="28" y="55" width="44" height="7" rx="1" fill={highlight} opacity="0.85" />
        break
      case 'BT3':
        indicator = <rect x="28" y="80" width="44" height="7" rx="1" fill={highlight} opacity="0.85" />
        break
    }
  }

  return (
    <svg viewBox="0 0 100 110" className="w-full h-full" aria-hidden>
      {body}
      {collar}
      {indicator}
    </svg>
  )
}

// ==============================
// 配置カード
// ==============================
function PlacementCard({
  label,
  desc,
  selected,
  onClick,
  svgSide,
  svgPlacement,
}: {
  label: string
  desc: string
  selected: boolean
  onClick: () => void
  svgSide?: 'front' | 'back'
  svgPlacement?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="w-16 h-[72px]">
        <TshirtSVG
          side={svgSide}
          placement={svgPlacement}
          highlight={selected ? '#3B82F6' : '#9CA3AF'}
        />
      </div>
      <p className={`mt-1.5 text-[11px] font-semibold leading-tight text-center ${selected ? 'text-blue-600' : 'text-gray-700'}`}>
        {label}
      </p>
      <p className="mt-0.5 text-[10px] text-gray-400 text-center leading-tight">{desc}</p>
    </button>
  )
}

// ==============================
// ステップバー
// ==============================
function StepBar({ current }: { current: number }) {
  const steps = ['アイテム選択', '配置選択', 'デザイン編集', '確認・注文']
  return (
    <div className="flex items-center px-4 py-3 gap-0">
      {steps.map((label, i) => {
        const idx = i + 1
        const isActive = idx === current
        const isDone = idx < current
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : isDone
                    ? 'border-blue-300 bg-blue-100 text-blue-500'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {idx}
              </div>
              <span className={`mt-1 text-[9px] font-medium whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 ${isDone ? 'bg-blue-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ==============================
// セクション見出し
// ==============================
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-gray-800 mb-3">{children}</h2>
}

// ==============================
// メインページ
// ==============================
export default function PlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bodyType = searchParams.get('body_type') as BodyType
  const color = searchParams.get('color') as ProductColor
  const size = searchParams.get('size') as Size

  // ---- 配置選択状態 ----
  const [selectedFrontPlacement, setSelectedFrontPlacement] = useState<FrontPlacement>('none')
  const [selectedBackPlacement, setSelectedBackPlacement] = useState<BackPlacement>('none')

  // ---- テキスト追加スイッチ ----
  const [textEnabled, setTextEnabled] = useState(false)

  // ---- テキストあり配置選択 ----
  const [selectedTextFrontPlacement, setSelectedTextFrontPlacement] = useState<TextFrontPlacement | null>(null)
  const [selectedTextBackPlacement, setSelectedTextBackPlacement] = useState<TextBackPlacement | null>(null)

  // ---- テキスト設定 ----
  const [textValue, setTextValue] = useState('')
  const [selectedFont, setSelectedFont] = useState<FontType>('gothic')
  const [textOutlineEnabled, setTextOutlineEnabled] = useState(false)
  const [textColor, setTextColor] = useState('#000000')
  const [outlineColor, setOutlineColor] = useState('#FFFFFF')

  // ---- マイロゴ ----
  const [myLogoImage, setMyLogoImage] = useState<File | null>(null)
  const [myLogoPreview, setMyLogoPreview] = useState<string | null>(null)

  // ---- 計算値 ----
  const isDPlacementSelected = ['D1', 'D2', 'D3', 'D4'].includes(selectedBackPlacement)
  const shouldShowTextSettings = textEnabled || isDPlacementSelected
  const shouldShowTextPlacementOptions = textEnabled

  // ---- ロゴ画像選択 ----
  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMyLogoImage(file)
    const url = URL.createObjectURL(file)
    setMyLogoPreview(url)
  }

  // ---- 次へ進む ----
  function handleProceed() {
    const p = new URLSearchParams()
    if (bodyType)  p.set('body_type', bodyType)
    if (color)     p.set('color', color)
    if (size)      p.set('size', size)
    p.set('front', selectedFrontPlacement)
    p.set('back', selectedBackPlacement)
    if (textEnabled) p.set('text_enabled', '1')
    if (selectedTextFrontPlacement) p.set('text_front', selectedTextFrontPlacement)
    if (selectedTextBackPlacement)  p.set('text_back', selectedTextBackPlacement)
    if (textValue)  p.set('text_value', textValue)
    p.set('font', selectedFont)
    if (textOutlineEnabled) p.set('outline', '1')
    p.set('text_color', textColor)
    p.set('outline_color', outlineColor)

    // 既存のプレビューページへ（placement を既存型にマッピング）
    let placement = 'front'
    if (selectedFrontPlacement !== 'none' && selectedBackPlacement !== 'none') placement = 'one_point_back'
    else if (selectedFrontPlacement === 'A') placement = 'one_point'
    else if (selectedFrontPlacement !== 'none') placement = 'front'
    else if (selectedBackPlacement !== 'none') placement = 'back'
    p.set('placement', placement)
    p.set('print_size', selectedFrontPlacement === 'C2' || selectedBackPlacement === 'B1' || selectedBackPlacement === 'D2' || selectedBackPlacement === 'D4' ? 'large' : selectedFrontPlacement === 'C1' || selectedBackPlacement === 'B2' || selectedBackPlacement === 'D1' || selectedBackPlacement === 'D3' ? 'medium' : 'small')

    router.push(`/designs/${id}/preview?${p.toString()}`)
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-32">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-2">
          <button onClick={() => router.back()} className="p-2 text-gray-500">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold ml-1">オリジナルTシャツを作る</h1>
        </div>
        <StepBar current={2} />
      </header>

      <div className="px-4 py-5 space-y-6">

        {/* ===== フロントパターン ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionTitle>フロントパターンを選択</SectionTitle>
          <div className="grid grid-cols-4 gap-2">
            {FRONT_PLACEMENTS.map((p) => (
              <PlacementCard
                key={p.id}
                label={p.id === 'none' ? 'なし' : p.label.split('｜')[0]}
                desc={p.desc}
                selected={selectedFrontPlacement === p.id}
                onClick={() => setSelectedFrontPlacement(p.id)}
                svgSide="front"
                svgPlacement={p.id === 'none' ? undefined : p.id}
              />
            ))}
          </div>
          {selectedFrontPlacement !== 'none' && (
            <p className="mt-3 text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              選択中：{FRONT_PLACEMENTS.find(p => p.id === selectedFrontPlacement)?.label}
            </p>
          )}
        </div>

        {/* ===== バックパターン ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionTitle>バックパターンを選択</SectionTitle>
          <div className="grid grid-cols-4 gap-2">
            {BACK_PLACEMENTS.map((p) => (
              <PlacementCard
                key={p.id}
                label={p.id === 'none' ? 'なし' : p.label.split('｜')[0]}
                desc={p.desc}
                selected={selectedBackPlacement === p.id}
                onClick={() => {
                  setSelectedBackPlacement(p.id)
                }}
                svgSide="back"
                svgPlacement={p.id === 'none' ? undefined : p.id}
              />
            ))}
          </div>
          {selectedBackPlacement !== 'none' && (
            <p className="mt-3 text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              選択中：{BACK_PLACEMENTS.find(p => p.id === selectedBackPlacement)?.label}
            </p>
          )}
        </div>

        {/* ===== テキスト追加スイッチ ===== */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">テキスト追加</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {textEnabled ? 'テキストあり配置パターンを表示中' : 'OFFの場合はテキスト設定を表示しません'}
            </p>
          </div>
          <button
            onClick={() => setTextEnabled(!textEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${textEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            role="switch"
            aria-checked={textEnabled}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${textEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {/* ===== テキストあり フロントパターン（ON時のみ） ===== */}
        {shouldShowTextPlacementOptions && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>テキストあり フロントパターン</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {TEXT_FRONT_PLACEMENTS.map((p) => (
                <PlacementCard
                  key={p.id}
                  label={p.label}
                  desc={p.desc}
                  selected={selectedTextFrontPlacement === p.id}
                  onClick={() =>
                    setSelectedTextFrontPlacement(
                      selectedTextFrontPlacement === p.id ? null : p.id
                    )
                  }
                  svgSide="front"
                  svgPlacement={p.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ===== テキストあり バックパターン（ON時のみ） ===== */}
        {shouldShowTextPlacementOptions && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>テキストあり バックパターン</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {TEXT_BACK_PLACEMENTS.map((p) => (
                <PlacementCard
                  key={p.id}
                  label={p.label}
                  desc={p.desc}
                  selected={selectedTextBackPlacement === p.id}
                  onClick={() =>
                    setSelectedTextBackPlacement(
                      selectedTextBackPlacement === p.id ? null : p.id
                    )
                  }
                  svgSide="back"
                  svgPlacement={p.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ===== テキスト設定（OFFでもD系選択時は表示） ===== */}
        {shouldShowTextSettings && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-5">
            <SectionTitle>テキスト設定</SectionTitle>

            {/* テキスト入力 */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">テキスト入力</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={20}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="TEXTを入力してください"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="absolute right-3 bottom-2.5 text-[11px] text-gray-400">
                  {textValue.length}/20
                </span>
              </div>
            </div>

            {/* フォント選択 */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">フォント選択</label>
              <div className="flex gap-2 flex-wrap">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      selectedFont === f.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-700'
                    }`}
                    style={{ fontFamily: f.fontFamily }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 文字のふち */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">文字のふち</label>
              <div className="flex gap-2">
                {[
                  { id: false, label: 'なし' },
                  { id: true,  label: 'あり' },
                ].map((opt) => (
                  <button
                    key={String(opt.id)}
                    onClick={() => setTextOutlineEnabled(opt.id)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      textOutlineEnabled === opt.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* テキストカラー */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">テキストカラー</label>
              <div className="flex gap-2 flex-wrap">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTextColor(c.id)}
                    title={c.label}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      textColor === c.id ? 'border-blue-500 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c.id }}
                  />
                ))}
              </div>
            </div>

            {/* ふちカラー（ふちあり時のみ） */}
            {textOutlineEnabled && (
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">ふちカラー</label>
                <div className="flex gap-2 flex-wrap">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setOutlineColor(c.id)}
                      title={c.label}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${
                        outlineColor === c.id ? 'border-blue-500 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c.id }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== マイロゴ追加（テキスト追加ON時のみ） ===== */}
        {textEnabled && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>マイロゴ追加</SectionTitle>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />

            {myLogoPreview ? (
              <div className="space-y-3">
                <div className="w-full aspect-video bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={myLogoPreview}
                    alt="ロゴプレビュー"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-center text-blue-600 font-medium">AIが2Dのデザインに変換します</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium"
                >
                  写真を変更する
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <span className="text-sm font-medium">写真を読み込む</span>
                </button>
                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  AIが2Dのデザインに変換します
                  <br />
                  写真やロゴ画像を読み込むと、AIがフラットな2Dデザイン化して
                  <br />
                  プリント用デザインとして表示します
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ===== 固定下部ボタン ===== */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-3 z-50 safe-bottom">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700"
          >
            戻る
          </button>
          <button
            onClick={handleProceed}
            className="flex-[2] py-3.5 bg-blue-500 rounded-2xl text-sm font-semibold text-white"
          >
            プレビュー確認へ進む
          </button>
        </div>
      </div>
    </div>
  )
}
