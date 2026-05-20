import Link from 'next/link'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import type { Design } from '@/types'

interface Props {
  design: Design
  rank?: number
  priority?: boolean
}

export function DesignCard({ design, rank, priority }: Props) {
  function handleClick() {
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design_id: design.id }),
    }).catch(() => {})
  }

  return (
    <Link
      href={`/designs/${design.id}`}
      onClick={handleClick}
      className="block bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.10)] active:scale-[0.98] transition-transform"
    >
      {/* 画像エリア */}
      <div className="aspect-square bg-[#F7F7F7] relative overflow-hidden">
        <Image
          src={design.transparent_image_url ?? design.image_url}
          alt={design.title}
          fill
          className="object-contain p-3"
          unoptimized
          priority={priority}
        />

        {/* 順位バッジ */}
        {rank != null && (
          <div className={`absolute top-2 left-2 min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded-full text-xs font-black ${
            rank === 1 ? 'bg-[#FFD700] text-black' :
            rank === 2 ? 'bg-[#C0C0C0] text-black' :
            rank === 3 ? 'bg-[#CD7F32] text-white' :
            'bg-black/60 text-white'
          }`}>
            {rank}
          </div>
        )}

        {/* 売り切れ間近バッジ */}
        {design.max_sales_count > 0 && (() => {
          const remaining = design.max_sales_count - design.sales_count
          const pct = remaining / design.max_sales_count
          if (pct <= 0.15 && remaining > 0) {
            return (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                残り{remaining}枚
              </div>
            )
          }
          return null
        })()}
      </div>

      {/* クリエイター情報 */}
      <div className="px-2.5 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0">
          {design.user?.avatar_url ? (
            <Image
              src={design.user.avatar_url}
              alt={design.user.name}
              width={20}
              height={20}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[8px] text-gray-500 font-bold">
              {design.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <span className="text-[11px] text-gray-500 truncate leading-none flex-1">
          {design.user?.name ?? ''}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
          <Eye size={10} className="shrink-0" />
          {design.click_count.toLocaleString()}
        </span>
      </div>
    </Link>
  )
}
