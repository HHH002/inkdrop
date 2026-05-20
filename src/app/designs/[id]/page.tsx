'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import { ProductMockup } from '@/components/design/ProductMockup'
import {
  BODY_TYPE_LABELS,
  BODY_TYPE_COLORS,
  COLOR_LABELS,
  COLOR_HEX,
  SIZE_LABELS,
  BODY_TYPE_PRICES,
  type Design,
  type BodyType,
  type ProductColor,
  type Size,
  type User,
} from '@/types'

const BODY_TYPES = Object.keys(BODY_TYPE_LABELS) as BodyType[]
const SIZES: Size[] = ['S', 'M', 'L', 'XL']

export default function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [design, setDesign] = useState<Design | null>(null)
  const [designer, setDesigner] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [bodyType, setBodyType] = useState<BodyType>('tshirt')
  const [color, setColor] = useState<ProductColor>(BODY_TYPE_COLORS['tshirt'][0]) // 黒がデフォルト
  const [size, setSize] = useState<Size | null>(null)

  const [carouselIndex, setCarouselIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const CAROUSEL_PATTERNS = [
    { patternId: 'A',   label: 'ワンポイント',     placement: 'one_point' as const },
    { patternId: 'C2',  label: 'センタープリント',   placement: 'front'     as const },
    { patternId: 'B1',  label: 'バックプリント',    placement: 'back'      as const },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: d, error: err } = await supabase
          .from('designs')
          .select('*, user:users(*)')
          .eq('id', id)
          .single()
        if (err) throw err
        setDesign(d as Design)
        setDesigner((d as Design).user ?? null)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserId(user.id)
          const { count } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id)
            .eq('following_id', (d as Design).user_id)
          setIsFollowing((count ?? 0) > 0)
          await supabase.from('views').insert({ user_id: user.id, design_id: id })
        }


      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // ボディタイプ変更時に対応カラーの先頭にリセット
  useEffect(() => {
    const available = BODY_TYPE_COLORS[bodyType]
    if (!available.includes(color)) setColor(available[0])
  }, [bodyType])

  async function toggleFollow() {
    if (!currentUserId || !designer) return
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId).eq('following_id', designer.id)
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: designer.id })
    }
    setIsFollowing(!isFollowing)
  }

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !design) return <ErrorScreen message="デザインが見つかりませんでした" onRetry={() => router.refresh()} />

  const availableColors = BODY_TYPE_COLORS[bodyType]
  const isReady = size != null
  const price = BODY_TYPE_PRICES[bodyType]

  const remaining = design.max_sales_count - design.sales_count
  const soldOutPct = design.max_sales_count > 0 ? design.sales_count / design.max_sales_count : 0
  const isAlmostSoldOut = remaining <= Math.ceil(design.max_sales_count * 0.15) && remaining > 0

  function handleProceed() {
    if (!isReady) return
    const p = new URLSearchParams({ body_type: bodyType, color: color, size: size! })
    const imgUrl = design!.transparent_image_url ?? design!.image_url
    if (imgUrl) p.set('image_url', imgUrl)
    if (design!.title) p.set('design_name', design!.title)
    router.push(`/designs/${id}/placement?${p.toString()}`)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5] pb-36">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-2 h-12 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="p-2 text-gray-700">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigator.share?.({ title: design.title, url: window.location.href })}
            className="p-2 text-gray-500"
          >
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* クリエイター情報 */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <Link href={`/profile/${designer?.id ?? ''}`} className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
            {designer?.avatar_url ? (
              <Image src={designer.avatar_url} alt={designer.name} width={40} height={40}
                className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-500">
                {designer?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{designer?.name ?? ''}</p>
            <p className="text-xs text-gray-400 truncate">{design.title}</p>
          </div>
        </Link>
        {currentUserId && designer && currentUserId !== designer.id && (
          <button
            onClick={toggleFollow}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
              isFollowing
                ? 'border-gray-200 bg-white text-gray-600'
                : 'border-black bg-black text-white'
            }`}
          >
            {isFollowing ? 'フォロー中' : 'フォロー'}
          </button>
        )}
      </div>

      {/* メインビジュアル：スワイプカルーセル */}
      <div className="px-3">
        {/* スライドコンテナ */}
        <div
          className="rounded-3xl overflow-hidden bg-white relative border border-gray-200"
          onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={e => {
            if (touchStartX === null) return
            const diff = touchStartX - e.changedTouches[0].clientX
            if (diff > 50 && carouselIndex < CAROUSEL_PATTERNS.length - 1) setCarouselIndex(i => i + 1)
            if (diff < -50 && carouselIndex > 0) setCarouselIndex(i => i - 1)
            setTouchStartX(null)
          }}
        >
          {/* スライドトラック */}
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {CAROUSEL_PATTERNS.map(({ patternId, placement }) => {
              const previewColor = color ?? 'white'
              return (
                <div key={patternId} className="w-full shrink-0 aspect-square">
                  <ProductMockup
                    bodyType={bodyType}
                    color={previewColor as ProductColor}
                    placement={placement}
                    className="w-full h-full"
                  />
                </div>
              )
            })}
          </div>

          {/* 左矢印 */}
          {carouselIndex > 0 && (
            <button
              onClick={() => setCarouselIndex(i => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
          )}

          {/* 右矢印 */}
          {carouselIndex < CAROUSEL_PATTERNS.length - 1 && (
            <button
              onClick={() => setCarouselIndex(i => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
          )}
        </div>

        {/* ドット＋ラベル */}
        <div className="mt-2.5 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            {CAROUSEL_PATTERNS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`rounded-full transition-all ${
                  i === carouselIndex ? 'w-4 h-2 bg-black' : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-gray-700">{CAROUSEL_PATTERNS[carouselIndex].label}</p>
          <p className="text-[10px] text-gray-400">※イメージです。パターンは選べます。</p>
        </div>
      </div>

      {/* 販売残数バー */}
      {design.max_sales_count > 0 && (
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">販売数 {design.sales_count} / {design.max_sales_count}</span>
            {isAlmostSoldOut && (
              <span className="text-xs font-bold text-red-500">残り{remaining}枚</span>
            )}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${soldOutPct > 0.85 ? 'bg-red-500' : 'bg-black'}`}
              style={{ width: `${Math.min(soldOutPct * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 説明文 */}
      {design.description && (
        <div className="px-4 pt-4">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{design.description}</p>
        </div>
      )}

      {/* カスタマイズ */}
      <div className="px-4 pt-5 space-y-6">

        {/* アイテム選択 */}
        <div>
          <SectionLabel title="アイテム" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {BODY_TYPES.map((bt) => (
              <button
                key={bt}
                onClick={() => setBodyType(bt)}
                className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                  bodyType === bt
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-600 bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]'
                }`}
              >
                {BODY_TYPE_LABELS[bt]}
              </button>
            ))}
          </div>
        </div>

        {/* カラー選択 */}
        <div>
          <SectionLabel title="カラー" />
          <div className="flex gap-4 mt-2">
            {availableColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    color === c ? 'border-black scale-110 shadow-md' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                />
                <span className={`text-xs font-medium ${color === c ? 'text-black' : 'text-gray-500'}`}>
                  {COLOR_LABELS[c]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* サイズ選択 */}
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel title="サイズ" />
            <span className="text-[11px] text-gray-400">少し大きめ（S = 通常M相当）</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                  size === s
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-600 bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {size && (
            <p className="text-xs text-gray-400 mt-2 text-center">{SIZE_LABELS[size]}</p>
          )}
        </div>

      </div>

      {/* 固定購入バー */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]/95 backdrop-blur border-t border-gray-100 px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] text-gray-400">送料無料（本土）</p>
            <p className="text-xl font-black text-gray-900">
              ¥{price.toLocaleString()}
              <span className="text-xs font-normal text-gray-500 ml-1">税込</span>
            </p>
          </div>
          <button
            onClick={handleProceed}
            disabled={!isReady}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black tracking-wide transition-all ${
              isReady
                ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isReady ? '配置を選ぶ →' : '選択してください'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ title }: { title: string }) {
  return <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</h3>
}
