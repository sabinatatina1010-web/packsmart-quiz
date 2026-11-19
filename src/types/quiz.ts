export interface QuizOption {
  id: string
  label: string
  description?: string
  icon: string
  /** Options with the same group replace each other (e.g. volume size, delivery speed). */
  exclusiveGroup?: string
  priceModifier?: number
  multiplier?: number
  productFilters?: {
    tags?: string[]
    specs?: Record<string, string>
  }
  recommendedProductIds?: string[]
  defaultQty?: number
}

export interface QuizStep {
  id: string
  title: string
  subtitle?: string
  required: boolean
  multiSelect?: boolean
  /** For multiSelect steps: at least one of these option ids must be chosen. */
  requireOneOf?: string[]
  options: QuizOption[]
}

export interface LeadForm {
  name: string
  phone: string
  company: string
  comment: string
}

export interface CartLine {
  productId: string
  qty: number
}

export interface LeadRecord {
  id: string
  createdAt: string
  lead: LeadForm
  answers: Record<string, string | string[]>
  lines: CartLine[]
  total: number
}

export type QuizStatus = 'idle' | 'calculating' | 'ready' | 'submitted'

export interface QuizState {
  currentStepIndex: number
  answers: Record<string, string | string[]>
  selectedProducts: CartLine[]
  subtotal: number
  total: number
  discountAmount: number
  modifiersTotal: number
  lead: LeadForm
  status: QuizStatus
}
