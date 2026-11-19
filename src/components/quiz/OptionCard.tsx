import type { QuizOption } from '@/types/quiz'
import { getOptionIcon } from '@/lib/icons'

interface OptionCardProps {
  option: QuizOption
  selected: boolean
  multiSelect?: boolean
  onSelect: () => void
}

export function OptionCard({
  option,
  selected,
  multiSelect = false,
  onSelect,
}: OptionCardProps) {
  const Icon = getOptionIcon(option.icon)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex h-full flex-col gap-3 rounded-2xl border p-4 text-left transition duration-200 sm:p-5 ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-[0_10px_30px_rgba(61,90,58,0.12)]'
          : 'border-[var(--color-line)] bg-white/55 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:bg-white/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition ${
            selected
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-paper-deep)] text-[var(--color-ink)] group-hover:bg-[var(--color-accent-soft)]'
          }`}
        >
          <Icon size={22} strokeWidth={1.8} />
        </span>
        <span
          className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center border-2 ${
            multiSelect ? 'rounded-md' : 'rounded-full'
          } ${
            selected
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
              : 'border-[var(--color-line)] bg-white'
          }`}
          aria-hidden
        >
          {selected ? (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
              <path
                d="M2.5 6.2 5 8.7 9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          {option.label}
        </h3>
        {option.description ? (
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
            {option.description}
          </p>
        ) : null}
      </div>
    </button>
  )
}
