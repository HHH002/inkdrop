'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-white">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-lg font-bold mb-2">エラーが発生しました</h1>
      <p className="text-sm text-gray-500 mb-6">時間をおいて再度お試しください</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full"
      >
        再試行
      </button>
    </div>
  )
}
