'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import { ProfileDesignList } from '@/components/design/ProfileDesignList'
import type { User } from '@/types'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [user,          setUser]          = useState<User | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isFollowing,   setIsFollowing]   = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: u }, { data: { user: me } }] = await Promise.all([
          supabase.from('users').select('*').eq('id', id).single(),
          supabase.auth.getUser(),
        ])
        if (!u) throw new Error('not found')
        setUser(u as User)
        setCurrentUserId(me?.id ?? null)

        if (me && me.id !== id) {
          const { data: f } = await supabase
            .from('follows').select('id')
            .eq('follower_id', me.id).eq('following_id', id).maybeSingle()
          setIsFollowing(!!f)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function toggleFollow() {
    if (!currentUserId || !user) { router.push('/auth/login'); return }
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId).eq('following_id', user.id)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: user.id })
      setIsFollowing(true)
    }
  }

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !user) return <ErrorScreen message="ユーザーが見つかりませんでした" />

  const isSelf = currentUserId === user.id

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2"><ChevronLeft size={22} /></button>
        <h1 className="text-base font-black">{user.name}</h1>
      </header>

      <div className="px-5 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black truncate">{user.name}</h2>
            {user.profile_text && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{user.profile_text}</p>
            )}
          </div>
        </div>

        {/* フォローボタン（自分以外にのみ表示） */}
        {!isSelf && (
          <button
            onClick={toggleFollow}
            className={`mt-4 w-full py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${
              isFollowing
                ? 'border-gray-200 text-gray-600 bg-white'
                : 'border-black bg-black text-white'
            }`}
          >
            {isFollowing ? 'フォロー中' : 'フォロー'}
          </button>
        )}
      </div>

      <ProfileDesignList userId={user.id} />
    </div>
  )
}
