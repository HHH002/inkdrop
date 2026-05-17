'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Design } from '@/types'
import { DISPLAY_PLACEMENT_LABELS, type DisplayPlacement } from '@/types'

type SortKey = 'latest' | 'sales' | 'clicks'

const SORT_LABELS: Record<SortKey, string> = {
  latest:  '新着順',
  sales:   '売れている順',
  clicks:  'クリック数順',
}

interface Props {
  userId: string
  isOwner?: boolean
}

type Sheet =
  | { type: 'action';    design: Design }
  | { type: 'placement'; design: Design }
  | { type: 'delete';    design: Design }

export function ProfileDesignList({ userId, isOwner = false }: Props) {
  const [sort, setSort]       = useState<SortKey>('latest')
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [sheet, setSheet]     = useState<Sheet | null>(null)

  // 配置選択中の値
  const [editPlacement, setEditPlacement] = useState<DisplayPlacement>('front')
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  function openPlacement(design: Design) {
    setEditPlacement((design.display_placement as DisplayPlacement) ?? 'front')
    setSheetError(null)
    setSheet({ type: 'placement', design })
  }

  function openDelete(design: Design) {
    setSheetError(null)
    setSheet({ type: 'delete', design })
  }

  function close() { setSheet(null); setSheetError(null) }

  // 配置を保存
  async function handleSavePlacement() {
    if (!sheet || sheet.type !== 'placement') return
    setSaving(true)
    const { error } = await supabase
      .from('designs')
      .update({ display_placement: editPlacement })
      .eq('id', sheet.design.id)
      .eq('user_id', userId)
    setSaving(false)
    if (error) { setSheetError('保存に失敗しました'); return }
    setDesigns(prev =>
      prev.map(d => d.id === sheet.design.id ? { ...d, display_placement: editPlacement } : d)
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
        <div className="grid grid-cols-3 gap-px bg-gray-100">
          {designs.map(design => (
            <div key={design.id} className="relative aspect-square bg-white overflow-hidden">
              {isOwner ? (
                /* オーナーはタップでアクションシート */
                <button className="block w-full h-full" onClick={() => openAction(design)}>
                  <Image
                    src={design.transparent_image_url ?? design.image_url}
                    alt={design.title}
                    width={200} height={200}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </button>
              ) : (
                /* 他のユーザーはデザイン詳細へ */
                <Link href={`/designs/${design.id}`} className="block w-full h-full">
                  <Image
                    src={design.transparent_image_url ?? design.image_url}
                    alt={design.title}
                    width={200} height={200}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ボトムシート共通背景 ── */}
      {sheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={close}
        >
          <div
            className="w-full max-w-[480px] bg-white rounded-t-2xl px-5 pt-5 pb-8 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            {/* ── アクション選択シート ── */}
            {sheet.type === 'action' && (
              <>
                <p className="text-sm font-bold text-center pb-1">{sheet.design.title}</p>
                <button
                  onClick={() => openPlacement(sheet.design)}
                  className="w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl"
                >
                  表示配置を変更する
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

            {/* ── 配置変更シート ── */}
            {sheet.type === 'placement' && (
              <>
                <p className="text-sm font-bold text-center pb-1">表示配置を選択</p>
                <p className="text-xs text-gray-500 text-center -mt-2">ホームやランキングでの表示位置です</p>
                <div className="space-y-2 pt-1">
                  {(['one_point', 'front', 'back'] as DisplayPlacement[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setEditPlacement(p)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors ${
                        editPlacement === p
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        editPlacement === p ? 'border-black' : 'border-gray-300'
                      }`}>
                        {editPlacement === p && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                      <span className="text-sm font-medium">{DISPLAY_PLACEMENT_LABELS[p]}</span>
                    </button>
                  ))}
                </div>
                {sheetError && <p className="text-xs text-red-500 text-center">{sheetError}</p>}
                <button
                  onClick={handleSavePlacement}
                  disabled={saving}
                  className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-50"
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

            {/* ── 削除確認シート ── */}
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
