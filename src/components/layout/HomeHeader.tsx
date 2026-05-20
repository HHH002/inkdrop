'use client'

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function HomeHeader() {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUnread() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnreadCount(count ?? 0)
    }
    fetchUnread()
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center justify-between">
      {/* ロゴ */}
      <span className="text-[22px] font-black tracking-tighter leading-none select-none">
        ink<span className="text-gray-400">drop</span>
      </span>

      {/* アクション */}
      <div className="flex items-center gap-1">
        <Link href="/search" className="p-2 text-gray-500">
          <Search size={20} strokeWidth={2} />
        </Link>
        <Link href="/notifications" className="relative p-2">
          <Bell size={20} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
