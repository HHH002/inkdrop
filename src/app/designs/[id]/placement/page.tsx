'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { BodyType, ProductColor, Size } from '@/types'

// ==============================
// 配置オプション
// ==============================
type PlacementOption = {
  id: string
  label: string
  desc: string
  side: 'front' | 'back'
  // SVG上のデザイン配置座標 (viewBox 100x110)
  x: number
  y: number
  w: number
  h: number
  placement: string
  print_size: string
}

const PLACEMENT_OPTIONS: PlacementOption[] = [
  { id: 'A',  label: 'ワンポイント',       desc: '左胸・小さめ',       side: 'front', x: 22, y: 35, w: 16, h: 16, placement: 'one_point', print_size: 'small' },
  { id: 'C1', label: 'フロント スモール',  desc: 'フロント中央・中くらい', side: 'front', x: 33, y: 46, w: 34, h: 28, placement: 'front', print_size: 'medium' },
  { id: 'C2', label: 'フロント ビッグ',    desc: 'フロント中央・大きめ', side: 'front', x: 26, y: 40, w: 48, h: 40, placement: 'front', print_size: 'large' },
  { id: 'B1', label: 'バック 縦長',        desc: '背面・縦長デザイン',   side: 'back',  x: 34, y: 32, w: 32, h: 48, placement: 'back', print_size: 'large' },
  { id: 'B2', label: 'バック 横長',        desc: '背面・横長デザイン',   side: 'back',  x: 22, y: 48, w: 56, h: 28, placement: 'back', print_size: 'medium' },
]

// ==============================
// T-shirt SVG with design overlay
// ==============================
function TshirtWithDesign({
  side,
  designUrl,
  dx, dy, dw, dh,
  selected,
}: {
  side: 'front' | 'back'
  designUrl: string | null
  dx: number; dy: number; dw: number; dh: number
  selected: boolean
}) {
  const bodyPath = side === 'front'
    ? "M28 22 L16 12 L2 18 L10 44 L20 41 L20 98 L80 98 L80 41 L90 44 L98 18 L84 12 L72 22 C68 32 32 32 28 22 Z"
    : "M28 22 L16 12 L2 18 L10 44 L20 41 L20 98 L80 98 L80 41 L90 44 L98 18 L84 12 L72 22 C72 28 28 28 28 22 Z"

  return (
    <svg viewBox="0 0 100 110" className="w-full h-full" aria-hidden>
      <path d={bodyPath} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
      {side === 'front' && (
        <path d="M28 22 C32 34 68 34 72 22" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
      )}
      {designUrl ? (
        <image href={designUrl} x={dx} y={dy} width={dw} height={dh} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <rect x={dx} y={dy} width={dw} height={dh} rx="2" fill={selected ? '#3B82F6' : '#9CA3AF'} opacity="0.7" />
      )}
    </svg>
  )
}

// ==============================
// ステップバー
// ==============================
function StepBar({ current }: { current: number }) {
  const steps = ['アイテム選択', '配置選択', '確認・注文']
  return (
    <div className="flex items-center px-4 py-2 gap-0">
      {steps.map((label, i) => {
        const idx = i + 1
        const isActive = idx === current
        const isDone = idx < current
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                isActive ? 'border-blue-500 bg-blue-500 text-white' : isDone ? 'border-blue-300 bg-blue-100 text-blue-500' : 'border-gray-200 bg-white text-gray-400'
              }`}>
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
// メインページ
// ==============================
export default function PlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()

  const bodyType = searchParams.get('body_type') as BodyType
  const color = searchParams.get('color') as ProductColor
  const size = searchParams.get('size') as Size
  const designImageUrl = searchParams.get('image_url') ?? null

  const [selected, setSelected] = useState<string>('C1')

  function handleProceed() {
    const opt = PLACEMENT_OPTIONS.find(o => o.id === selected)
    if (!opt) return
    const p = new URLSearchParams()
    if (bodyType) p.set('body_type', bodyType)
    if (color)    p.set('color', color)
    if (size)     p.set('size', size)
    p.set('placement', opt.placement)
    p.set('print_size', opt.print_size)
    if (designImageUrl) p.set('image_url', designImageUrl)
    router.push(`/designs/${id}/preview?${p.toString()}`)
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-28">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-2">
          <button onClick={() => router.back()} className="p-2 text-gray-500">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold ml-1">配置を選ぶ</h1>
        </div>
        <StepBar current={2} />
      </header>

      <div className="px-4 py-5">
        <p className="text-xs text-gray-500 mb-4">プリント位置を選んでください。デザインを合わせた完成イメージです。</p>

        {/* 全配置プレビューグリッド */}
        <div className="grid grid-cols-2 gap-3">
          {PLACEMENT_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all bg-white ${
                  isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
                }`}
              >
                <div className="w-full aspect-[10/11] mb-2">
                  <TshirtWithDesign
                    side={opt.side}
                    designUrl={designImageUrl}
                    dx={opt.x} dy={opt.y} dw={opt.w} dh={opt.h}
                    selected={isSelected}
                  />
                </div>
                <div className="w-full text-left">
                  <p className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                    {opt.id}｜{opt.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
                </div>
                {isSelected && (
                  <div className="mt-2 w-full">
                    <span className="inline-block bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">選択中</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 固定下部ボタン */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-3 z-50">
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
            この配置で注文へ
          </button>
        </div>
      </div>
    </div>
  )
}
