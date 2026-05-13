import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-white">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-lg font-bold mb-2">ページが見つかりませんでした</h1>
      <p className="text-sm text-gray-500 mb-6">URLが間違っているか、削除された可能性があります</p>
      <Link href="/" className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full">
        ホームに戻る
      </Link>
    </div>
  )
}
