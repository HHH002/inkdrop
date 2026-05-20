'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import {
  type CreatorBalance,
  type PayoutRequest,
  type PayoutStatus,
} from '@/types'
import { formatPrice, formatDateTime } from '@/lib/utils'

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  requested: '申請中',
  processing: '処理中',
  paid: '振込済み',
  rejected: '却下',
}

export default function PayoutPage() {
  const [balance, setBalance] = useState<CreatorBalance | null>(null)
  const [history, setHistory] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: cb }, { data: hist }] = await Promise.all([
        supabase.from('creator_balances').select('*').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('payout_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])
      setBalance(cb as CreatorBalance | null)
      setHistory((hist ?? []) as PayoutRequest[])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleRequest() {
    if (!balance || balance.available_balance <= 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const amount = balance.available_balance
      const { error: insErr } = await supabase.from('payout_requests').insert({
        user_id: user.id,
        amount,
        status: 'requested',
      })
      if (insErr) throw insErr

      // 残高を移動
      await supabase
        .from('creator_balances')
        .update({
          available_balance: 0,
          payout_requested_balance: (balance.payout_requested_balance ?? 0) + amount,
        })
        .eq('user_id', user.id)

      await load()
    } catch {
      setSubmitError('振込申請に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/earnings" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-semibold">振込申請</h1>
      </header>

      {error ? <ErrorScreen message="取得に失敗しました" onRetry={load} /> :
       loading ? <LoadingSpinner /> : (
        <>
          {/* 振込可能残高 */}
          <div className="bg-white m-4 rounded-2xl p-5">
            <p className="text-xs text-gray-500">振込可能残高</p>
            <p className="text-3xl font-bold mt-1">{formatPrice(balance?.available_balance ?? 0)}</p>
          </div>

          {/* 振込先情報 */}
          <div className="bg-white mx-4 rounded-2xl p-5">
            <h2 className="text-sm font-bold mb-3">振込先口座</h2>
            <div className="text-xs text-gray-500">
              {/* TODO: 銀行口座連携機能を実装 */}
              <p>銀行口座が登録されていません</p>
              <button className="mt-2 text-black font-medium underline" disabled>
                口座を登録（実装予定）
              </button>
            </div>
          </div>

          {/* 申請ボタン */}
          {submitError && <p className="text-sm text-red-500 text-center my-3">{submitError}</p>}
          <div className="px-4 mt-4">
            <button
              onClick={handleRequest}
              disabled={submitting || !balance || balance.available_balance <= 0}
              className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
            >
              {submitting ? '申請中...' : '振込を申請する'}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-2">
              申請後、運営が確認のうえ振込処理を行います
            </p>
          </div>

          {/* 申請履歴 */}
          <div className="px-4 mt-6 pb-8">
            <h2 className="text-sm font-bold mb-2">申請履歴</h2>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">履歴がありません</p>
            ) : (
              <div className="bg-white rounded-xl divide-y divide-gray-50">
                {history.map((p) => (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{formatPrice(p.amount)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(p.requested_at)}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'paid' ? 'bg-green-50 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {PAYOUT_STATUS_LABELS[p.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
