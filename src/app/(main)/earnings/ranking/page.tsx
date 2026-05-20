'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  EARNINGS_PERIOD_LABELS,
  type EarningsPeriod,
  type Design,
  type DesignSalesSummary,
} from '@/types'
import { formatPrice } from '@/lib/utils'

interface DesignRanking extends DesignSalesSummary {
  design?: Design
}

export default function EarningsRankingPage() {
  const [period, setPeriod] = useState<EarningsPeriod>('all')
  const [items, setItems] = useState<DesignRanking[]>([])
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
        // 期間フィルターは TODO（design_sales_summary は累計値）
        // 簡易的に sold_items から期間別販売数を計算する
        const { data } = await supabase
          .from('design_sales_summary')
          .select('*, design:designs(*)')
          .eq('user_id', user.id)
          .order('sales_count', { ascending: false })
        setItems((data ?? []) as DesignRanking[])
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/earnings" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-semibold">デザイン売れ筋ランキング</h1>
      </header>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {(Object.keys(EARNINGS_PERIOD_LABELS) as EarningsPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              period === p ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {EARNINGS_PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {error ? <ErrorScreen message="取得に失敗しました" /> :
       loading ? <LoadingSpinner /> :
       items.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">まだ販売実績がありません</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((r, idx) => (
            <li key={r.id} className="px-4 py-3 flex items-center gap-3">
              <span className="w-7 text-center text-sm font-bold text-gray-700">{idx + 1}</span>
              <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                {r.design && (
                  <Image
                    src={r.design.transparent_image_url ?? r.design.image_url}
                    alt={r.design.title}
                    width={56} height={56}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.design?.title}</p>
                <p className="text-xs text-gray-500">{r.sales_count} / {r.max_sales_count}枚 ・ 残り{r.remaining_sales_count}枚</p>
                <div className="mt-1.5"><ProgressBar current={r.sales_count} max={r.max_sales_count} /></div>
              </div>
              <span className="text-sm font-semibold shrink-0">{formatPrice(r.earnings_amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
