'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductMockup } from '@/components/design/ProductMockup'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import {
  BODY_TYPE_LABELS,
  BODY_TYPE_PRICES,
  COLOR_LABELS,
  type Design,
  type BodyType,
  type ProductColor,
  type Size,
  type Placement,
  type PrintSize,
} from '@/types'

const PLACEMENT_LABELS_SHORT: Record<string, string> = {
  one_point: 'ワンポイント（左胸）',
  front:     'フロントセンター',
  back:      'バック',
}

const PRINT_SIZE_LABELS_SHORT: Record<string, string> = {
  small:  '小',
  medium: '中',
  large:  '大',
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const body_type  = searchParams.get('body_type')  as BodyType
  const color      = searchParams.get('color')       as ProductColor
  const size       = searchParams.get('size')        as Size
  const placement  = searchParams.get('placement')   as Placement
  const print_size = searchParams.get('print_size')  as PrintSize
  const pattern_id = searchParams.get('pattern_id') ?? undefined

  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
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

  // placement → ProductMockup の placement prop に変換
  const mockupPlacement: 'front' | 'one_point' | 'back' =
    placement === 'one_point' ? 'one_point' :
    placement === 'back'      ? 'back'      : 'front'

  async function handleCheckout() {
    setSubmitting(true)
    setPaymentError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: id, body_type, color, size, placement, print_size }),
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
    <div className="min-h-dvh bg-white pb-36">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2"><ChevronLeft size={22} /></button>
        <h1 className="text-base font-semibold">確認・注文</h1>
      </header>

      {/* モックアップ */}
      <div className="px-4 pt-4 pb-2">
        <ProductMockup
          bodyType={body_type}
          color={color}
          designUrl={design.transparent_image_url ?? design.image_url}
          placement={mockupPlacement}
          patternId={pattern_id}
          className="aspect-square"
        />
      </div>

      {/* デザインタイトル */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-xs text-gray-400">デザイン</p>
        <p className="text-sm font-semibold mt-0.5">{design.title}</p>
      </div>

      {/* 注文内容 */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-3 mt-2">
        <h2 className="text-sm font-bold">注文内容</h2>
        <Row label="アイテム"      value={BODY_TYPE_LABELS[body_type]} />
        <Row label="カラー"        value={COLOR_LABELS[color]} />
        <Row label="サイズ"        value={size} />
        <Row label="配置"          value={PLACEMENT_LABELS_SHORT[placement] ?? placement} />
        <Row label="プリントサイズ" value={PRINT_SIZE_LABELS_SHORT[print_size] ?? print_size} />
      </div>

      {/* 料金 */}
      <div className="px-5 pb-4 border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">商品代金</span>
          <span>¥{BODY_TYPE_PRICES[body_type].toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">送料</span>
          <span className="text-gray-500">本土無料 ／ 離島は別途</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
          <span>合計（税込）</span>
          <span>¥{BODY_TYPE_PRICES[body_type].toLocaleString()}</span>
        </div>
      </div>

      {/* 注意書き */}
      <div className="mx-5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-[11px] text-amber-900 leading-relaxed">
          ⚠️ 受注生産品のため、注文確定後のキャンセル・返品はできません。
        </p>
      </div>

      {paymentError && (
        <p className="text-sm text-red-500 text-center mt-4">{paymentError}</p>
      )}

      {/* 固定購入バー */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-5 py-4 z-40">
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl disabled:opacity-50 tracking-wide"
        >
          {submitting ? '決済画面へ移動中...' : `¥${BODY_TYPE_PRICES[body_type].toLocaleString()}　購入する`}
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
