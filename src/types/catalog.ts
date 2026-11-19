export type PriceUnit = 'piece' | 'roll' | 'pack' | 'box'

export interface QuantityDiscount {
  minQty: number
  percent: number
}

export interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  unit: PriceUnit
  retailPrice: number
  wholesalePrice: number
  wholesaleMinQty: number
  discounts: QuantityDiscount[]
  stock: number
  specs: Record<string, string | number>
  tags: string[]
  popularScore: number
  active: boolean
}

export const UNIT_LABELS: Record<PriceUnit, string> = {
  piece: 'шт',
  roll: 'рулон',
  pack: 'упак.',
  box: 'короб',
}
