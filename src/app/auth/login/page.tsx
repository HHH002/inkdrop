'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    })
    if (error) {
      setError('Googleログインに失敗しました')
      setLoading(false)
    }
  }

  async function handleAppleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    })
    if (error) {
      setError('Appleログインに失敗しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 py-12 bg-white">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-black">inkdrop</h1>
        <p className="mt-2 text-sm text-gray-500">デザインを投稿・販売するプラットフォーム</p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400">
          <span className="bg-white px-3">または</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Googleでログイン
        </button>

        <button
          onClick={handleAppleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >
          <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor">
            <path d="M13.769 10.357c-.022-2.146 1.752-3.185 1.833-3.236-1-1.46-2.557-1.66-3.113-1.683-1.327-.135-2.592.782-3.264.782-.672 0-1.708-.764-2.808-.743-1.444.021-2.78.838-3.524 2.126C1.33 10.222 2.28 14.282 3.84 16.5c.768 1.098 1.681 2.328 2.88 2.283 1.155-.045 1.591-.74 2.989-.74 1.397 0 1.788.74 3.007.716 1.246-.02 2.032-1.118 2.796-2.22.882-1.271 1.244-2.502 1.265-2.567-.028-.012-2.43-.929-2.454-3.681-.022-2.299 1.879-3.407 1.965-3.453C14.927 8.04 13.79 7.97 13.769 10.357zM11.273 4.27c.637-.773 1.069-1.845.951-2.915-.919.037-2.031.612-2.692 1.382-.59.682-1.11 1.777-.97 2.826 1.024.08 2.072-.519 2.711-1.293z"/>
          </svg>
          Appleでログイン
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        アカウントをお持ちでない方は{' '}
        <Link href="/auth/signup" className="text-black font-semibold underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
