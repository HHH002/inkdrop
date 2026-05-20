'use client'

import Link from 'next/link'
import { Sparkles, Upload } from 'lucide-react'

export default function PostSelectPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
        <h1 className="text-base font-semibold">投稿</h1>
      </header>

      <div className="px-5 py-6">
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          投稿方法を選んでください。<br />
          投稿前にAIが自動で著作権チェックを行います。
        </p>

        <Link
          href="/post/upload"
          className="block bg-white border border-gray-200 rounded-2xl p-5 mb-4 active:bg-white transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <Upload size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-base mb-1">完成デザインを投稿</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                すでに完成しているデザイン画像をそのまま投稿します。透明背景は自動処理されます。
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/post/ai"
          className="block bg-white border border-gray-200 rounded-2xl p-5 active:bg-white transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-base mb-1">AIで仕上げて投稿</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                手書きやラフをアップロードし、AIチャットで線を整えて商品レベルのデザインに仕上げます。
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
