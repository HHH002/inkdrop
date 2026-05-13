'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DesignGrid } from '@/components/design/DesignGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import {
  RANKING_TYPE_LABELS,
  RANKING_PERIOD_LABELS,
  type RankingType,
  type RankingPeriod,
  type Design,
} from '@/types'

export default function RankingPage() {
  const [type, setType] = useState<RankingType>('sales')
  const [period, setPeriod] = useState<RankingPeriod>('all')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true)
      setError(false)
      try {
        // 期間フィルター
        const since = getPeriodSince(period)

        // 並び替えカラム
        const orderColumn =
          type === 'sales' ? 'sales_count' :
          type === 'clicks' ? 'click_count' :
          type === 'purchases' ? 'sales_count' :
          'click_count' // trending は簡易的にクリック数で（TODO: 急上昇の正確な計算）

        let query = supabase
          .from('designs')
          .select('*, user:users(id,name,avatar_url)')
          .eq('copyright_status', 'approved')
          .order(orderColumn, { ascending: false })
          .limit(60)

        if (since) query = query.gte('created_at', since)

        const { data, error: err } = await query
        if (err) throw err
        setDesigns(data ?? [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchRanking()
  }, [type, period])

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
        <h1 className="text-base font-semibold">ランキング</h1>
      </header>

      {/* 種類タブ */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-white border-b border-gray-50">
        {(Object.keys(RANKING_TYPE_LABELS) as RankingType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              type === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {RANKING_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* 期間タブ */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar bg-white border-b border-gray-100">
        {(Object.keys(RANKING_PERIOD_LABELS) as RankingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${
              period === p ? 'bg-gray-900 text-white' : 'text-gray-500'
            }`}
          >
            {RANKING_PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorScreen message="ランキングの取得に失敗しました" />
      ) : loading ? (
        <LoadingSpinner />
      ) : designs.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">データがありません</div>
      ) : (
        <DesignGrid designs={designs} />
      )}
    </div>
  )
}

function getPeriodSince(period: RankingPeriod): string | null {
  if (period === 'all') return null
  const now = new Date()
  if (period === 'daily') now.setDate(now.getDate() - 1)
  if (period === 'weekly') now.setDate(now.getDate() - 7)
  if (period === 'monthly') now.setMonth(now.getMonth() - 1)
  return now.toISOString()
}
