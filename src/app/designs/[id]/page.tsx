'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
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
  FIXED_PRICE,
  type Design,
  type BodyType,
  type ProductColor,
  type Size,
  type User,
} from '@/types'

export default function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [design, setDesign] = useState<Design | null>(null)
  const [designer, setDesigner] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [bodyType, setBodyType] = useState<BodyType | null>(null)
  const [color, setColor] = useState<ProductColor | null>(null)
  const [size, setSize] = useState<Size | null>(null)

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

        try {
          const { error: rpcErr } = await supabase.rpc('increment_design_click', { design_id: id })
          if (rpcErr) {
            await supabase.from('designs').update({ click_count: ((d as Design).click_count ?? 0) + 1 }).eq('id', id)
          }
        } catch { /* noop */ }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
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

  useEffect(() => {
    if (bodyType && color && !BODY_TYPE_COLORS[bodyType].includes(color)) {
      setColor(null)
    }
  }, [bodyType])

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !design) return <ErrorScreen message="デザインが見つかりませんでした" onRetry={() => router.refresh()} />

  const isReady = bodyType && color && size
  const availableColors = bodyType ? BODY_TYPE_COLORS[bodyType] : (Object.keys(COLOR_HEX) as ProductColor[])

  const handleProceedToPlacement = () => {
    if (!isReady) return
    const p = new URLSearchParams({ body_type: bodyType, color, size })
    if (design.transparent_image_url ?? design.image_url) {
      p.set('image_url', design.transparent_image_url ?? design.image_url)
    }
    router.push(`/designs/${id}/placement?${p.toString()}`)
  }

  return (
    <div className="min-h-dvh bg-white pb-8">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-2 h-12 flex items-center">
        <button onClick={() => router.back()} className="p-2"><ChevronLeft size={22} /></button>
      </header>

      {/* 投稿者情報 */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Link href={`/profile/${designer?.id ?? ''}`} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
            {designer?.avatar_url && (
              <Image src={designer.avatar_url} alt={designer.name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{designer?.name ?? ''}</p>
            <p className="text-xs text-gray-500 mt-0.5">{design.title}</p>
          </div>
        </Link>
      </div>

      {/* メインプレビュー */}
      <div className="px-4">
        {bodyType && color ? (
          <ProductMockup
            bodyType={bodyType}
            color={color}
            designUrl={design.transparent_image_url ?? design.image_url}
            placement="front"
            className="aspect-square"
          />
        ) : (
          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8">
            <Image
              src={design.transparent_image_url ?? design.image_url}
              alt={design.title}
              width={400}
              height={400}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* 説明文 */}
      {design.description && (
        <div className="px-5 py-4 border-t border-gray-50">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{design.description}</p>
        </div>
      )}

      {/* 購入設定 */}
      <div className="border-t border-gray-100 px-5 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">商品をカスタマイズ</h2>
          <span className="text-lg font-bold">
            ¥{FIXED_PRICE.toLocaleString()}
            <span className="text-xs font-normal text-gray-500 ml-1">税込</span>
          </span>
        </div>

        <Section title="アイテム">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BODY_TYPE_LABELS) as BodyType[]).map((bt) => (
              <button
                key={bt}
                onClick={() => setBodyType(bt)}
                className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                  bodyType === bt ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700'
                }`}
              >
                {BODY_TYPE_LABELS[bt]}
              </button>
            ))}
          </div>
        </Section>

        <Section title="カラー">
          <div className="flex gap-3 flex-wrap">
            {availableColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-12 h-12 rounded-full border-2 transition-colors ${color === c ? 'border-black' : 'border-gray-200'}`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                />
                <span className="text-xs text-gray-600">{COLOR_LABELS[c]}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="サイズ" subtitle="サイズ感は少し大きめです（Sが一般的なM相当）">
          <div className="grid grid-cols-4 gap-2">
            {(['S', 'M', 'L', 'XL'] as Size[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                  size === s ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {size && <p className="text-xs text-gray-500 mt-2">{SIZE_LABELS[size]}</p>}
        </Section>

        <div className="pt-2">
          <button
            onClick={handleProceedToPlacement}
            disabled={!isReady}
            className="w-full py-3.5 bg-blue-500 text-white text-sm font-semibold rounded-xl disabled:opacity-30 transition-opacity"
          >
            {isReady ? '次へ：配置を選ぶ' : 'アイテム・カラー・サイズを選んでください'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-[11px] text-gray-500 mb-2">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}
