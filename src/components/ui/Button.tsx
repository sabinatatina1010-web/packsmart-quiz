import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const styles: Record<Variant, string> = {
  primary:
    'bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[#2a241c] disabled:bg-[#9a9186]',
  secondary:
    'bg-white/70 text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-white disabled:opacity-50',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-black/5 disabled:opacity-40',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
