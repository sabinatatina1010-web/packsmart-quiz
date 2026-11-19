import { motion } from 'framer-motion'
import { LeadFormFields } from '@/components/quiz/LeadForm'
import { PriceSummary } from '@/components/quiz/PriceSummary'
import { useCatalogStore } from '@/store/catalogStore'
import { useQuizStore } from '@/store/quizStore'

export function ResultScreen() {
  const products = useCatalogStore((s) => s.products)
  const {
    selectedProducts,
    answers,
    total,
    discountAmount,
    modifiersTotal,
    multiplier,
    lead,
    status,
    submitError,
    updateQty,
    updateLead,
    submitLead,
    reset,
  } = useQuizStore()

  const handleSubmit = () => {
    const url = submitLead()
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Готовая корзина
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          Ваш подбор PackSmart
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Ниже — ориентировочный расчёт. Можно скорректировать количество и запросить точную
          смету у менеджера.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {selectedProducts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-warn)]/30 bg-white/70 p-6 text-[var(--color-warn)]">
            Корзина пуста. Нажмите «Изменить ответы» и пересчитайте заказ.
          </div>
        ) : (
          <PriceSummary
            lines={selectedProducts}
            products={products}
            answers={answers}
            total={total}
            discountAmount={discountAmount}
            modifiersTotal={modifiersTotal}
            multiplier={multiplier}
            onQtyChange={updateQty}
          />
        )}
        <div className="rounded-2xl border border-[var(--color-line)] bg-white/65 p-5 sm:p-6">
          <LeadFormFields
            lead={lead}
            submitted={status === 'submitted'}
            error={submitError}
            disabled={selectedProducts.length === 0}
            onChange={updateLead}
            onSubmit={handleSubmit}
            onReset={reset}
          />
        </div>
      </div>
    </motion.div>
  )
}
