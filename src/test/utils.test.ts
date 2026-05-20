import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, formatDateTime, cn } from '@/lib/utils'

describe('formatPrice', () => {
  it('整数を¥付きで返す', () => {
    expect(formatPrice(3300)).toBe('¥3,300')
  })
  it('0円を返す', () => {
    expect(formatPrice(0)).toBe('¥0')
  })
  it('大きな金額を3桁区切りで返す', () => {
    expect(formatPrice(11000)).toBe('¥11,000')
  })
})

describe('formatDate', () => {
  it('ISO文字列を日本語の日付に変換する', () => {
    const result = formatDate('2025-05-20T00:00:00.000Z')
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/5|6/)  // タイムゾーンにより5月か6月
  })
})

describe('formatDateTime', () => {
  it('ISO文字列を日本語の日時に変換する', () => {
    const result = formatDateTime('2025-05-20T10:30:00.000Z')
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

describe('cn', () => {
  it('クラス名を結合する', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('falsy値を除外する', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c')
  })
  it('条件付きクラスが機能する', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })
})
