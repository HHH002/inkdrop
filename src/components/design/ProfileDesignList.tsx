'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Design } from '@/types'

type SortKey = 'latest' | 'sales' | 'clicks'

const SORT_LABELS: Record<SortKey, string> = {
  latest: '新着順',
  sales:  '売れている順',
  clicks: 'クリック数順',
}

interface Props {
  userId: string
  isOwner?: boolean
}

type Sheet =
  | { type: 'action'; design: Design }
  | { type: 'rename'; design: Design }
  | { type: 'delete'; design: Design }

export function ProfileDesignList({ userId, isOwner = false }: Props) {
  const [sort, setSort]       = useState<SortKey>('latest')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [sheet, setSheet]     = useState<Sheet | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [sheetError, setSheetError] = useState<string | null>(null)

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const col = sort === 'sales' ? 'sales_count' : sort === 'clicks' ? 'click_count' : 'created_at'
    const { data } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', userId)
      .order(col, { ascending: false })
    setDesigns((data ?? []) as Design[])
    setLoading(false)
  }

  useEffect(() => { load() }, [userId, sort])

  function openAction(design: Design) {
    setSheetError(null)
    setSheet({ type: 'action', design })
  }

  function openRename(design: Design) {
    setEditTitle(design.title)
    setSheetError(null)
    setSheet({ type: 'rename', design })
  }

  function openDelete(design: Design) {
    setSheetError(null)
    setSheet({ type: 'delete', design })
  }

  function close() { setSheet(null); setSheetError(null) }

  // タイトル変更を保存
  async function handleSaveRename() {
    if (!sheet || sheet.type !== 'rename') return
    const trimmed = editTitle.trim()
    if (!trimmed) { setSheetError('タイトルを入力してください'); return }
    setSaving(true)
    const { error } = await supabase
      .from('designs')
      .update({ title: trimmed })
      .eq('id', sheet.design.id)
      .eq('user_id', userId)
    setSaving(false)
    if (error) { setSheetError('保存に失敗しました'); return }
    setDesigns(prev =>
      prev.map(d => d.id === sheet.design.id ? { ...d, title: trimmed } : d)
    )
    close()
  }

  // 削除
  async function handleDelete() {
    if (!sheet || sheet.type !== 'delete') return
    setDeleting(true)
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', sheet.design.id)
      .eq('user_id', userId)
    setDeleting(false)
    if (error) { setSheetError('削除に失敗しました'); return }
    setDesigns(prev => prev.filter(d => d.id !== sheet.design.id))
    close()
  }

  return (
    <div>
      {/* ソートタブ */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-100">
        {(Object.keys(SORT_LABELS) as SortKey[]).map(s => (
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

      {loading ? <LoadingSpinner /> : designs.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">まだ投稿がありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-3 py-3">
          {designs.map(design => (
            <div key={design.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              {isOwner ? (
                <button className="block w-full" onClick={() => openAction(design)}>
                  <div className="aspect-square bg-[#F7F7F7] relative">
                    <Image
                      src={design.transparent_image_url ?? design.image_url}
                      alt={design.title}
                      fill
                      className="object-contain p-3"
                      unoptimized
                    />
                    {design.copyright_status === 'pending' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded-full">審査中</span>
                      </div>
                    )}
                    {design.copyright_status === 'rejected' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-600 text-[10px] font-bold bg-white px-2 py-1 rounded-full">非承認</span>
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-bold text-gray-800 truncate leading-tight">{design.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{design.sales_count}sold</p>
                  </div>
                </button>
              ) : (
                <Link href={`/designs/${design.id}`} className="block">
                  <div className="aspect-square bg-[#F7F7F7] relative">
                    <Image
                      src={design.transparent_image_url ?? design.image_url}
                      alt={design.title}
                      fill
                      className="object-contain p-3"
                      unoptimized
                    />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-bold text-gray-800 truncate leading-tight">{design.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{design.sales_count}sold</p>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ボトムシート */}
      {sheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={close}
        >
          <div
            className="w-full max-w-[480px] bg-white rounded-t-2xl px-5 pt-5 pb-8 space-y-3"
            onClick={e => e.stopPropagation()}
          >

            {/* アクション選択シート */}
            {sheet.type === 'action' && (
              <>
                <p className="text-sm font-bold text-center pb-1 truncate">{sheet.design.title}</p>
                <button
                  onClick={() => openRename(sheet.design)}
                  className="w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl"
                >
                  ネーム変更
                </button>
                <button
                  onClick={() => openDelete(sheet.design)}
                  className="w-full py-3.5 bg-red-500 text-white text-sm font-semibold rounded-xl"
                >
                  削除する
                </button>
                <button
                  onClick={close}
                  className="w-full py-3.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl"
                >
                  キャンセル
                </button>
              </>
            )}

            {/* ネーム変更シート */}
            {sheet.type === 'rename' && (
              <>
                <p className="text-sm font-bold text-center pb-1">ネーム変更</p>
                <div className="relative">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value.slice(0, 50))}
                    placeholder="デザイン名を入力"
                    autoFocus
                    className="w-full px-4 py-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
                    {editTitle.length}/50
                  </span>
                </div>
                {sheetError && <p className="text-xs text-red-500 text-center">{sheetError}</p>}
                <button
                  onClick={handleSaveRename}
                  disabled={saving || !editTitle.trim()}
                  className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-xl disabled:opacity-40"
                >
                  {saving ? '保存中...' : '保存する'}
                </button>
                <button
                  onClick={() => setSheet({ type: 'action', design: sheet.design })}
                  className="w-full py-3.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl"
                >
                  戻る
                </button>
              </>
            )}

            {/* 削除確認シート */}
            {sheet.type === 'delete' && (
              <>
                <p className="text-base font-bold text-center">このデザインを削除しますか？</p>
                <p className="text-sm text-gray-500 text-center">「{sheet.design.title}」を削除すると元に戻せません。</p>
                {sheetError && <p className="text-xs text-red-500 text-center bg-red-50 rounded-xl py-2">{sheetError}</p>}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full py-3.5 bg-red-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {deleting ? '削除中...' : '削除する'}
                </button>
                <button
                  onClick={() => setSheet({ type: 'action', design: sheet.design })}
                  className="w-full py-3.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl"
                >
                  戻る
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
