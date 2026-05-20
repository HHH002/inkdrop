import { DesignCard } from './DesignCard'
import type { Design } from '@/types'

interface Props {
  designs: Design[]
  showRank?: boolean
}

export function DesignGrid({ designs, showRank }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 px-3 py-3">
      {designs.map((design, i) => (
        <DesignCard
          key={design.id}
          design={design}
          rank={showRank ? i + 1 : undefined}
          priority={i < 4}
        />
      ))}
    </div>
  )
}
