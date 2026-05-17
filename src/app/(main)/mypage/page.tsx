'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, Package, Edit3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProfileDesignList } from '@/components/design/ProfileDesignList'
import type { User } from '@/types'

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login?redirectTo=/mypage')
        return
      }
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser(data as User)
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !user) return <LoadingSpinner className="py-32" />

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center justify-between">
        <h1 className="text-base font-semibold">マイページ</h1>
        <div className="flex items-center gap-1">
          <Link href="/orders" className="p-1.5">
            <Package size={20} />
          </Link>
          <Link href="/settings" className="p-1.5">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* プロフィール */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
            {user.avatar_url && (
              <Image src={user.avatar_url} alt={user.name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user.name}</h2>
            {user.profile_text && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed whitespace-pre-wrap">{user.profile_text}</p>
            )}
          </div>
        </div>
        <Link
          href="/mypage/edit"
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-sm font-medium"
        >
          <Edit3 size={14} />
          プロフィール編集
        </Link>
      </div>

      {/* 投稿一覧 */}
      <ProfileDesignList userId={user.id} isOwner />
    </div>
  )
}
