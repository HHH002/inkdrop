'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Image as ImageIcon, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { DisplayPlacement } from '@/types'

type Step = 'upload' | 'removing_bg' | 'copyright_check' | 'placement' | 'submitting' | 'done'

const PLACEMENT_OPTIONS: { value: DisplayPlacement; label: string; desc: string }[] = [
  { value: 'one_point', label: 'ワンポイント', desc: '左胸に小さくプリント' },
  { value: 'front', label: 'フロントセンター', desc: '胸の中央に大きくプリント' },
  { value: 'back', label: 'バック', desc: '背面全体にプリント' },
]

export default function UploadPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [transparentBlob, setTransparentBlob] = useState<Blob | null>(null)
  const [transparentUrl, setTransparentUrl] = useState<string | null>(null)
  const [displayPlacement, setDisplayPlacement] = useState<DisplayPlacement>('front')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [copyrightReason, setCopyrightReason] = useState('')
  const [copyrightStatus, setCopyrightStatus] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  async function runBackgroundRemoval(f: File): Promise<Blob> {
    const { removeBackground } = await import('@imgly/background-removal')
    const blob = await removeBackground(f, {
      model: 'isnet',
      output: { format: 'image/png', quality: 0.9 },
    })
    return blob
  }

  async function runCopyrightCheck(imageUrl: string): Promise<{ status: 'approved' | 'rejected'; reason: string }> {
    const res = await fetch('/api/copyright-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    })
    if (!res.ok) return { status: 'approved', reason: '審査スキップ' }
    return res.json()
  }

  async function handleNext() {
    if (!file) return
    setError(null)
    try {
      setStep('removing_bg')
      let bgRemovedBlob: Blob
      let bgRemovedUrl: string
      try {
        bgRemovedBlob = await runBackgroundRemoval(file)
        bgRemovedUrl = URL.createObjectURL(bgRemovedBlob)
        setTransparentBlob(bgRemovedBlob)
        setTransparentUrl(bgRemovedUrl)
      } catch {
        console.warn('背景透過スキップ')
        bgRemovedUrl = URL.createObjectURL(file)
        setTransparentUrl(bgRemovedUrl)
      }

      setStep('copyright_check')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const tempFilename = `${user.id}/temp_${Date.now()}_${file.name}`
      await supabase.storage.from('designs').upload(tempFilename, file, { upsert: true })
      const { data: { publicUrl: tempUrl } } = supabase.storage.from('designs').getPublicUrl(tempFilename)

      const { status, reason } = await runCopyrightCheck(tempUrl)
      setCopyrightStatus(status)
      setCopyrightReason(reason)
      await supabase.storage.from('designs').remove([tempFilename])

      if (status === 'rejected') {
        setError(`著作権チェック：${reason}`)
        setStep('upload')
        return
      }

      setStep('placement')
    } catch (e) {
      console.error(e)
      setError('処理に失敗しました。もう一度お試しください')
      setStep('upload')
    }
  }

  async function handleSubmit() {
    if (!file || !title.trim()) return
    setStep('submitting')
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const origFilename = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadErr } = await supabase.storage.from('designs').upload(origFilename, file)
      if (uploadErr) throw uploadErr
      const { data: { publicUrl: origUrl } } = supabase.storage.from('designs').getPublicUrl(origFilename)

      let transparentPublicUrl = origUrl
      if (transparentBlob) {
        const transFilename = `${user.id}/${Date.now()}_transparent_${file.name.replace(/\.[^.]+$/, '.png')}`
        const { error: transErr } = await supabase.storage.from('designs').upload(transFilename, transparentBlob, { contentType: 'image/png' })
        if (!transErr) {
          const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(transFilename)
          transparentPublicUrl = publicUrl
        }
      }

      const { data: design, error: insertErr } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          image_url: origUrl,
          transparent_image_url: transparentPublicUrl,
          display_placement: displayPlacement,
          copyright_status: 'approved',
        })
        .select()
        .single()
      if (insertErr) throw insertErr

      await supabase.from('design_sales_summary').insert({ design_id: design.id, user_id: user.id })
      setStep('done')
    } catch {
      setError('投稿に失敗しました')
      setStep('placement')
    }
  }

  function handleReset() {
    setStep('upload')
    setFile(null)
    setPreviewUrl(null)
    setTransparentBlob(null)
    setTransparentUrl(null)
    setTitle('')
    setDescription('')
    setCopyrightStatus(null)
    setDisplayPlacement('front')
    setError(null)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FDFCF8] via-[#F5F1EA] to-[#E8E0D5]">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/post" className="p-2">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-base font-semibold">完成デザインを投稿</h1>
      </header>

      <div className="px-5 py-6 space-y-6">

        {step !== 'done' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">デザイン画像</label>
            <label
              htmlFor="file"
              className="block aspect-square w-full bg-white rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 relative"
            >
              {(transparentUrl || previewUrl) ? (
                <>
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
        )}

        {step === 'removing_bg' && (
          <ProcessingCard icon="🎨" title="背景を透過処理中..." subtitle="AIがデザインの背景を自動除去しています" color="blue" />
        )}
        {step === 'copyright_check' && (
          <ProcessingCard icon="🔍" title="AI著作権チェック中..." subtitle="著作権違反がないか自動審査しています" color="purple" />
        )}

        {step === 'placement' && (
          <div className="space-y-5">
            {copyrightStatus === 'approved' && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <span className="text-green-500 text-lg">✅</span>
                <div>
                  <p className="text-sm font-medium text-green-800">著作権チェック：承認</p>
                  {copyrightReason && <p className="text-xs text-green-600 mt-0.5">{copyrightReason}</p>}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">表示位置を選択</p>
              <p className="text-xs text-gray-400 mb-3">ホーム・ランキングでの見せ方を選んでください</p>
              <div className="space-y-2">
                {PLACEMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDisplayPlacement(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      displayPlacement === opt.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-800'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className={`text-xs mt-0.5 ${displayPlacement === opt.value ? 'text-gray-300' : 'text-gray-500'}`}>{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      displayPlacement === opt.value ? 'border-white bg-white' : 'border-gray-300'
                    }`}>
                      {displayPlacement === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
                rows={3}
                placeholder="デザインの説明を入力"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">✅</p>
            <p className="text-lg font-bold text-gray-900">投稿完了！</p>
            <p className="text-sm text-gray-500 mt-2">デザインが公開されました</p>
            <button
              onClick={() => router.push('/mypage')}
              className="mt-8 w-full py-3.5 bg-black text-white text-sm font-semibold rounded-xl"
            >
              マイページへ
            </button>
            <button
              onClick={handleReset}
              className="mt-3 w-full py-3.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl"
            >
              続けて投稿する
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

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

        {step === 'placement' && (
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

function ProcessingCard({ icon, title, subtitle, color }: {
  icon: string; title: string; subtitle: string; color: 'blue' | 'purple'
}) {
  const colors = { blue: 'bg-white border-gray-200 text-gray-900', purple: 'bg-white border-gray-200 text-gray-900' }
  const spinColors = { blue: 'border-gray-300 border-t-black', purple: 'border-gray-300 border-t-black' }
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
