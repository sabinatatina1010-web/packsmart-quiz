import { Minus, Plus } from 'lucide-react'
import { formatMoney } from '@/lib/pricing'
import { UNIT_LABELS } from '@/types/catalog'
import type { Product } from '@/types/catalog'
import type { CartLine } from '@/types/quiz'
import { calculateTotal } from '@/lib/pricing'
import { QUIZ_STEPS } from '@/data/quizSteps'

interface PriceSummaryProps {
  lines: CartLine[]
  products: Product[]
  answers: Record<string, string | string[]>
  total: number
  discountAmount: number
  modifiersTotal: number
  multiplier: number
  onQtyChange: (productId: string, qty: number) => void
}

export function PriceSummary({
  lines,
  products,
  answers,
  total,
  discountAmount,
  modifiersTotal,
  multiplier,
  onQtyChange,
}: PriceSummaryProps) {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const breakdown = calculateTotal(lines, products, QUIZ_STEPS, answers)
  const lineMeta = new Map(breakdown.lines.map((l) => [l.productId, l]))

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {lines.map((line) => {
          const product = productMap.get(line.productId)
          const meta = lineMeta.get(line.productId)
          if (!product || !meta) return null
          return (
            <li
              key={line.productId}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--color-ink)]">{product.name}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {formatMoney(meta.unitPrice)} / {UNIT_LABELS[product.unit]}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-md bg-[var(--color-paper-deep)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink)]">
                    {meta.tier === 'wholesale' ? 'Опт' : 'Розница'}
                  </span>
                  {meta.discountPercent > 0 ? (
                    <span className="rounded-md bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                      −{meta.discountPercent}%
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-line)] bg-white"
                    onClick={() => onQtyChange(line.productId, line.qty - 1)}
                    aria-label="Уменьшить"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-semibold">{line.qty}</span>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-line)] bg-white"
                    onClick={() => onQtyChange(line.productId, line.qty + 1)}
                    aria-label="Увеличить"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="min-w-24 text-right font-semibold">{formatMoney(meta.lineTotal)}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="space-y-2 rounded-2xl bg-[var(--color-ink)] p-5 text-[var(--color-paper)]">
        {discountAmount > 0 ? (
          <div className="flex justify-between text-sm opacity-80">
            <span>Скидки за количество</span>
            <span>−{formatMoney(discountAmount)}</span>
          </div>
        ) : null}
        {modifiersTotal !== 0 ? (
          <div className="flex justify-between text-sm opacity-80">
            <span>Опции и требования</span>
            <span>+{formatMoney(modifiersTotal)}</span>
          </div>
        ) : null}
        {multiplier !== 1 ? (
          <div className="flex justify-between text-sm opacity-80">
            <span>Коэффициент срочности</span>
            <span>×{multiplier.toFixed(2)}</span>
          </div>
        ) : null}
        <div className="flex items-end justify-between gap-4 border-t border-white/15 pt-3">
          <div>
            <p className="text-sm opacity-70">Ориентировочная сумма</p>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
              {formatMoney(total)}
            </p>
          </div>
          <p className="pb-1 text-xs opacity-60">не оферта</p>
        </div>
      </div>
    </div>
  )
}
