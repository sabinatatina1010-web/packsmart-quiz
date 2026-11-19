import { create } from 'zustand'
import { QUIZ_STEPS } from '@/data/quizSteps'
import { matchProducts } from '@/lib/matchProducts'
import { calculateTotal } from '@/lib/pricing'
import { buildWhatsAppUrl, saveLead, trackAnswers } from '@/lib/leads'
import { isNonEmpty, isValidPhone } from '@/lib/validation'
import { useCatalogStore } from '@/store/catalogStore'
import type { CartLine, LeadForm, QuizStatus } from '@/types/quiz'

const emptyLead = (): LeadForm => ({
  name: '',
  phone: '',
  company: '',
  comment: '',
})

interface QuizStore {
  currentStepIndex: number
  answers: Record<string, string | string[]>
  selectedProducts: CartLine[]
  subtotal: number
  total: number
  discountAmount: number
  modifiersTotal: number
  multiplier: number
  lead: LeadForm
  status: QuizStatus
  submitError: string | null
  setAnswer: (stepId: string, optionId: string, multiSelect?: boolean) => void
  nextStep: () => boolean
  prevStep: () => void
  recalculate: () => void
  updateQty: (productId: string, qty: number) => void
  updateLead: (partial: Partial<LeadForm>) => void
  submitLead: () => string | null
  reset: () => void
  canGoNext: () => boolean
  progressPercent: () => number
  isResultStep: () => boolean
  questionCount: number
}

function applyPricing(
  answers: Record<string, string | string[]>,
  lines: CartLine[],
) {
  const products = useCatalogStore.getState().products
  const breakdown = calculateTotal(lines, products, QUIZ_STEPS, answers)
  return {
    selectedProducts: lines,
    subtotal: breakdown.subtotal,
    total: breakdown.total,
    discountAmount: breakdown.discountAmount,
    modifiersTotal: breakdown.modifiersTotal,
    multiplier: breakdown.multiplier,
  }
}

