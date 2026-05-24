'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ShieldCheck, Check } from 'lucide-react'
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
} from '@/types'

// placement page から渡される sessionStorage の型
interface PlacementState {
  selectedFront:  string
  selectedBack:   string
  textFront:      string
  textBack:       string
  useFrontLogo:   boolean
  useBackLogo:    boolean
  logoFront:      string | null
  logoBack:       string | null
  selectedFont:   string
  textColor:      string
  textOutline:    boolean
  outlineColor:   string
}

const TEXT_ONLY_PATTERNS = new Set(['AT1','AT2','AT3','CT1','BT1','BT2','BT3'])



export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const sp      = useSearchParams()
  const supabase = createClient()

  const body_type = sp.get('body_type') as BodyType
  const color     = sp.get('color')     as ProductColor
  const size      = sp.get('size')      as Size
  const imageUrl  = sp.get('image_url') ?? undefined

  const [design,     setDesign]     = useState<Design | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front')
  const [ps, setPs] = useState<PlacementState | null>(null)

  useEffect(() => {
    // sessionStorage から配置設定を復元
    try {
      const raw = sessionStorage.getItem('inkdrop_preview')
      if (raw) setPs(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    supabase.from('designs').select('*').eq('id', id).single()
      .then(({ data, error: err }) => {
        if (err || !data) setError(true)
        else setDesign(data as Design)
        setLoading(false)
      })
  }, [id])

  if (loading) return <LoadingSpinner className="py-32" />
  // デザインデータが取れなくても image_url があれば続行（テスト時など）
  if (error && !imageUrl) return <ErrorScreen message="データの取得に失敗しました" />

  // ─── モックアップ用の値を計算 ────────────────────
  const frontPattern = ps?.selectedFront ?? 'none'
  const backPattern  = ps?.selectedBack  ?? 'none'
  const curPattern   = previewSide === 'front' ? frontPattern : backPattern

  const isLogoZone   = curPattern === 'A3'
  const isTextOnly   = TEXT_ONLY_PATTERNS.has(curPattern)
  const designSrc    = imageUrl ?? design?.transparent_image_url ?? design?.image_url

  const mockupDesignUrl =
    curPattern === 'none' ? null :
    isLogoZone             ? (previewSide === 'front' ? ps?.logoFront ?? null : ps?.logoBack ?? null) :
    isTextOnly             ? null :
    designSrc ?? null

  const curUseLogo = previewSide === 'front' ? (ps?.useFrontLogo ?? false) : (ps?.useBackLogo ?? false)
  const curText    = previewSide === 'front' ? (ps?.textFront ?? '') : (ps?.textBack ?? '')
  const curLogo    = previewSide === 'front' ? (ps?.logoFront ?? null) : (ps?.logoBack ?? null)

  const mockupPlacement: 'front' | 'one_point' | 'back' =
    previewSide === 'back' ? 'back' :
    (frontPattern === 'A' || frontPattern === 'A2' || frontPattern === 'A3') ? 'one_point' :
    'front'

  const price = BODY_TYPE_PRICES[body_type] ?? 0

  async function handleCheckout() {
    setSubmitting(true)
    setPaymentError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: id, body_type, color, size }),
      })
      if (!res.ok) throw new Error('checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setPaymentError('決済の開始に失敗しました。もう一度お試しください。')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#F7F7F7] pb-44">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 text-gray-500">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-black text-gray-900">確認・注文</h1>
        {/* ステップ表示 */}
        <span className="ml-auto mr-3 text-[11px] font-bold text-gray-400">STEP 3/3</span>
      </header>

      {/* ── モックアップ ── */}
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

          <ProductMockup
            bodyType={body_type}
            color={color}
            designUrl={mockupDesignUrl}
            patternId={curPattern !== 'none' ? curPattern : undefined}
            placement={mockupPlacement}
            className="aspect-square"
            textValue={!curUseLogo ? curText || undefined : undefined}
            textZoneLogoUrl={curUseLogo ? curLogo : null}
            textFont={ps?.selectedFont}
            textColor={ps?.textColor}
            textOutline={ps?.textOutline}
            outlineColor={ps?.outlineColor}
          />

          {/* ドットインジケーター */}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${previewSide === 'front' ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${previewSide === 'back'  ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
        </div>

        {/* フロント/バック タブ */}
        <div className="flex bg-white rounded-2xl p-1 border border-gray-200 mt-2">
          {(['front', 'back'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setPreviewSide(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                previewSide === tab ? 'bg-black text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab === 'front' ? 'フロント' : 'バック'}
            </button>
          ))}
        </div>

        {/* 現在表示ラベル */}
        <p className="text-center text-[11px] text-gray-400 font-medium mt-1.5">
          <span className="font-bold text-gray-500">{previewSide === 'front' ? 'FRONT' : 'BACK'}</span>
        </p>
      </div>

      <div className="px-4 space-y-3 mt-1">

        {/* ── デザイン情報 ── */}
        <section className="bg-white rounded-2xl px-4 py-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">デザイン</p>
          <p className="text-sm font-bold text-gray-900">{design?.title ?? '—'}</p>
        </section>

        {/* ── 注文内容 ── */}
        <section className="bg-white rounded-2xl px-4 py-4 space-y-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">注文内容</p>
          <OrderRow label="アイテム" value={BODY_TYPE_LABELS[body_type] ?? body_type} />
          <OrderRow label="カラー"   value={COLOR_LABELS[color] ?? color} />
          <OrderRow label="サイズ"   value={size} />
        </section>


        {/* ── 料金 ── */}
        <section className="bg-white rounded-2xl px-4 py-4 space-y-2.5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">料金</p>
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
            <span className="text-xl">¥{price.toLocaleString()}</span>
          </div>
        </section>


        {/* ── 同意チェックボックス ── */}
        <label className="flex items-start gap-3 cursor-pointer px-1 py-1">
          <div
            onClick={() => setAgreed(v => !v)}
            className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
              agreed ? 'bg-black border-black' : 'bg-white border-gray-300'
            }`}
          >
            {agreed && <Check size={12} strokeWidth={3} className="text-white" />}
          </div>
          <span className="text-xs text-gray-600 leading-relaxed">
            注文確定後の返品・交換・キャンセルはお受けできません。内容を確認しました。
          </span>
        </label>

        {paymentError && (
          <p className="text-sm text-red-500 text-center px-2">{paymentError}</p>
        )}

      </div>

      {/* ── 固定購入バー ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur border-t border-gray-100 px-4 pt-3 pb-8 z-50">
        <div className="flex items-center gap-1.5 justify-center mb-3">
          <ShieldCheck size={13} className="text-gray-400" />
          <span className="text-[11px] text-gray-400">Stripe による安全な決済</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={submitting || !agreed}
          className={`w-full py-4 text-sm font-black rounded-2xl tracking-wide transition-all ${
            agreed && !submitting
              ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
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
      <span className="font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  )
}
