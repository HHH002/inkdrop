// ==============================
// 商品タイプ
// ==============================
export type BodyType = 'tshirt' | 'long_sleeve' | 'hoodie' | 'sweatshirt'
export type ProductColor = 'white' | 'black' | 'gray'
export type Size = 'S' | 'M' | 'L' | 'XL'
export type Placement = 'one_point' | 'front' | 'back' | 'one_point_back' | 'custom'
export type PrintSize = 'small' | 'medium' | 'large'

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  tshirt: 'Tシャツ',
  long_sleeve: 'ロンT',
  hoodie: 'パーカー',
  sweatshirt: 'スウェット',
}

export const BODY_TYPE_COLORS: Record<BodyType, ProductColor[]> = {
  tshirt: ['white', 'black'],
  long_sleeve: ['white', 'black'],
  hoodie: ['black', 'gray'],
  sweatshirt: ['black', 'gray'],
}

export const COLOR_LABELS: Record<ProductColor, string> = {
  white: '白',
  black: '黒',
  gray: 'グレー',
}

export const COLOR_HEX: Record<ProductColor, string> = {
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#9E9E9E',
}

export const SIZE_LABELS: Record<Size, string> = {
  S: 'S（通常Mサイズ相当）',
  M: 'M（通常Lサイズ相当）',
  L: 'L（通常XLサイズ相当）',
  XL: 'XL（通常XXLサイズ相当）',
}

export const PLACEMENT_LABELS: Record<Placement, string> = {
  one_point: 'A｜ワンポイント',
  front: 'B｜フロント',
  back: 'C｜バック',
  one_point_back: 'D｜ワンポイント＋バック',
  custom: 'E｜カスタム（追加料金）',
}

export const PRINT_SIZE_LABELS: Record<PrintSize, string> = {
  small: '小',
  medium: '中',
  large: '大',
}

// ==============================
// ユーザー
// ==============================
export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  profile_text: string | null
  terms_accepted_at: string | null
  created_at: string
  updated_at: string
}

// ==============================
// デザイン
// ==============================
export type CopyrightStatus = 'pending' | 'approved' | 'rejected'

export type DisplayPlacement = 'one_point' | 'front' | 'back'

export const DISPLAY_PLACEMENT_LABELS: Record<DisplayPlacement, string> = {
  one_point: 'ワンポイント（左胸）',
  front: 'フロントセンター',
  back: 'バック',
}

export interface Design {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string
  transparent_image_url: string | null
  display_placement: DisplayPlacement
  click_count: number
  sales_count: number
  max_sales_count: number
  is_sales_stopped: boolean
  copyright_status: CopyrightStatus
  created_at: string
  updated_at: string
  // join
  user?: User
}

export interface DesignSalesSummary {
  id: string
  design_id: string
  user_id: string
  sales_count: number
  earnings_amount: number
  max_sales_count: number
  remaining_sales_count: number
  is_sales_stopped: boolean
  created_at: string
  updated_at: string
}

// ==============================
// フォロー
// ==============================
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// ==============================
// 注文
// ==============================
export type OrderStatus = 'order_confirmed' | 'in_production' | 'shipped' | 'delivered'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  order_confirmed: '注文確認',
  in_production: '制作中',
  shipped: '発送済み',
  delivered: '配達完了',
}

export interface Order {
  id: string
  user_id: string
  design_id: string
  body_type: BodyType
  color: ProductColor
  size: Size
  placement: Placement
  print_size: PrintSize
  price: number
  status: OrderStatus
  stripe_payment_id: string | null
  created_at: string
  updated_at: string
  // join
  design?: Design
  user?: User
}

// ==============================
// 収益
// ==============================
export type EarningsStatus = 'pending' | 'available' | 'payout_requested' | 'paid'

export interface Earning {
  id: string
  user_id: string
  order_id: string
  design_id: string
  body_type: BodyType
  placement: Placement
  amount: number
  status: EarningsStatus
  available_at: string | null
  payout_requested_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface CreatorBalance {
  id: string
  user_id: string
  available_balance: number
  pending_balance: number
  payout_requested_balance: number
  paid_total: number
  total_income: number
  total_sales_count: number
  created_at: string
  updated_at: string
}

export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'rejected'

export interface PayoutRequest {
  id: string
  user_id: string
  amount: number
  status: PayoutStatus
  requested_at: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface SoldItem {
  id: string
  user_id: string
  order_id: string
  design_id: string
  design_title: string
  body_type: BodyType
  placement: Placement
  creator_reward: number
  sold_at: string
  created_at: string
}

// ==============================
// 通知
// ==============================
export interface Notification {
  id: string
  user_id: string
  type: 'purchase'
  message: string
  read: boolean
  created_at: string
}

// ==============================
// レビュー
// ==============================
export interface Review {
  id: string
  user_id: string
  design_id: string
  rating: number
  created_at: string
}

// ==============================
// 閲覧履歴
// ==============================
export interface View {
  id: string
  user_id: string
  design_id: string
  created_at: string
  // join
  design?: Design
}

// ==============================
// 商品価格（運営設定）
// ==============================
export interface ProductPrice {
  id: string
  body_type: BodyType
  price: number
  creator_reward: number
  created_at: string
  updated_at: string
}

export const FIXED_PRICE = 3300

// デフォルト価格（税込固定 ¥3,300）
export const DEFAULT_PRICES: Record<BodyType, { price: number; creator_reward: number }> = {
  tshirt: { price: FIXED_PRICE, creator_reward: 500 },
  long_sleeve: { price: FIXED_PRICE, creator_reward: 500 },
  hoodie: { price: FIXED_PRICE, creator_reward: 500 },
  sweatshirt: { price: FIXED_PRICE, creator_reward: 500 },
}

// ==============================
// 購入フォーム状態
// ==============================
export interface PurchaseConfig {
  body_type: BodyType | null
  color: ProductColor | null
  size: Size | null
  placement: Placement | null
  print_size: PrintSize | null
}

// ==============================
// ランキング期間
// ==============================
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all'
export type RankingType = 'sales' | 'clicks' | 'purchases' | 'trending'

export const RANKING_PERIOD_LABELS: Record<RankingPeriod, string> = {
  daily: '日間',
  weekly: '週間',
  monthly: '月間',
  all: '総合',
}

export const RANKING_TYPE_LABELS: Record<RankingType, string> = {
  sales: '売上',
  clicks: 'クリック数',
  purchases: '購入数',
  trending: '急上昇',
}

// ==============================
// 収益期間フィルター
// ==============================
export type EarningsPeriod = 'all' | 'daily' | 'weekly' | 'monthly'

export const EARNINGS_PERIOD_LABELS: Record<EarningsPeriod, string> = {
  all: '総合',
  daily: '日間',
  weekly: '週間',
  monthly: '月間',
}

// ==============================
// カスタム配置候補（E選択時）
// ==============================
export interface CustomPlacementOption {
  id: string
  label: string
  description: string
}

// TODO: 運営側で固定配置候補を定義する
export const CUSTOM_PLACEMENT_OPTIONS: CustomPlacementOption[] = [
  { id: 'custom_left_sleeve', label: '左袖', description: '左袖にプリント' },
  { id: 'custom_right_sleeve', label: '右袖', description: '右袖にプリント' },
  { id: 'custom_both_sleeves', label: '両袖', description: '両袖にプリント' },
  { id: 'custom_collar', label: '襟元', description: '襟元にワンポイント' },
]
