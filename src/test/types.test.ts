import { describe, it, expect } from 'vitest'
import {
  BODY_TYPE_LABELS,
  BODY_TYPE_COLORS,
  BODY_TYPE_PRICES,
  COLOR_LABELS,
  COLOR_HEX,
  SIZE_LABELS,
  PLACEMENT_LABELS,
  DEFAULT_PRICES,
  type BodyType,
  type ProductColor,
  type Size,
} from '@/types'

const BODY_TYPES: BodyType[]     = ['tshirt', 'long_sleeve', 'hoodie', 'sweatshirt']
const COLORS: ProductColor[]     = ['white', 'black', 'gray']
const SIZES: Size[]              = ['S', 'M', 'L', 'XL']

describe('BODY_TYPE_LABELS', () => {
  it('全ボディタイプにラベルがある', () => {
    BODY_TYPES.forEach(bt => {
      expect(BODY_TYPE_LABELS[bt]).toBeTruthy()
    })
  })
})

describe('BODY_TYPE_COLORS', () => {
  it('各ボディタイプに有効なカラーが設定されている', () => {
    BODY_TYPES.forEach(bt => {
      const colors = BODY_TYPE_COLORS[bt]
      expect(colors.length).toBeGreaterThan(0)
      colors.forEach(c => expect(COLORS).toContain(c))
    })
  })
  it('Tシャツは白と黒がある', () => {
    expect(BODY_TYPE_COLORS.tshirt).toContain('white')
    expect(BODY_TYPE_COLORS.tshirt).toContain('black')
  })
})

describe('BODY_TYPE_PRICES', () => {
  it('全ボディタイプに価格がある', () => {
    BODY_TYPES.forEach(bt => {
      expect(BODY_TYPE_PRICES[bt]).toBeGreaterThan(0)
    })
  })
  it('価格順がTシャツ < ロンT < スウェット < パーカー', () => {
    expect(BODY_TYPE_PRICES.tshirt).toBeLessThan(BODY_TYPE_PRICES.long_sleeve)
    expect(BODY_TYPE_PRICES.long_sleeve).toBeLessThan(BODY_TYPE_PRICES.sweatshirt)
    expect(BODY_TYPE_PRICES.sweatshirt).toBeLessThan(BODY_TYPE_PRICES.hoodie)
  })
})

describe('COLOR_LABELS / COLOR_HEX', () => {
  it('全カラーにラベルとHEXがある', () => {
    COLORS.forEach(c => {
      expect(COLOR_LABELS[c]).toBeTruthy()
      expect(COLOR_HEX[c]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
  it('白のHEXが#FFFFFF', () => {
    expect(COLOR_HEX.white).toBe('#FFFFFF')
  })
})

describe('SIZE_LABELS', () => {
  it('全サイズにラベルがある', () => {
    SIZES.forEach(s => {
      expect(SIZE_LABELS[s]).toBeTruthy()
    })
  })
})

describe('PLACEMENT_LABELS', () => {
  it('主要な配置にラベルがある', () => {
    expect(PLACEMENT_LABELS.one_point).toBeTruthy()
    expect(PLACEMENT_LABELS.front).toBeTruthy()
    expect(PLACEMENT_LABELS.back).toBeTruthy()
  })
})

describe('DEFAULT_PRICES', () => {
  it('全ボディタイプにデフォルト価格と報酬がある', () => {
    BODY_TYPES.forEach(bt => {
      expect(DEFAULT_PRICES[bt].price).toBeGreaterThan(0)
      expect(DEFAULT_PRICES[bt].creator_reward).toBeGreaterThan(0)
      expect(DEFAULT_PRICES[bt].creator_reward).toBeLessThan(DEFAULT_PRICES[bt].price)
    })
  })
})
