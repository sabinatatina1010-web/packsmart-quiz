import { motion } from 'framer-motion'

interface ProgressBarProps {
  percent: number
  label: string
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
        <span>{label}</span>
        <span className="font-medium text-[var(--color-ink)]">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-line)]/70">
        <motion.div
          className="h-full rounded-full bg-[var(--color-accent)]"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
