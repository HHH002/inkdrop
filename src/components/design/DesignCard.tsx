import Link from 'next/link'
import Image from 'next/image'
import type { Design } from '@/types'

interface Props {
  design: Design
}

// 配置ごとの表示設定
// one_point: シャツの左上1/4にフォーカス (objectPosition)
// front: シャツ全体表示
// back: バック面全体表示
function getDisplayStyle(placement: string): { containerClass: string; imageStyle: React.CSSProperties } {
  switch (placement) {
    case 'one_point':
      return {
        containerClass: 'relative bg-gray-100',
        imageStyle: {
          objectFit: 'contain',
          objectPosition: 'center',
        },
      }
    case 'back':
      return {
        containerClass: 'relative bg-gray-100',
        imageStyle: {
          objectFit: 'contain',
          objectPosition: 'center',
        },
      }
    default: // front
      return {
        containerClass: 'relative bg-gray-100',
        imageStyle: {
          objectFit: 'contain',
          objectPosition: 'center',
        },
      }
  }
}

export function DesignCard({ design }: Props) {
  const placement = design.display_placement ?? 'front'
  const isOnePoint = placement === 'one_point'

  return (
    <Link href={`/designs/${design.id}`} className="block aspect-square overflow-hidden bg-gray-50 relative">
      {isOnePoint ? (
        /* ワンポイント：デザインをTシャツ左胸エリアにフォーカス表示 */
        <div className="w-full h-full relative">
          {/* 薄いTシャツ背景イメージ風のグラデーション */}
          <div className="absolute inset-0 bg-gray-100" />
          {/* 左上1/4エリアにデザインを大きく表示 */}
          <div className="absolute top-[10%] left-[8%] w-[42%] h-[42%]">
            <Image
              src={design.transparent_image_url ?? design.image_url}
              alt={design.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">ワンポイント</span>
        </div>
      ) : placement === 'back' ? (
        /* バック：全体表示 + バッジ */
        <div className="w-full h-full relative">
          <Image
            src={design.transparent_image_url ?? design.image_url}
            alt={design.title}
            fill
            className="object-contain"
            unoptimized
          />
          <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">バック</span>
        </div>
      ) : (
        /* フロント：通常表示 */
        <Image
          src={design.transparent_image_url ?? design.image_url}
          alt={design.title}
          width={200}
          height={200}
          className="w-full h-full object-contain"
          unoptimized
        />
      )}
    </Link>
  )
}
