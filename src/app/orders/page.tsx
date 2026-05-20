'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import {
  BODY_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  type Order,
} from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

const STATUS_COLOR: Record<string, string> = {
  order_confirmed: 'bg-gray-100 text-gray-700',
  in_production: 'bg-yellow-50 text-yellow-700',
  shipped: 'bg-green-50 text-green-700',
  delivered: 'bg-gray-100 text-gray-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error: err } = await supabase
          .from('orders')
          .select('*, design:designs(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (err) throw err
        setOrders(data as Order[])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/mypage" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-semibold">注文履歴</h1>
      </header>

      {error ? <ErrorScreen message="取得に失敗しました" /> :
       loading ? <LoadingSpinner /> :
       orders.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">注文履歴がありません</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((o) => (
            <Link href={`/orders/${o.id}`} key={o.id} className="flex items-center gap-3 px-4 py-3 active:bg-white">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                {o.design && (
                  <Image
                    src={o.design.transparent_image_url ?? o.design.image_url}
                    alt={o.design.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{o.design?.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {BODY_TYPE_LABELS[o.body_type]} ／ {o.size}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatDate(o.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold">{formatPrice(o.price)}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
