'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Check } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import {
  BODY_TYPE_LABELS,
  COLOR_LABELS,
  PLACEMENT_LABELS,
  PRINT_SIZE_LABELS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '@/types'
import { formatPrice, formatDateTime } from '@/lib/utils'

const STATUS_FLOW: OrderStatus[] = ['order_confirmed', 'in_production', 'shipped', 'delivered']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get('success') === '1'

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data, error: err } = await supabase
          .from('orders')
          .select('*, design:designs(*)')
          .eq('id', id)
          .single()
        if (err) throw err
        setOrder(data as Order)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !order) return <ErrorScreen message="注文情報の取得に失敗しました" />

  const currentStep = STATUS_FLOW.indexOf(order.status)

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/orders" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-semibold">配送状況</h1>
      </header>

      {showSuccess && (
        <div className="px-5 py-4 bg-green-50 border-b border-green-100">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <p className="text-sm font-medium text-green-900">注文が確定しました</p>
          </div>
        </div>
      )}

      {/* 配送ステータス */}
      <div className="px-5 py-6">
        <div className="space-y-4">
          {STATUS_FLOW.map((status, idx) => {
            const done = idx <= currentStep
            const active = idx === currentStep
            return (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <Check size={14} /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${active ? 'text-black' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                    {ORDER_STATUS_LABELS[status]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 注文内容 */}
      <div className="border-t border-gray-100 px-5 py-5">
        <h2 className="text-sm font-bold mb-3">注文内容</h2>
        <div className="flex gap-3 mb-4">
          <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
            {order.design && (
              <Image
                src={order.design.transparent_image_url ?? order.design.image_url}
                alt={order.design.title}
                width={80} height={80}
                className="w-full h-full object-contain"
                unoptimized
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{order.design?.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{BODY_TYPE_LABELS[order.body_type]}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="カラー" value={COLOR_LABELS[order.color]} />
          <Row label="サイズ" value={order.size} />
          <Row label="配置" value={PLACEMENT_LABELS[order.placement]} />
          <Row label="プリントサイズ" value={PRINT_SIZE_LABELS[order.print_size]} />
          <Row label="注文日時" value={formatDateTime(order.created_at)} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <span className="text-sm text-gray-500">合計</span>
          <span className="text-base font-bold">{formatPrice(order.price)}</span>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          受注生産品のため、キャンセル・返品はできません。
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
