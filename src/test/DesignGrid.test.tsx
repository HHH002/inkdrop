import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DesignGrid } from '@/components/design/DesignGrid'
import type { Design } from '@/types'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, fill, priority, ...rest } = props
    return <img src={src as string} alt={alt as string} {...rest} />
  },
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

const makeDesign = (id: string, sales = 0): Design => ({
  id,
  user_id: 'u1',
  title: `デザイン${id}`,
  description: null,
  image_url: `https://example.com/${id}.png`,
  transparent_image_url: null,
  display_placement: 'front',
  click_count: 0,
  sales_count: sales,
  max_sales_count: 100,
  is_sales_stopped: false,
  copyright_status: 'approved',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
})

describe('DesignGrid', () => {
  it('渡されたdesigns分のカードをレンダリングする', () => {
    const designs = [makeDesign('a'), makeDesign('b'), makeDesign('c')]
    render(<DesignGrid designs={designs} />)
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('空のdesignsを渡してもクラッシュしない', () => {
    render(<DesignGrid designs={[]} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('showRankがtrueの場合に1から始まる順位を表示する', () => {
    const designs = [makeDesign('x'), makeDesign('y')]
    render(<DesignGrid designs={designs} showRank />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('showRankがfalseの場合は順位を表示しない', () => {
    const designs = [makeDesign('x'), makeDesign('y')]
    render(<DesignGrid designs={designs} />)
    expect(screen.queryByText('1')).toBeNull()
  })
})
