'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DesignGrid } from './DesignGrid'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Design } from '@/types'

type SortKey = 'latest' | 'sales' | 'clicks'

const SORT_LABELS: Record<SortKey, string> = {
  latest: '新着順',
  sales: '売れている順',
  clicks: 'クリック数順',
}

interface Props {
  userId: string
}

export function ProfileDesignList({ userId }: Props) {
  const [sort, setSort] = useState<SortKey>('latest')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const orderColumn = sort === 'sales' ? 'sales_count' : sort === 'clicks' ? 'click_count' : 'created_at'
      const { data } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', userId)
        .order(orderColumn, { ascending: false })
      setDesigns((data ?? []) as Design[])
      setLoading(false)
    }
    load()
  }, [userId, sort])

  return (
    <div>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-100">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${
              sort === s ? 'bg-black text-white' : 'text-gray-500 bg-gray-50'
            }`}
          >
            {SORT_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> :
       designs.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">まだ投稿がありません</div>
      ) : (
        <DesignGrid designs={designs} />
      )}
    </div>
  )
}
