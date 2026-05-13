'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'upload' | 'copyright_check' | 'meta' | 'submitting' | 'done'

export default function UploadPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function runCopyrightCheck() {
    if (!file) return
    setStep('copyright_check')
    setError(null)
    try {
      // TODO: 実際のAI著作権チェックAPIに置き換え
      // 現状はモック（2秒待って承認）
      await new Promise((r) => setTimeout(r, 1500))
      setStep('meta')
    } catch {
      setError('著作権チェックに失敗しました')
      setStep('upload')
    }
  }

  async function handleSubmit() {
    if (!file || !title.trim()) return
    setStep('submitting')
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const filename = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filename, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(filename)

      // TODO: AIによる背景透過処理を実装。現状は同じURLを使用
      const { data: design, error: insertError } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          image_url: publicUrl,
          transparent_image_url: publicUrl,
          copyright_status: 'approved',
        })
        .select()
        .single()
      if (insertError) throw insertError

      // 販売サマリーも作成
      await supabase.from('design_sales_summary').insert({
        design_id: design.id,
        user_id: user.id,
      })

      setStep('done')
      setTimeout(() => router.push(`/designs/${design.id}`), 800)
    } catch (e) {
      setError('投稿に失敗しました')
      setStep('meta')
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/post" className="p-2">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-base font-semibold">完成デザインを投稿</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* 画像アップロード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">デザイン画像</label>
          <label
            htmlFor="file"
            className="block aspect-square w-full bg-gray-50 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-200"
          >
            {previewUrl ? (
              <Image src={previewUrl} alt="プレビュー" width={400} height={400} className="w-full h-full object-contain" unoptimized />
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon size={36} className="mx-auto mb-2" />
                <p className="text-xs">画像を選択</p>
              </div>
            )}
          </label>
          <input id="file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* 著作権チェック中 */}
        {step === 'copyright_check' && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
            <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-purple-900 font-medium">AI著作権チェック中...</p>
          </div>
        )}

        {/* タイトル・説明（チェック後） */}
        {(step === 'meta' || step === 'submitting') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                デザイン名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                placeholder="例：BLACK CROSS"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="デザインの説明を入力"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-sm font-medium">投稿しました</p>
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* アクションボタン */}
        {step === 'upload' && (
          <button
            onClick={runCopyrightCheck}
            disabled={!file}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
          >
            次へ（AIチェック）
          </button>
        )}
        {step === 'meta' && (
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
          >
            投稿する
          </button>
        )}
        {step === 'submitting' && (
          <button
            disabled
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl opacity-50"
          >
            投稿中...
          </button>
        )}
      </div>
    </div>
  )
}
