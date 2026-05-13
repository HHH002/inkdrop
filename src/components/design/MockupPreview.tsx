'use client'

import Image from 'next/image'
import {
  COLOR_HEX,
  PLACEMENT_LABELS,
  type BodyType,
  type ProductColor,
  type Placement,
  type PrintSize,
} from '@/types'

interface Props {
  designImageUrl: string
  bodyType: BodyType | null
  color: ProductColor | null
  placement: Placement | null
  printSize: PrintSize | null
  view: 'front' | 'side' | 'back'
}

/**
 * モック3Dプレビュー：実3Dモデル(WebGL等)はTODO。
 * 現在は服のシルエットを2D矩形＋デザインのオーバーレイで簡易表現。
 */
export function MockupPreview({
  designImageUrl,
  bodyType,
  color,
  placement,
  printSize,
  view,
}: Props) {
  const bgColor = color ? COLOR_HEX[color] : '#EEEEEE'
  const isLight = color === 'white'

  // 配置 × view で表示位置を決定
  const showFront = view === 'front'
  const showBack = view === 'back'
  const displayDesign = (() => {
    if (!placement) return false
    if (placement === 'one_point') return showFront
    if (placement === 'front') return showFront
    if (placement === 'back') return showBack
    if (placement === 'one_point_back') return showFront || showBack
    if (placement === 'custom') return showFront
    return false
  })()

  // プリントサイズ：small/medium/large の比率
  const sizeRatio = printSize === 'large' ? 0.5 : printSize === 'medium' ? 0.32 : 0.18

  // ワンポイントは左胸あたりに小さく
  const isOnePoint = placement === 'one_point' || (placement === 'one_point_back' && view === 'front')

  return (
    <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 服シルエット */}
      <div
        className="relative shadow-md"
        style={{
          width: '70%',
          height: '78%',
          backgroundColor: bgColor,
          borderRadius: '14% 14% 8% 8% / 12% 12% 6% 6%',
          border: isLight ? '1px solid #e5e5e5' : 'none',
        }}
      >
        {/* 襟 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-1/3 h-3 rounded-b-full"
          style={{ backgroundColor: isLight ? '#f0f0f0' : '#000', opacity: 0.4 }}
        />

        {/* デザインオーバーレイ */}
        {displayDesign && designImageUrl && (
          <div
            className="absolute"
            style={{
              left: isOnePoint ? '18%' : '50%',
              top: isOnePoint ? '20%' : '38%',
              transform: isOnePoint ? 'none' : 'translate(-50%, -50%)',
              width: `${(isOnePoint ? sizeRatio * 0.5 : sizeRatio) * 100}%`,
              aspectRatio: '1 / 1',
            }}
          >
            <Image
              src={designImageUrl}
              alt="デザイン"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* 視点ラベル */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full">
        {view === 'front' ? '前' : view === 'side' ? '横' : '後ろ'}
        {placement && ` ／ ${PLACEMENT_LABELS[placement]}`}
      </div>
    </div>
  )
}
