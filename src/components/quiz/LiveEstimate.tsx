import { AnimatePresence, motion } from 'framer-motion'
import { formatMoney } from '@/lib/pricing'

interface LiveEstimateProps {
  total: number
  visible: boolean
}

export function LiveEstimate({ total, visible }: LiveEstimateProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="mt-4 flex flex-wrap items-end justify-between gap-2 rounded-xl bg-[var(--color-ink)] px-4 py-3 text-[var(--color-paper)]"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.12em] opacity-70">
              Ориентировочно сейчас
            </p>
            <motion.p
              key={total}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-[family-name:var(--font-display)] text-2xl font-bold"
            >
              {formatMoney(total)}
            </motion.p>
          </div>
          <p className="pb-1 text-xs opacity-60">обновляется при выборе опций</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
