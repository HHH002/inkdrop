'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
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
  const sp = useSearchParams()
  const supabase = createClient()

  const body_type  = sp.get('body_type')  as BodyType
  const color      = sp.get('color')       as ProductColor
  const size       = sp.get('size')        as Size
  const placement  = sp.get('placement')   as Placement
  const print_size = sp.get('print_size')  as PrintSize
  const pattern_id = sp.get('pattern_id') ?? undefined

  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('designs').select('*').eq('id', id).single()
      .then(({ data, error: err }) => {
        if (err) setError(true)
        else setDesign(data as Design)
        setLoading(false)
      })
  }, [id])

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !design) return <ErrorScreen message="データの取得に失敗しました" />

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
      setPaymentError('決済の開始に失敗しました。もう一度お試しください。')
      setSubmitting(false)
    }
  }

  const price = BODY_TYPE_PRICES[body_type]

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5] pb-40">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2"><ChevronLeft size={22} /></button>
        <h1 className="text-base font-black">確認・注文</h1>
      </header>

      {/* モックアップ */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <ProductMockup
            bodyType={body_type}
            color={color}
            designUrl={design.transparent_image_url ?? design.image_url}
            placement={mockupPlacement}
            patternId={pattern_id}
            className="aspect-square"
          />
        </div>
      </div>

      {/* デザイン情報 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3">
        <p className="text-[11px] text-gray-400 font-medium">デザイン</p>
        <p className="text-sm font-bold mt-0.5">{design.title}</p>
      </div>

      {/* 注文内容 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4 space-y-3">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">注文内容</p>
        <OrderRow label="アイテム"       value={BODY_TYPE_LABELS[body_type]} />
        <OrderRow label="カラー"         value={COLOR_LABELS[color]} />
        <OrderRow label="サイズ"         value={size} />
        <OrderRow label="配置"           value={PLACEMENT_LABELS_SHORT[placement] ?? placement} />
        <OrderRow label="プリントサイズ"  value={PRINT_SIZE_LABELS_SHORT[print_size] ?? print_size} />
      </div>

      {/* 料金 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4 space-y-2.5">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">料金</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">商品代金</span>
          <span className="font-medium">¥{price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">送料</span>
          <span className="text-gray-500">本土無料 / 離島別途</span>
        </div>
        <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-100">
          <span>合計（税込）</span>
          <span className="text-lg">¥{price.toLocaleString()}</span>
        </div>
      </div>

      {/* 注意書き */}
      <div className="mx-4 mt-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
          受注生産品のため、注文確定後のキャンセル・返品はできません。
        </p>
      </div>

      {paymentError && (
        <p className="text-sm text-red-500 text-center mt-4 px-4">{paymentError}</p>
      )}

      {/* 固定購入バー */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 pt-3 pb-6 z-40">
        <div className="flex items-center gap-1.5 justify-center mb-3">
          <ShieldCheck size={13} className="text-gray-400" />
          <span className="text-[11px] text-gray-400">Stripe による安全な決済</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="w-full py-4 bg-black text-white text-sm font-black rounded-2xl disabled:opacity-50 tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all active:scale-[0.98]"
        >
          {submitting ? '決済画面へ移動中...' : `¥${price.toLocaleString()}　購入する`}
        </button>
      </div>
    </div>
  )
}

function OrderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
