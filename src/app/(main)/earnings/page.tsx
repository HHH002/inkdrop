'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  EARNINGS_PERIOD_LABELS,
  BODY_TYPE_LABELS,
  PLACEMENT_LABELS,
  type EarningsPeriod,
  type CreatorBalance,
  type DesignSalesSummary,
  type SoldItem,
  type Design,
} from '@/types'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface DesignRanking extends DesignSalesSummary {
  design?: Design
}

export default function EarningsPage() {
  const [balance, setBalance] = useState<CreatorBalance | null>(null)
  const [period, setPeriod] = useState<EarningsPeriod>('all')
  const [salesCount, setSalesCount] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [ranking, setRanking] = useState<DesignRanking[]>([])
  const [soldItems, setSoldItems] = useState<SoldItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 残高は期間に依存しない
        const { data: cb } = await supabase
          .from('creator_balances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        setBalance(cb as CreatorBalance | null)

        // 期間フィルター
        const since = getPeriodSince(period)

        // 期間ごとの sold_items
        let soldQuery = supabase
          .from('sold_items')
          .select('*')
          .eq('user_id', user.id)
          .order('sold_at', { ascending: false })
        if (since) soldQuery = soldQuery.gte('sold_at', since)
        const { data: sold } = await soldQuery
        setSoldItems((sold ?? []) as SoldItem[])

        setSalesCount(sold?.length ?? 0)
        setTotalIncome((sold ?? []).reduce((acc, s) => acc + (s.creator_reward ?? 0), 0))

        // デザイン売れ筋ランキング上位 (上位5)
        const { data: rk } = await supabase
          .from('design_sales_summary')
          .select('*, design:designs(*)')
          .eq('user_id', user.id)
          .order('sales_count', { ascending: false })
          .limit(5)
        setRanking((rk ?? []) as DesignRanking[])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
        <h1 className="text-base font-semibold">収益</h1>
      </header>

      {error ? <ErrorScreen message="取得に失敗しました" /> :
       loading ? <LoadingSpinner /> : (
        <>
          {/* 収入残高（最上部・期間に依存しない） */}
          <div className="bg-black text-white px-5 py-6 m-4 rounded-2xl">
            <p className="text-xs text-gray-300 mb-1">収入残高（振込可能）</p>
            <p className="text-3xl font-bold">{formatPrice(balance?.available_balance ?? 0)}</p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-gray-300">
              <div>
                <p>発送前（未確定）</p>
                <p className="text-white text-sm font-semibold mt-0.5">{formatPrice(balance?.pending_balance ?? 0)}</p>
              </div>
              <div className="text-right">
                <p>振込申請中</p>
                <p className="text-white text-sm font-semibold mt-0.5">{formatPrice(balance?.payout_requested_balance ?? 0)}</p>
              </div>
            </div>
          </div>

          {/* 期間フィルター */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(Object.keys(EARNINGS_PERIOD_LABELS) as EarningsPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    period === p ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  {EARNINGS_PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* 販売数・総収入 */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">販売数</p>
              <p className="text-xl font-bold">{salesCount}<span className="text-sm font-normal text-gray-500">枚</span></p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">総収入</p>
              <p className="text-xl font-bold">{formatPrice(totalIncome)}</p>
            </div>
          </div>

          {/* デザイン売れ筋ランキング */}
          <div className="px-4 pb-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold">デザイン売れ筋</h2>
                <Link href="/earnings/ranking" className="text-xs text-gray-500 flex items-center">
                  詳しく見る <ChevronRight size={14} />
                </Link>
              </div>
              {ranking.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">まだデータがありません</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {ranking.map((r) => (
                    <div key={r.id} className="text-xs">
                      <div className="aspect-square bg-white rounded-lg overflow-hidden mb-1">
                        {r.design && (
                          <Image
                            src={r.design.transparent_image_url ?? r.design.image_url}
                            alt={r.design.title}
                            width={120} height={120}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                      <p className="font-semibold truncate">{r.design?.title}</p>
                      <p className="text-gray-500 mt-0.5">{r.sales_count} / {r.max_sales_count}枚</p>
                      <ProgressBar current={r.sales_count} max={r.max_sales_count} />
                      <p className="text-gray-700 mt-1 font-medium">{formatPrice(r.earnings_amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 売れたもの一覧 */}
          <div className="px-4 pb-4">
            <div className="bg-white rounded-xl">
              <h2 className="text-sm font-bold px-4 pt-4 pb-2">売れたもの一覧</h2>
              {soldItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">まだ売上がありません</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {soldItems.map((s) => (
                    <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{s.design_title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {BODY_TYPE_LABELS[s.body_type]} ／ {PLACEMENT_LABELS[s.placement]}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(s.sold_at)}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(s.creator_reward)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 振込申請エリア */}
          <div className="px-4 pb-6">
            <Link
              href="/earnings/payout"
              className="block bg-white rounded-xl px-4 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold">振込申請</p>
                <p className="text-xs text-gray-500 mt-0.5">残高を口座に振り込む</p>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function getPeriodSince(period: EarningsPeriod): string | null {
  if (period === 'all') return null
  const now = new Date()
  if (period === 'daily') now.setDate(now.getDate() - 1)
  if (period === 'weekly') now.setDate(now.getDate() - 7)
  if (period === 'monthly') now.setMonth(now.getMonth() - 1)
  return now.toISOString()
}
