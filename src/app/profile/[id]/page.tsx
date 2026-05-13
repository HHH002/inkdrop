'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

  const [user, setUser] = useState<User | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
            .from('follows')
            .select('id')
            .eq('follower_id', me.id)
            .eq('following_id', id)
            .maybeSingle()
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
    if (!currentUserId || !user) {
      router.push('/auth/login')
      return
    }
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', user.id)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: user.id,
      })
      setIsFollowing(true)
    }
  }

  if (loading) return <LoadingSpinner className="py-32" />
  if (error || !user) return <ErrorScreen message="ユーザーが見つかりませんでした" />

  const isSelf = currentUserId === user.id

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2"><ChevronLeft size={22} /></button>
        <h1 className="text-base font-semibold">{user.name}</h1>
      </header>

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

        {!isSelf && (
          <button
            onClick={toggleFollow}
            className={`mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isFollowing
                ? 'border border-gray-200 text-gray-700'
                : 'bg-black text-white'
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