function hasRequiredSelection(
  stepId: string,
  answers: Record<string, string | string[]>,
): boolean {
  const step = QUIZ_STEPS.find((s) => s.id === stepId)
  if (!step) return true
  const answer = answers[step.id]
  const selected = Array.isArray(answer) ? answer : answer ? [answer] : []
  if (selected.length === 0) return false
  if (step.requireOneOf?.length) {
    return step.requireOneOf.some((id) => selected.includes(id))
  }
  return true
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentStepIndex: 0,
  answers: {},
  selectedProducts: [],
  subtotal: 0,
  total: 0,
  discountAmount: 0,
  modifiersTotal: 0,
  multiplier: 1,
  lead: emptyLead(),
  status: 'idle',
  submitError: null,
  questionCount: QUIZ_STEPS.length,

  setAnswer: (stepId, optionId, multiSelect = false) => {
    const step = QUIZ_STEPS.find((s) => s.id === stepId)
    const option = step?.options.find((o) => o.id === optionId)
    const { answers } = get()
    let nextValue: string | string[]

    if (multiSelect) {
      const current = answers[stepId]
      let arr = Array.isArray(current) ? [...current] : current ? [current] : []
      const idx = arr.indexOf(optionId)

      if (idx >= 0) {
        arr.splice(idx, 1)
      } else {
        if (option?.exclusiveGroup && step) {
          const rivals = step.options
            .filter(
              (o) =>
                o.exclusiveGroup === option.exclusiveGroup && o.id !== optionId,
            )
            .map((o) => o.id)
          arr = arr.filter((id) => !rivals.includes(id))
        }
        arr.push(optionId)
      }
      nextValue = arr
    } else {
      nextValue = optionId
    }

    const nextAnswers = { ...answers, [stepId]: nextValue }
    const products = useCatalogStore.getState().products
    const lines = matchProducts(nextAnswers, products, QUIZ_STEPS)
    const priced = applyPricing(nextAnswers, lines)

    set({
      answers: nextAnswers,
      ...priced,
      status: 'idle',
      submitError: null,
    })
  },

  canGoNext: () => {
    const { currentStepIndex, answers } = get()
    if (currentStepIndex >= QUIZ_STEPS.length) return true
    const step = QUIZ_STEPS[currentStepIndex]
    if (!step.required) return true
    return hasRequiredSelection(step.id, answers)
  },

  progressPercent: () => {
    const { currentStepIndex, questionCount } = get()
    if (currentStepIndex >= questionCount) return 100
    // Exact ladder for 3 steps: 33% → 66% → 100% (and proportional for other counts)
    return Math.floor(((currentStepIndex + 1) / questionCount) * 100)
  },

  isResultStep: () => get().currentStepIndex >= QUIZ_STEPS.length,

  nextStep: () => {
    const state = get()
    if (!state.canGoNext()) return false

    if (state.currentStepIndex === QUIZ_STEPS.length - 1) {
      set({ status: 'calculating' })
      const products = useCatalogStore.getState().products
      const lines = matchProducts(state.answers, products, QUIZ_STEPS)
      const priced = applyPricing(state.answers, lines)
      set({
        ...priced,
        currentStepIndex: QUIZ_STEPS.length,
        status: 'ready',
        submitError: null,
      })
      return true
    }

    set({ currentStepIndex: state.currentStepIndex + 1 })
    return true
  },

  prevStep: () => {
    const { currentStepIndex } = get()
    if (currentStepIndex <= 0) return
    set({
      currentStepIndex: currentStepIndex - 1,
      status: 'idle',
      submitError: null,
    })
  },

  recalculate: () => {
    const { answers, selectedProducts } = get()
    set({ ...applyPricing(answers, selectedProducts), status: 'ready' })
  },

  updateQty: (productId, qty) => {
    const safeQty = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0
    const { selectedProducts, answers } = get()
    const next = selectedProducts
      .map((line) =>
        line.productId === productId ? { ...line, qty: safeQty } : line,
      )
      .filter((line) => line.qty > 0)
    set({ ...applyPricing(answers, next), status: 'ready' })
  },

  updateLead: (partial) => {
    set({ lead: { ...get().lead, ...partial }, submitError: null })
  },

  submitLead: () => {
    const state = get()

    if (!isNonEmpty(state.lead.name)) {
      set({ submitError: 'Укажите имя' })
      return null
    }
    if (!isValidPhone(state.lead.phone)) {
      set({ submitError: 'Введите корректный телефон (минимум 10 цифр)' })
      return null
    }
    if (state.selectedProducts.length === 0) {
      set({ submitError: 'Корзина пуста — вернитесь и пересчитайте заказ' })
      return null
    }

    const products = useCatalogStore.getState().products
    const productMap = new Map(products.map((p) => [p.id, p]))
    const linesText = state.selectedProducts
      .map((line) => {
        const p = productMap.get(line.productId)
        return `• ${p?.name ?? line.productId} × ${line.qty}`
      })
      .join('\n')

    const message = [
      'Заявка PackSmart — точная смета',
      '',
      `Имя: ${state.lead.name.trim()}`,
      `Телефон: ${state.lead.phone.trim()}`,
      state.lead.company.trim() ? `Компания: ${state.lead.company.trim()}` : '',
      state.lead.comment.trim() ? `Комментарий: ${state.lead.comment.trim()}` : '',
      '',
      'Состав:',
      linesText,
      '',
      `Ориентировочно: ${state.total} ₸`,
    ]
      .filter(Boolean)
      .join('\n')

    const saved = saveLead({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lead: {
        ...state.lead,
        name: state.lead.name.trim(),
        phone: state.lead.phone.trim(),
        company: state.lead.company.trim(),
        comment: state.lead.comment.trim(),
      },
      answers: state.answers,
      lines: state.selectedProducts,
      total: state.total,
    })

    if (!saved) {
      set({ submitError: 'Не удалось сохранить заявку. Освободите место в браузере.' })
      return null
    }

    trackAnswers(state.answers)
    set({ status: 'submitted', submitError: null })

    const phone = import.meta.env.VITE_WHATSAPP_PHONE || '77001234567'
    return buildWhatsAppUrl(phone, message)
  },

  reset: () => {
    set({
      currentStepIndex: 0,
      answers: {},
      selectedProducts: [],
      subtotal: 0,
      total: 0,
      discountAmount: 0,
      modifiersTotal: 0,
      multiplier: 1,
      lead: emptyLead(),
      status: 'idle',
      submitError: null,
    })
  },
}))
