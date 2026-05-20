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

interface FollowUser { id: string; name: string; avatar_url: string | null }

export default function MyPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [user,           setUser]           = useState<User | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [followingCount, setFollowingCount] = useState(0)

  const [listSheet,  setListSheet]  = useState<'following' | 'followers' | null>(null)
  const [listUsers,  setListUsers]  = useState<FollowUser[]>([])
  const [listLoading,setListLoading]= useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/auth/login?redirectTo=/mypage'); return }

      const [{ data: userData }, { count: fwing }] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', authUser.id),
      ])
      setUser(userData as User)
      setFollowingCount(fwing ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  // 1秒ごとにフォロー数を自動更新
  useEffect(() => {
    if (!user) return
    const timer = setInterval(async () => {
      const { count } = await supabase
        .from('follows').select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
      setFollowingCount(count ?? 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [user])

  const openList = useCallback(async (type: 'following' | 'followers') => {
    if (!user) return
    setListSheet(type)
    setListUsers([])
    setListLoading(true)
    if (type === 'following') {
      const { data } = await supabase.from('follows')
        .select('following:users!follows_following_id_fkey(id,name,avatar_url)')
        .eq('follower_id', user.id).order('created_at', { ascending: false })
      setListUsers((data ?? []).map((f: any) => f.following as FollowUser))
    } else {
      const { data } = await supabase.from('follows')
        .select('follower:users!follows_follower_id_fkey(id,name,avatar_url)')
        .eq('following_id', user.id).order('created_at', { ascending: false })
      setListUsers((data ?? []).map((f: any) => f.follower as FollowUser))
    }
    setListLoading(false)
  }, [user])

  if (loading || !user) return <LoadingSpinner className="py-32" />

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]">

      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center justify-between">
        <h1 className="text-base font-black">マイページ</h1>
        <div className="flex items-center gap-1">
          <Link href="/orders" className="p-1.5"><Package size={20} /></Link>
          <Link href="/settings" className="p-1.5"><Settings size={20} /></Link>
        </div>
      </header>

      {/* プロフィール */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          {/* アバター */}
          <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name} width={64} height={64}
                className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black text-gray-400">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* 名前 + bio */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black leading-tight truncate">{user.name}</h2>
            {user.profile_text && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{user.profile_text}</p>
            )}

            {/* フォロー数 */}
            <div className="flex mt-2">
              <button onClick={() => openList('following')} className="flex flex-col items-start">
                <span className="text-sm font-black leading-none">{followingCount.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">フォロー中</span>
              </button>
            </div>
          </div>
        </div>

        <Link
          href="/mypage/edit"
          className="mt-4 w-full flex items-center justify-center py-2.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700"
        >
          プロフィール編集
        </Link>
      </div>

      {/* 投稿一覧 */}
      <ProfileDesignList userId={user.id} isOwner />

      {/* フォロワー / フォロー中 リストシート */}
      {listSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setListSheet(null)}>
          <div className="w-full max-w-[480px] bg-white rounded-t-2xl overflow-hidden"
            style={{ maxHeight: '70dvh' }}
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black">
                {listSheet === 'followers' ? 'フォロワー' : 'フォロー中'}
              </h2>
              <button onClick={() => setListSheet(null)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">✕</button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70dvh - 60px)' }}>
              {listLoading ? (
                <LoadingSpinner className="py-10" />
              ) : listUsers.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  {listSheet === 'followers' ? 'フォロワーがいません' : 'フォロー中のユーザーがいません'}
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {listUsers.map(u => (
                    <Link key={u.id} href={`/profile/${u.id}`}
                      onClick={() => setListSheet(null)}
                      className="flex items-center gap-3 px-5 py-3.5 active:bg-white">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        {u.avatar_url ? (
                          <Image src={u.avatar_url} alt={u.name} width={40} height={40}
                            className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-black text-gray-400">
                            {u.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="flex-1 text-sm font-bold truncate">{u.name}</span>
                      <ChevronRight size={16} className="text-gray-300 shrink-0" />
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
