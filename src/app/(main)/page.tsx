'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HomeHeader } from '@/components/layout/HomeHeader'
import { DesignGrid } from '@/components/design/DesignGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import type { Design } from '@/types'

type Tab = 'latest' | 'following' | 'history'

const TABS: { id: Tab; label: string }[] = [
  { id: 'latest',    label: '新着'     },
  { id: 'following', label: 'フォロー' },
  { id: 'history',   label: '閲覧履歴' },
]

const PAGE_SIZE = 30

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('latest')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const fetchDesigns = useCallback(async (currentTab: Tab, currentPage: number) => {
    setLoading(true)
    setError(false)
    try {
      const from = currentPage * PAGE_SIZE
      const to   = from + PAGE_SIZE - 1

      if (currentTab === 'latest') {
        const { data, error: err } = await supabase
          .from('designs')
          .select('*, user:users(id,name,avatar_url)')
          .eq('copyright_status', 'approved')
          .eq('is_sales_stopped', false)
          .order('created_at', { ascending: false })
          .range(from, to)
        if (err) throw err
        setDesigns(prev => currentPage === 0 ? (data ?? []) : [...prev, ...(data ?? [])])
        setHasMore((data?.length ?? 0) === PAGE_SIZE)

      } else if (currentTab === 'following') {
        if (!userId) { setDesigns([]); setLoading(false); return }
        const { data: follows } = await supabase
          .from('follows').select('following_id').eq('follower_id', userId)
        const ids = follows?.map(f => f.following_id) ?? []
        if (ids.length === 0) { setDesigns([]); setHasMore(false); setLoading(false); return }
        const { data, error: err } = await supabase
          .from('designs')
          .select('*, user:users(id,name,avatar_url)')
          .in('user_id', ids)
          .eq('copyright_status', 'approved')
          .order('created_at', { ascending: false })
          .range(from, to)
        if (err) throw err
        setDesigns(prev => currentPage === 0 ? (data ?? []) : [...prev, ...(data ?? [])])
        setHasMore((data?.length ?? 0) === PAGE_SIZE)

      } else {
        if (!userId) { setDesigns([]); setLoading(false); return }
        const { data, error: err } = await supabase
          .from('views')
          .select('design:designs(*, user:users(id,name,avatar_url))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(from, to)
        if (err) throw err
        const unique = new Map<string, Design>()
        data?.forEach(v => {
          const d = v.design as unknown as Design
          if (d && !unique.has(d.id)) unique.set(d.id, d)
        })
        const deduped = Array.from(unique.values())
        setDesigns(prev => currentPage === 0 ? deduped : [...prev, ...deduped])
        setHasMore((data?.length ?? 0) === PAGE_SIZE)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    setDesigns([])
    setPage(0)
    setHasMore(true)
    fetchDesigns(tab, 0)
  }, [tab, userId])

  // 1秒ごとに裏で先頭だけ静かに更新（くるくるなし）
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('designs')
          .select('*, user:users(id,name,avatar_url)')
          .eq('copyright_status', 'approved')
          .eq('is_sales_stopped', false)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1)
        if (data) setDesigns(prev => [...(data as Design[]), ...prev.slice(PAGE_SIZE)])
      } catch { /* noop */ }
    }, 1000)
    return () => clearInterval(timer)
  }, [tab])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1
        setPage(next)
        fetchDesigns(tab, next)
      }
    }, { threshold: 0.1 })
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loading, page, tab, fetchDesigns])

  const emptyMessage =
    tab === 'following' && !userId  ? 'ログインするとフォロー中のデザインを見られます' :
    tab === 'following'             ? 'フォロー中のデザインはありません' :
    tab === 'history'   && !userId  ? 'ログインすると閲覧履歴が記録されます' :
    tab === 'history'               ? '閲覧履歴がありません' :
                                      'デザインがありません'

  return (
    <div className="bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5] min-h-dvh">
      <HomeHeader />

      {/* タブ */}
      <div className="flex bg-white border-b border-gray-100 sticky top-12 z-30">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
              tab === id ? 'text-black' : 'text-gray-400'
            }`}
          >
            {label}
            {tab === id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full" />
            )}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorScreen message="データの取得に失敗しました" onRetry={() => fetchDesigns(tab, 0)} />
      ) : (
        <>
          {designs.length === 0 && !loading ? (
            <div className="py-24 text-center">
              <p className="text-sm text-gray-400">{emptyMessage}</p>
            </div>
          ) : (
            <DesignGrid designs={designs} />
          )}
          {loading && <LoadingSpinner />}
          <div ref={sentinelRef} className="h-4" />
        </>
      )}
    </div>
  )
}
