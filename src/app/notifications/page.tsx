'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import type { Notification } from '@/types'
import { formatDateTime } from '@/lib/utils'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error: err } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (err) throw err
        setNotifications(data as Notification[])

        // 既読化
        const unread = (data ?? []).filter((n) => !n.read).map((n) => n.id)
        if (unread.length > 0) {
          await supabase.from('notifications').update({ read: true }).in('id', unread)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-black">通知</h1>
      </header>

      {error ? <ErrorScreen message="取得に失敗しました" /> :
       loading ? <LoadingSpinner /> :
       notifications.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">通知はありません</div>
      ) : (
        <ul className="divide-y divide-gray-50 bg-white mt-3 mx-3 rounded-2xl overflow-hidden">
          {notifications.map((n) => (
            <li key={n.id} className={`px-5 py-4 ${!n.read ? 'bg-white' : ''}`}>
              {!n.read && <span className="inline-block w-1.5 h-1.5 bg-black rounded-full mr-2 mb-0.5 align-middle" />}
              <span className="text-sm font-medium">{n.message}</span>
              <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
