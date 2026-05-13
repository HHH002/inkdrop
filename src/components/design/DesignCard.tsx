import Link from 'next/link'
import Image from 'next/image'
import type { Design } from '@/types'

interface Props {
  design: Design
}

export function DesignCard({ design }: Props) {
  return (
    <Link href={`/designs/${design.id}`} className="block aspect-square overflow-hidden bg-gray-50">
      <Image
        src={design.transparent_image_url ?? design.image_url}
        alt={design.title}
        width={200}
        height={200}
        className="w-full h-full object-contain"
        unoptimized
      />
    </Link>
  )
}
