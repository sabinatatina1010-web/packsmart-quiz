import { motion } from 'framer-motion'
import { OptionCard } from '@/components/quiz/OptionCard'
import type { QuizStep } from '@/types/quiz'

interface StepOptionsProps {
  step: QuizStep
  value?: string | string[]
  onSelect: (optionId: string) => void
}

export function StepOptions({ step, value, onSelect }: StepOptionsProps) {
  const selectedIds = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
          {step.title}
        </h2>
        {step.subtitle ? (
          <p className="mt-2 max-w-2xl text-[var(--color-muted)]">{step.subtitle}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {step.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
          >
            <OptionCard
              option={option}
              selected={selectedIds.includes(option.id)}
              multiSelect={step.multiSelect}
              onSelect={() => onSelect(option.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
