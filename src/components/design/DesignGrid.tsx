import { DesignCard } from './DesignCard'
import type { Design } from '@/types'

interface Props {
  designs: Design[]
}

export function DesignGrid({ designs }: Props) {
  return (
    <div className="grid grid-cols-3 gap-px bg-gray-100">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </div>
  )
}
