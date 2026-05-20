'use client'

import { useState, useEffect, useCallback } from 'react'
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

const TYPES   = Object.keys(RANKING_TYPE_LABELS)   as RankingType[]
const PERIODS = Object.keys(RANKING_PERIOD_LABELS) as RankingPeriod[]

export default function RankingPage() {
  const [type,    setType]    = useState<RankingType>('clicks')
  const [period,  setPeriod]  = useState<RankingPeriod>('all')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const supabase = createClient()

  const fetchRanking = useCallback(async () => {
    setError(false)
    try {
      const data = await queryRanking(supabase, type, period)
      setDesigns(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [type, period])

  // 初回 + タブ切り替え時（ローディング表示あり）
  useEffect(() => {
    setLoading(true)
    fetchRanking()
  }, [fetchRanking])

  // 1秒ごとに裏で静かに更新（くるくるなし）
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const data = await queryRanking(supabase, type, period)
        setDesigns(data)
      } catch { /* noop */ }
    }, 1000)
    return () => clearInterval(timer)
  }, [type, period])

  return (
    <div className="bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5] min-h-dvh">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
        <h1 className="text-base font-black tracking-tight">ランキング</h1>
      </header>

      {/* タイプタブ */}
      <div className="bg-white border-b border-gray-100 sticky top-12 z-30">
        <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                type === t
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {RANKING_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* 期間タブ */}
        <div className="flex overflow-x-auto no-scrollbar px-3 pb-2 gap-2">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                period === p
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400'
              }`}
            >
              {RANKING_PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {error   ? <ErrorScreen message="ランキングの取得に失敗しました" /> :
       loading ? <LoadingSpinner /> :
       designs.length === 0 ? (
        <div className="py-24 text-center text-sm text-gray-400">データがありません</div>
       ) : (
        <DesignGrid designs={designs} showRank />
       )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryRanking(supabase: any, type: RankingType, period: RankingPeriod): Promise<Design[]> {
  const since = getPeriodSince(period)

  // 購入数ランキング：designs.sales_count で単純ソート
  if (type === 'purchases') {
    let query = supabase
      .from('designs')
      .select('*, user:users(id,name,avatar_url)')
      .eq('copyright_status', 'approved')
      .order('sales_count', { ascending: false })
      .limit(60)
    if (since) query = query.gte('updated_at', since)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  }

  // クリック数ランキング：期間指定なし → click_count で単純ソート
  if (!since) {
    const { data, error } = await supabase
      .from('designs')
      .select('*, user:users(id,name,avatar_url)')
      .eq('copyright_status', 'approved')
      .order('click_count', { ascending: false })
      .limit(60)
    if (error) throw error
    return data ?? []
  }

  // クリック数ランキング：期間指定あり → design_click_events を集計
  // 期間内にクリックされた回数でソートしたdesign_idリストを取得
  const { data: events, error: evErr } = await supabase
    .from('design_click_events')
    .select('design_id')
    .gte('clicked_at', since)

  if (evErr) throw evErr

  if (!events || events.length === 0) return []

  // design_idごとの件数を集計
  const countMap = new Map<string, number>()
  for (const e of events) {
    countMap.set(e.design_id, (countMap.get(e.design_id) ?? 0) + 1)
  }

  // 多い順にソートしてtop 60のIDを取得
  const sortedIds = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([id]) => id)

  if (sortedIds.length === 0) return []

  // デザイン情報を取得
  const { data: designData, error: dErr } = await supabase
    .from('designs')
    .select('*, user:users(id,name,avatar_url)')
    .eq('copyright_status', 'approved')
    .in('id', sortedIds)

  if (dErr) throw dErr

  // クリック数順に並び替えて返す
  const designMap = new Map((designData ?? []).map((d: Design) => [d.id, d]))
  return sortedIds.map(id => designMap.get(id)).filter(Boolean) as Design[]
}

function getPeriodSince(period: RankingPeriod): string | null {
  if (period === 'all') return null
  const now = new Date()
  if (period === 'daily')   now.setDate(now.getDate() - 1)
  if (period === 'weekly')  now.setDate(now.getDate() - 7)
  if (period === 'monthly') now.setMonth(now.getMonth() - 1)
  return now.toISOString()
}
