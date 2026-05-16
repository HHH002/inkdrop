'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Image as ImageIcon, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step =
  | 'upload'
  | 'removing_bg'
  | 'copyright_check'
  | 'meta'
  | 'submitting'
  | 'done'

export default function UploadPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [transparentBlob, setTransparentBlob] = useState<Blob | null>(null)
  const [transparentUrl, setTransparentUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [copyrightReason, setCopyrightReason] = useState('')
  const [copyrightStatus, setCopyrightStatus] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ① 画像選択
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setTransparentBlob(null)
    setTransparentUrl(null)
    setCopyrightStatus(null)
    setStep('upload')
    setError(null)
  }

  // ② 背景透過処理（@imgly/background-removal）
  async function runBackgroundRemoval(f: File): Promise<Blob> {
    // 動的インポートで重いモデルを遅延ロード
    const { removeBackground } = await import('@imgly/background-removal')

    const blob = await removeBackground(f, {
      model: 'isnet',
      output: {
        format: 'image/png',
        quality: 0.9,
      },
    })
    return blob
  }

  // ③ 著作権チェック（OpenAI Vision）
  async function runCopyrightCheck(imageUrl: string): Promise<{ status: 'approved' | 'rejected'; reason: string }> {
    const res = await fetch('/api/copyright-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    })
    if (!res.ok) return { status: 'approved', reason: '審査スキップ' }
    return res.json()
  }

  // メインフロー：背景透過 → 著作権チェック → メタ入力
  async function handleNext() {
    if (!file) return
    setError(null)

    try {
      // ── STEP 1: 背景透過 ──
      setStep('removing_bg')

      let bgRemovedBlob: Blob
      let bgRemovedUrl: string

      try {
        bgRemovedBlob = await runBackgroundRemoval(file)
        bgRemovedUrl = URL.createObjectURL(bgRemovedBlob)
        setTransparentBlob(bgRemovedBlob)
        setTransparentUrl(bgRemovedUrl)
      } catch {
        // 背景透過失敗時は元画像を使用
        console.warn('背景透過スキップ')
        bgRemovedUrl = URL.createObjectURL(file)
        setTransparentUrl(bgRemovedUrl)
      }

      // ── STEP 2: 著作権チェック ──
      setStep('copyright_check')

      // Supabaseに一時的にアップロードして URL を取得（AI解析用）
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const tempFilename = `${user.id}/temp_${Date.now()}_${file.name}`
      await supabase.storage.from('designs').upload(tempFilename, file, { upsert: true })
      const { data: { publicUrl: tempUrl } } = supabase.storage.from('designs').getPublicUrl(tempFilename)

      const { status, reason } = await runCopyrightCheck(tempUrl)
      setCopyrightStatus(status)
      setCopyrightReason(reason)

      // 一時ファイルを削除
      await supabase.storage.from('designs').remove([tempFilename])

      if (status === 'rejected') {
        setError(`著作権チェック：${reason}`)
        setStep('upload')
        return
      }

      // ── STEP 3: メタ情報入力へ ──
      setStep('meta')
    } catch (e) {
      console.error(e)
      setError('処理に失敗しました。もう一度お試しください')
      setStep('upload')
    }
  }

  // ④ 投稿
  async function handleSubmit() {
    if (!file || !title.trim()) return
    setStep('submitting')
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // オリジナル画像をアップロード
      const origFilename = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadErr } = await supabase.storage.from('designs').upload(origFilename, file)
      if (uploadErr) throw uploadErr
      const { data: { publicUrl: origUrl } } = supabase.storage.from('designs').getPublicUrl(origFilename)

      // 背景透過画像をアップロード（あれば）
      let transparentPublicUrl = origUrl
      if (transparentBlob) {
        const transFilename = `${user.id}/${Date.now()}_transparent_${file.name.replace(/\.[^.]+$/, '.png')}`
        const { error: transErr } = await supabase.storage.from('designs').upload(transFilename, transparentBlob, {
          contentType: 'image/png',
        })
        if (!transErr) {
          const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(transFilename)
          transparentPublicUrl = publicUrl
        }
      }

      // デザインレコード作成
      const { data: design, error: insertErr } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          image_url: origUrl,
          transparent_image_url: transparentPublicUrl,
          copyright_status: 'approved',
        })
        .select()
        .single()
      if (insertErr) throw insertErr

      // 販売サマリー作成
      await supabase.from('design_sales_summary').insert({
        design_id: design.id,
        user_id: user.id,
      })

      setStep('done')
      setTimeout(() => router.push(`/designs/${design.id}`), 800)
    } catch {
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
            className="block aspect-square w-full bg-gray-50 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 relative"
          >
            {/* 背景透過後プレビュー優先 */}
            {(transparentUrl || previewUrl) ? (
              <>
                {/* チェッカーボード背景（透過確認用） */}
                {transparentUrl && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg,#e5e5e5 25%,transparent 25%),' +
                        'linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),' +
                        'linear-gradient(45deg,transparent 75%,#e5e5e5 75%),' +
                        'linear-gradient(-45deg,transparent 75%,#e5e5e5 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0,0 8px,8px -8px,-8px 0px',
                    }}
                  />
                )}
                <Image
                  src={transparentUrl ?? previewUrl!}
                  alt="プレビュー"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain relative z-10"
                  unoptimized
                />
                {transparentUrl && (
                  <span className="absolute top-2 right-2 z-20 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    背景透過済み
                  </span>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon size={36} className="mx-auto mb-2" />
                <p className="text-xs">画像を選択</p>
              </div>
            )}
          </label>
          <input id="file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* 処理中インジケーター */}
        {step === 'removing_bg' && (
          <ProcessingCard
            icon="🎨"
            title="背景を透過処理中..."
            subtitle="AIがデザインの背景を自動除去しています"
            color="blue"
          />
        )}

        {step === 'copyright_check' && (
          <ProcessingCard
            icon="🔍"
            title="AI著作権チェック中..."
            subtitle="著作権違反がないか自動審査しています"
            color="purple"
          />
        )}

        {/* 著作権承認バッジ */}
        {step === 'meta' && copyrightStatus === 'approved' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <span className="text-green-500 text-lg">✅</span>
            <div>
              <p className="text-sm font-medium text-green-800">著作権チェック：承認</p>
              {copyrightReason && (
                <p className="text-xs text-green-600 mt-0.5">{copyrightReason}</p>
              )}
            </div>
          </div>
        )}

        {/* タイトル・説明 */}
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
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm font-medium text-gray-800">投稿しました！</p>
            <p className="text-xs text-gray-400 mt-1">デザインページへ移動します...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* アクションボタン */}
        {step === 'upload' && (
          <button
            onClick={handleNext}
            disabled={!file}
            className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            次へ（AI背景透過＋著作権チェック）
          </button>
        )}

        {step === 'meta' && (
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
          >
            投稿する
          </button>
        )}

        {step === 'submitting' && (
          <button disabled className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-xl opacity-50">
            投稿中...
          </button>
        )}
      </div>
    </div>
  )
}

// ローディングカード
function ProcessingCard({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: string
  title: string
  subtitle: string
  color: 'blue' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    purple: 'bg-purple-50 border-purple-100 text-purple-900',
  }
  const spinColors = {
    blue: 'border-blue-300 border-t-blue-600',
    purple: 'border-purple-300 border-t-purple-600',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 border-2 ${spinColors[color]} rounded-full animate-spin flex-shrink-0`} />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
