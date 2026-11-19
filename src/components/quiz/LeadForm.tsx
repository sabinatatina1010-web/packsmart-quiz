import { Button } from '@/components/ui/Button'
import type { LeadForm as LeadFormData } from '@/types/quiz'

interface LeadFormProps {
  lead: LeadFormData
  submitted: boolean
  error?: string | null
  disabled?: boolean
  onChange: (partial: Partial<LeadFormData>) => void
  onSubmit: () => void
  onReset: () => void
}

export function LeadFormFields({
  lead,
  submitted,
  error,
  disabled = false,
  onChange,
  onSubmit,
  onReset,
}: LeadFormProps) {
  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] p-6 text-center">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
          Заявка отправлена
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Мы открыли WhatsApp с вашей сметой. Можно пройти квиз ещё раз.
        </p>
        <Button className="mt-5" onClick={onReset}>
          Пройти ещё раз
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
          Получить точную смету в WhatsApp
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Менеджер уточнит остатки и финальную цену под ваш объём
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Имя *</span>
        <input
          required
          value={lead.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white/80 px-4 py-3 outline-none ring-[var(--color-accent)] focus:ring-2"
          placeholder="Как к вам обращаться"
          autoComplete="name"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Телефон *</span>
        <input
          required
          value={lead.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white/80 px-4 py-3 outline-none ring-[var(--color-accent)] focus:ring-2"
          placeholder="+7 700 000 00 00"
          inputMode="tel"
          autoComplete="tel"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Компания</span>
        <input
          value={lead.company}
          onChange={(e) => onChange({ company: e.target.value })}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white/80 px-4 py-3 outline-none ring-[var(--color-accent)] focus:ring-2"
          placeholder="Необязательно"
          autoComplete="organization"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Комментарий</span>
        <textarea
          value={lead.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
          className="min-h-24 w-full resize-y rounded-xl border border-[var(--color-line)] bg-white/80 px-4 py-3 outline-none ring-[var(--color-accent)] focus:ring-2"
          placeholder="Адрес доставки, сроки, особые пожелания"
        />
      </label>

      {error ? <p className="text-sm text-[var(--color-warn)]">{error}</p> : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={disabled}>
        Получить точную смету в WhatsApp
      </Button>
    </form>
  )
}
