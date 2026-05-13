'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MockupPreview } from '@/components/design/MockupPreview'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import {
  BODY_TYPE_LABELS,
  COLOR_LABELS,
  PLACEMENT_LABELS,
  PRINT_SIZE_LABELS,
  DEFAULT_PRICES,
  type Design,
  type BodyType,
  type ProductColor,
  type Size,
  type Placement,
  type PrintSize,
} from '@/types'
import { formatPrice } from '@/lib/utils'

const VIEWS = ['front', 'side', 'back'] as const

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const body_type = searchParams.get('body_type') as BodyType
  const color = searchParams.get('color') as ProductColor
  const size = searchParams.get('size') as Size
  const placement = searchParams.get('placement') as Placement
  const print_size = searchParams.get('print_size') as PrintSize

  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [viewIdx, setViewIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDesign() {
      try {
        const { data, error: err } = await supabase
          .from('designs')
          .select('*')
          .eq('id', id)
          .single()
        if (err) throw err
        setDesign(data as Design)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchDesign()
  }, [id])

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !design) return <ErrorScreen message="データの取得に失敗しました" />

  const basePrice = DEFAULT_PRICES[body_type].price
  const customFee = placement === 'custom' ? 500 : 0
  const total = basePrice + customFee

  async function handleCheckout() {
    setSubmitting(true)
    setPaymentError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_id: id,
          body_type,
          color,
          size,
          placement,
          print_size,
        }),
      })
      if (!res.ok) throw new Error('checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setPaymentError('決済の開始に失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2"><ChevronLeft size={22} /></button>
        <h1 className="text-base font-semibold">プレビュー</h1>
      </header>

      <div className="px-4 py-3">
        <MockupPreview
          designImageUrl={design.transparent_image_url ?? design.image_url}
          bodyType={body_type}
          color={color}
          placement={placement}
          printSize={print_size}
          view={VIEWS[viewIdx]}
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {VIEWS.map((v, idx) => (
            <button
              key={v}
              onClick={() => setViewIdx(idx)}
              className={`py-2 text-xs font-medium rounded-lg border ${
                viewIdx === idx ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600'
              }`}
            >
              {v === 'front' ? '前' : v === 'side' ? '横' : '後ろ'}
            </button>
          ))}
        </div>
      </div>

      {/* 詳細 */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
        <h2 className="text-sm font-bold mb-2">注文内容</h2>
        <Row label="商品" value={BODY_TYPE_LABELS[body_type]} />
        <Row label="カラー" value={COLOR_LABELS[color]} />
        <Row label="サイズ" value={size} />
        <Row label="配置" value={PLACEMENT_LABELS[placement]} />
        <Row label="プリントサイズ" value={PRINT_SIZE_LABELS[print_size]} />
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">商品代金</span>
            <span>{formatPrice(basePrice)}</span>
          </div>
          {customFee > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">カスタム配置追加料金</span>
              <span>{formatPrice(customFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">送料</span>
            <span className="text-gray-500">本土無料 ／ 離島は別途</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100">
        <p className="text-[11px] text-yellow-900 leading-relaxed">
          ⚠️ 受注生産品のため、注文確定後のキャンセル・返品はできません。
        </p>
      </div>

      {paymentError && <p className="text-sm text-red-500 text-center my-3">{paymentError}</p>}

      {/* 固定の購入バー */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-5 py-3 safe-bottom z-40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">合計（税込）</span>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          {submitting ? '決済画面へ移動中...' : 'この内容で購入する'}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
