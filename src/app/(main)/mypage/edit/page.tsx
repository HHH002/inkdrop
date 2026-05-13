'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [profileText, setProfileText] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setUserId(data.id)
        setName(data.name ?? '')
        setProfileText(data.profile_text ?? '')
        setAvatarUrl(data.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    setError(null)
    try {
      const filename = `${userId}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(filename, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filename)
      setAvatarUrl(publicUrl)
    } catch {
      setError('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!userId || !name.trim()) return
    setSaving(true)
    setError(null)
    try {
      // アカウント名の重複チェック
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('name', name.trim())
        .neq('id', userId)
        .maybeSingle()
      if (existing) {
        setError('このアカウント名は既に使われています')
        setSaving(false)
        return
      }
      const { error: updErr } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          profile_text: profileText.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', userId)
      if (updErr) throw updErr
      router.push('/mypage')
    } catch {
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner className="py-32" />

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/mypage" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-semibold">プロフィール編集</h1>
      </header>

      <div className="px-5 py-6 space-y-5">
        {/* アバター */}
        <div className="flex flex-col items-center">
          <label htmlFor="avatar" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={96} height={96} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-gray-400 text-xs">画像を選択</span>
              )}
            </div>
          </label>
          <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          {uploading && <p className="text-xs text-gray-500 mt-2">アップロード中...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">アカウント名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-[10px] text-gray-400 mt-1">他のユーザーとの重複はできません</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">プロフィール文</label>
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            maxLength={200}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
