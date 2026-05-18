'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, Package, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProfileDesignList } from '@/components/design/ProfileDesignList'
import type { User } from '@/types'

interface FollowUser {
  id: string
  name: string
  avatar_url: string | null
}

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [followCount, setFollowCount] = useState(0)
  const [followUsers, setFollowUsers] = useState<FollowUser[]>([])
  const [showFollowSheet, setShowFollowSheet] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login?redirectTo=/mypage')
        return
      }
      const [{ data: userData }, { count }] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', authUser.id),
      ])
      setUser(userData as User)
      setFollowCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const openFollowSheet = useCallback(async () => {
    if (!user) return
    setShowFollowSheet(true)
    if (followUsers.length > 0) return
    setFollowLoading(true)
    const { data } = await supabase
      .from('follows')
      .select('following:users!follows_following_id_fkey(id,name,avatar_url)')
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false })
    setFollowUsers(
      (data ?? []).map((f: any) => f.following as FollowUser)
    )
    setFollowLoading(false)
  }, [user, followUsers.length])

  if (loading || !user) return <LoadingSpinner className="py-32" />

  return (
    <div className="min-h-dvh bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center justify-between">
        <h1 className="text-base font-semibold">マイページ</h1>
        <div className="flex items-center gap-1">
          <Link href="/orders" className="p-1.5"><Package size={20} /></Link>
          <Link href="/settings" className="p-1.5"><Settings size={20} /></Link>
        </div>
      </header>

      {/* プロフィール */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
            {user.avatar_url && (
              <Image src={user.avatar_url} alt={user.name} width={64} height={64}
                className="w-full h-full object-cover" unoptimized />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold leading-tight">{user.name}</h2>
            {user.profile_text && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{user.profile_text}</p>
            )}
          </div>
          {/* フォローカウント */}
          <button
            onClick={openFollowSheet}
            className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="text-base font-bold leading-none">{followCount}</span>
            <span className="text-[11px] text-gray-500">フォロー</span>
          </button>
        </div>
        <Link
          href="/mypage/edit"
          className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          プロフィール編集
        </Link>
      </div>

      {/* 投稿一覧 */}
      <ProfileDesignList userId={user.id} isOwner />

      {/* フォロー中リスト シート */}
      {showFollowSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowFollowSheet(false)}
        >
          <div
            className="w-full max-w-[480px] bg-white rounded-t-2xl overflow-hidden"
            style={{ maxHeight: '70dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* シートヘッダー */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">フォロー中</h2>
              <button
                onClick={() => setShowFollowSheet(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
              >✕</button>
            </div>

            {/* リスト */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70dvh - 60px)' }}>
              {followLoading ? (
                <LoadingSpinner className="py-10" />
              ) : followUsers.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">フォロー中のユーザーがいません</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {followUsers.map(fu => (
                    <Link
                      key={fu.id}
                      href={`/profile/${fu.id}`}
                      onClick={() => setShowFollowSheet(false)}
                      className="flex items-center gap-3 px-5 py-3.5 active:bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        {fu.avatar_url && (
                          <Image src={fu.avatar_url} alt={fu.name} width={40} height={40}
                            className="w-full h-full object-cover" unoptimized />
                        )}
                      </div>
                      <span className="flex-1 text-sm font-semibold">{fu.name}</span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
