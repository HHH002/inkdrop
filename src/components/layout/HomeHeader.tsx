'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
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
      <span className="text-xl font-bold tracking-tight">inkdrop</span>
      <Link href="/notifications" className="relative p-1">
        <Bell size={22} strokeWidth={1.7} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
