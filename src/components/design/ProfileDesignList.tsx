'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  isOwner?: boolean
}

export function ProfileDesignList({ userId, isOwner = false }: Props) {
  const [sort, setSort] = useState<SortKey>('latest')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Design | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

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

  useEffect(() => { load() }, [userId, sort])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await supabase.from('designs').delete().eq('id', deleteTarget.id)
      setDesigns((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

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
        <div className="grid grid-cols-3 gap-px bg-gray-100">
          {designs.map((design) => (
            <div key={design.id} className="relative aspect-square bg-white overflow-hidden">
              <Link href={`/designs/${design.id}`} className="block w-full h-full">
                <Image
                  src={design.transparent_image_url ?? design.image_url}
                  alt={design.title}
                  width={200}
                  height={200}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </Link>
              {isOwner && (
                <button
                  onClick={() => setDeleteTarget(design)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 backdrop-blur rounded-full flex items-center justify-center"
                >
                  <Trash2 size={13} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-[480px] bg-white rounded-t-2xl px-5 py-6 space-y-4">
            <p className="text-base font-bold text-center">このデザインを削除しますか？</p>
            <p className="text-sm text-gray-500 text-center">「{deleteTarget.title}」を削除すると元に戻せません。</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3.5 bg-red-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
            >
              {deleting ? '削除中...' : '削除する'}
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="w-full py-3.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
