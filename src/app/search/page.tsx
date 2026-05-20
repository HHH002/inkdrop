'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DesignGrid } from '@/components/design/DesignGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Design } from '@/types'

export default function SearchPage() {
  const router = useRouter()
  const supabase = createClient()

  const [query, setQuery]     = useState('')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setDesigns([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    const { data } = await supabase
      .from('designs')
      .select('*, user:users(id,name,avatar_url)')
      .eq('copyright_status', 'approved')
      .eq('is_sales_stopped', false)
      .ilike('title', `%${q.trim()}%`)
      .order('sales_count', { ascending: false })
      .limit(60)
    setDesigns((data ?? []) as Design[])
    setLoading(false)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSearch(query)
  }

  function handleClear() {
    setQuery('')
    setDesigns([])
    setSearched(false)
  }

  return (
    <div className="min-h-dvh bg-white">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 text-gray-600 shrink-0">
          <ChevronLeft size={22} />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white rounded-xl px-3 h-8 gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="デザインを検索"
              autoFocus
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={handleClear} className="shrink-0 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="shrink-0 text-sm font-bold text-black disabled:text-gray-400 px-1"
          >
            検索
          </button>
        </form>
      </header>

      {/* コンテンツ */}
      {loading ? (
        <LoadingSpinner />
      ) : searched && designs.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-gray-400">「{query}」の検索結果はありません</p>
        </div>
      ) : designs.length > 0 ? (
        <>
          <p className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium">{designs.length}件</p>
          <DesignGrid designs={designs} />
        </>
      ) : (
        <div className="py-24 text-center">
          <Search size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">デザイン名で検索できます</p>
        </div>
      )}
    </div>
  )
}
