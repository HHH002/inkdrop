export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className ?? 'py-16'}`}>
      <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  )
}
