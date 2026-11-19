import type { Product } from '@/types/catalog'
import type { CartLine, QuizOption, QuizStep } from '@/types/quiz'

export interface LineCalc {
  productId: string
  qty: number
  unitPrice: number
  tier: 'retail' | 'wholesale'
  discountPercent: number
  lineTotal: number
}

export interface PriceBreakdown {
  lines: LineCalc[]
  subtotal: number
  discountAmount: number
  modifiersTotal: number
  multiplier: number
  total: number
}

function getUnitPrice(product: Product, qty: number): {
  unitPrice: number
  tier: 'retail' | 'wholesale'
  discountPercent: number
} {
  const safeQty = Number.isFinite(qty) ? Math.max(0, qty) : 0
  const tier = safeQty >= product.wholesaleMinQty ? 'wholesale' : 'retail'
  const rawBase = tier === 'wholesale' ? product.wholesalePrice : product.retailPrice
  const base = Number.isFinite(rawBase) ? Math.max(0, rawBase) : 0
  const discountPercent = (product.discounts ?? [])
    .filter((d) => safeQty >= d.minQty && Number.isFinite(d.percent))
    .reduce((max, d) => Math.max(max, Math.min(100, Math.max(0, d.percent))), 0)
  const unitPrice = Math.round(base * (1 - discountPercent / 100))
  return { unitPrice, tier, discountPercent }
}

export function collectSelectedOptions(
  steps: QuizStep[],
  answers: Record<string, string | string[]>,
): QuizOption[] {
  const selected: QuizOption[] = []
  for (const step of steps) {
    const answer = answers[step.id]
    if (!answer) continue
    const ids = Array.isArray(answer) ? answer : [answer]
    for (const id of ids) {
      const option = step.options.find((o) => o.id === id)
      if (option) selected.push(option)
    }
  }
  return selected
}

export function calculateTotal(
  lines: CartLine[],
  products: Product[],
  steps: QuizStep[],
  answers: Record<string, string | string[]>,
): PriceBreakdown {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const calculatedLines: LineCalc[] = []
  let subtotalBeforeDiscount = 0
  let subtotal = 0

  for (const line of lines) {
    const product = productMap.get(line.productId)
    if (!product || line.qty <= 0) continue
    const { unitPrice, tier, discountPercent } = getUnitPrice(product, line.qty)
    const baseUnit = tier === 'wholesale' ? product.wholesalePrice : product.retailPrice
    subtotalBeforeDiscount += baseUnit * line.qty
    const lineTotal = unitPrice * line.qty
    subtotal += lineTotal
    calculatedLines.push({
      productId: line.productId,
      qty: line.qty,
      unitPrice,
      tier,
      discountPercent,
      lineTotal,
    })
  }

  const selected = collectSelectedOptions(steps, answers)
  const modifiersTotal = selected.reduce((sum, o) => sum + (o.priceModifier ?? 0), 0)
  const multiplier = selected.reduce((acc, o) => acc * (o.multiplier ?? 1), 1)
  const discountAmount = Math.max(0, subtotalBeforeDiscount - subtotal)
  const total = Math.round((subtotal + modifiersTotal) * multiplier)

  return {
    lines: calculatedLines,
    subtotal,
    discountAmount,
    modifiersTotal,
    multiplier,
    total,
  }
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₸'
}
