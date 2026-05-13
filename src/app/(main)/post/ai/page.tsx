'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Image as ImageIcon, Send, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'upload' | 'chat' | 'copyright_check' | 'meta' | 'submitting' | 'done'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
}

export default function AiPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOriginalPreview(URL.createObjectURL(f))
  }

  async function startAiCorrection() {
    if (!file) return
    setStep('chat')
    setAiLoading(true)
    try {
      // TODO: 実際のAI補正APIを呼び出し（線修正・輪郭整え・背景透過）
      await new Promise((r) => setTimeout(r, 1800))
      setAiResultUrl(originalPreview)
      setMessages([{ role: 'ai', text: 'AIで補正しました。修正したい点があればチャットで指示してください。' }])
    } catch {
      setError('AI補正に失敗しました')
      setStep('upload')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || aiLoading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setAiLoading(true)
    try {
      // TODO: 実際のAIチャット補正APIを呼び出し
      await new Promise((r) => setTimeout(r, 1200))
      setMessages((prev) => [...prev, { role: 'ai', text: '補正しました。引き続き修正点があればお知らせください。' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: '補正に失敗しました。もう一度お試しください。' }])
    } finally {
      setAiLoading(false)
    }
  }

  async function runCopyrightCheck() {
    setStep('copyright_check')
    setError(null)
    try {
      // TODO: 実際のAI著作権チェックAPIに置き換え
      await new Promise((r) => setTimeout(r, 1500))
      setStep('meta')
    } catch {
      setError('著作権チェックに失敗しました')
      setStep('chat')
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
    <div className="min-h-dvh bg-white flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-2 h-12 flex items-center gap-2">
        <Link href="/post" className="p-2">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-base font-semibold flex items-center gap-1.5">
          <Sparkles size={16} /> AIで仕上げて投稿
        </h1>
      </header>

      {step === 'upload' && (
        <div className="px-5 py-6 space-y-5 flex-1">
          <p className="text-xs text-gray-500 leading-relaxed">
            手書きやラフ画像をアップロードしてください。AIが線を整え、商品レベルのデザインに仕上げます。
          </p>
          <label
            htmlFor="aifile"
            className="block aspect-square w-full bg-gray-50 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-200"
          >
            {originalPreview ? (
              <Image src={originalPreview} alt="プレビュー" width={400} height={400} className="w-full h-full object-contain" unoptimized />
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon size={36} className="mx-auto mb-2" />
                <p className="text-xs">手書き・ラフ画像を選択</p>
              </div>
            )}
          </label>
          <input id="aifile" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            onClick={startAiCorrection}
            disabled={!file}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
          >
            AIで仕上げる
          </button>
        </div>
      )}

      {step === 'chat' && (
        <>
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="aspect-video bg-white rounded-xl overflow-hidden flex items-center justify-center">
              {aiResultUrl && (
                <Image src={aiResultUrl} alt="AI補正" width={400} height={300} className="w-full h-full object-contain" unoptimized />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-3 py-2 space-y-2 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="修正したい点を入力（例：線を太く）"
                className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || aiLoading}
                className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
            <button
              onClick={runCopyrightCheck}
              className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl"
            >
              これで決定（著作権チェックへ）
            </button>
          </div>
        </>
      )}

      {step === 'copyright_check' && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium">AI著作権チェック中...</p>
          </div>
        </div>
      )}

      {(step === 'meta' || step === 'submitting' || step === 'done') && (
        <div className="px-5 py-6 space-y-5 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              デザイン名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {step === 'done' ? (
            <div className="text-center py-4"><p className="text-3xl mb-2">✅</p><p className="text-sm">投稿しました</p></div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || step === 'submitting'}
              className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-30"
            >
              {step === 'submitting' ? '投稿中...' : '投稿する'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
