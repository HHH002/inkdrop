'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, LogOut, FileText, UserX, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [withdrawing, setWithdrawing] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleWithdraw() {
    if (!confirm('本当に退会しますか？\n投稿したすべてのデザインが削除されます。\nこの操作は取り消せません。')) return
    setWithdrawing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // CASCADE 設定により users 削除で designs も削除される
      await supabase.from('users').delete().eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      alert('退会処理に失敗しました')
      setWithdrawing(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/mypage" className="p-2"><ChevronLeft size={22} /></Link>
        <h1 className="text-base font-semibold">設定</h1>
      </header>

      <ul className="bg-white mt-3 divide-y divide-gray-50">
        <SettingItem href="/orders" icon={<Package size={18} />} label="注文履歴" />
        <SettingItem href="/terms" icon={<FileText size={18} />} label="利用規約" />
      </ul>

      <ul className="bg-white mt-3 divide-y divide-gray-50">
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 text-left active:bg-white"
          >
            <span className="flex items-center gap-3">
              <LogOut size={18} className="text-gray-600" />
              <span className="text-sm">ログアウト</span>
            </span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </li>
      </ul>

      <ul className="bg-white mt-3 divide-y divide-gray-50">
        <li>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="w-full flex items-center justify-between px-5 py-4 text-left active:bg-white disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              <UserX size={18} className="text-red-500" />
              <span className="text-sm text-red-500">退会する</span>
            </span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </li>
      </ul>

      <p className="px-5 py-3 text-[10px] text-gray-400">
        退会すると、投稿したすべてのデザインが削除されます。
      </p>
    </div>
  )
}

function SettingItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between px-5 py-4 active:bg-white">
        <span className="flex items-center gap-3">
          <span className="text-gray-600">{icon}</span>
          <span className="text-sm">{label}</span>
        </span>
        <ChevronRight size={16} className="text-gray-300" />
      </Link>
    </li>
  )
}
