import type { Product } from '@/types/catalog'
import type { CartLine, QuizOption, QuizStep } from '@/types/quiz'
import { collectSelectedOptions } from '@/lib/pricing'

const VOLUME_IDS = new Set(['vol-small', 'vol-medium', 'vol-large'])
const EXTRA_IDS = new Set([
  'extra-bubble',
  'extra-tape',
  'extra-filler',
  'eco',
  'branding',
])

export function volumeQty(answers: Record<string, string | string[]>): number {
  const volume = answers.volume
  const ids = Array.isArray(volume) ? volume : volume ? [volume] : []
  if (ids.includes('vol-large')) return 250
  if (ids.includes('vol-medium')) return 100
  if (ids.includes('vol-small')) return 30
  return 50
}

function qtyForOption(option: QuizOption, product: Product, qtyBase: number): number {
  if (VOLUME_IDS.has(option.id)) return 0

  if (EXTRA_IDS.has(option.id)) {
    if (product.unit === 'roll' || product.unit === 'pack') {
      return Math.max(2, Math.round(qtyBase / 25))
    }
    return Math.max(5, Math.round(qtyBase / 10))
  }

  // Purpose-driven lines follow the selected volume.
  if (product.unit === 'roll' || product.unit === 'pack') {
    return Math.max(2, Math.round(qtyBase / 20))
  }
  return qtyBase
}

export function matchProducts(
  answers: Record<string, string | string[]>,
  products: Product[],
  steps: QuizStep[],
): CartLine[] {
  const active = products.filter((p) => p.active)
  const activeIds = new Set(active.map((p) => p.id))
  const selected = collectSelectedOptions(steps, answers)
  const qtyBase = volumeQty(answers)
  const qtyById = new Map<string, number>()

  const add = (productId: string, qty: number) => {
    if (!activeIds.has(productId) || qty <= 0) return
    const current = qtyById.get(productId) ?? 0
    qtyById.set(productId, Math.max(current, qty))
  }

  for (const option of selected) {
    if (VOLUME_IDS.has(option.id)) continue

    const productIds = new Set<string>()

    for (const id of option.recommendedProductIds ?? []) {
      productIds.add(id)
    }

    const tags = option.productFilters?.tags
    if (tags?.length) {
      const matched = active
        .filter((p) => tags.some((t) => p.tags.includes(t)))
        .sort((a, b) => b.popularScore - a.popularScore)
        .slice(0, 2)
      for (const product of matched) productIds.add(product.id)
    }

    for (const productId of productIds) {
      const product = active.find((p) => p.id === productId)
      if (!product) continue
      add(productId, qtyForOption(option, product, qtyBase))
    }
  }

  if (qtyById.size === 0) {
    const fallback = [...active].sort((a, b) => b.popularScore - a.popularScore)[0]
    if (fallback) qtyById.set(fallback.id, qtyBase)
  }

  return [...qtyById.entries()]
    .map(([productId, qty]) => ({ productId, qty }))
    .sort((a, b) => a.productId.localeCompare(b.productId))
}
