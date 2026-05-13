interface Props {
  message?: string
  onRetry?: () => void
}

export function ErrorScreen({ message = 'エラーが発生しました', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full"
        >
          再試行
        </button>
      )}
    </div>
  )
}
