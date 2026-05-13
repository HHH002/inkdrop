interface Props {
  current: number
  max: number
}

export function ProgressBar({ current, max }: Props) {
  const percent = Math.min(100, (current / max) * 100)
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-black rounded-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
