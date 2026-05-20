import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DesignCard } from '@/components/design/DesignCard'
import type { Design } from '@/types'

// next/image をシンプルな <img> にモック
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, fill, priority, ...rest } = props
    return <img src={src as string} alt={alt as string} {...rest} />
  },
}))

// next/link をシンプルな <a> にモック
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

const mockDesign: Design = {
  id: 'test-id-1',
  user_id: 'user-1',
  title: 'テストデザイン',
  description: 'テスト説明文',
  image_url: 'https://example.com/image.png',
  transparent_image_url: 'https://example.com/transparent.png',
  display_placement: 'front',
  click_count: 10,
  sales_count: 5,
  max_sales_count: 50,
  is_sales_stopped: false,
  copyright_status: 'approved',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  user: {
    id: 'user-1',
    name: 'テストユーザー',
    email: 'test@example.com',
    avatar_url: null,
    profile_text: null,
    terms_accepted_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
}

describe('DesignCard', () => {
  it('デザイン詳細ページへのリンクが正しい', () => {
    render(<DesignCard design={mockDesign} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/designs/test-id-1')
  })

  it('transparent_image_urlを優先して表示する', () => {
    render(<DesignCard design={mockDesign} />)
    const img = screen.getByRole('img', { name: 'テストデザイン' })
    expect(img).toHaveAttribute('src', 'https://example.com/transparent.png')
  })

  it('image_urlにフォールバックする', () => {
    const design = { ...mockDesign, transparent_image_url: null }
    render(<DesignCard design={design} />)
    const img = screen.getByRole('img', { name: 'テストデザイン' })
    expect(img).toHaveAttribute('src', 'https://example.com/image.png')
  })

  it('クリエイター名を表示する', () => {
    render(<DesignCard design={mockDesign} />)
    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
  })

  it('soldカウントを表示する', () => {
    render(<DesignCard design={mockDesign} />)
    expect(screen.getByText('5sold')).toBeInTheDocument()
  })

  it('rankが指定された場合バッジを表示する', () => {
    render(<DesignCard design={mockDesign} rank={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('rankがない場合バッジを表示しない', () => {
    render(<DesignCard design={mockDesign} />)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('売り切れ間近バッジを表示する（残り15%以下）', () => {
    const design = { ...mockDesign, sales_count: 43, max_sales_count: 50 }
    render(<DesignCard design={design} />)
    expect(screen.getByText(/残り\d+枚/)).toBeInTheDocument()
  })

  it('余裕がある場合は売り切れ間近バッジを表示しない', () => {
    const design = { ...mockDesign, sales_count: 5, max_sales_count: 50 }
    render(<DesignCard design={design} />)
    expect(screen.queryByText(/残り\d+枚/)).not.toBeInTheDocument()
  })
})
