import { INITIAL_PRODUCTS } from '@/data/products'
import { QUIZ_STEPS } from '@/data/quizSteps'
import { matchProducts, volumeQty } from '@/lib/matchProducts'
import { calculateTotal } from '@/lib/pricing'
import { isValidPhone } from '@/lib/validation'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

export function runSelfCheck(): string[] {
  const logs: string[] = []

  const answers = {
    purpose: 'fragile',
    volume: ['vol-large', 'extra-bubble'],
    urgency: ['urgent', 'branding'],
  }

  assert(volumeQty(answers) === 250, 'volumeQty must respect vol-large')
  logs.push('volumeQty OK')

  const lines = matchProducts(answers, INITIAL_PRODUCTS, QUIZ_STEPS)
  assert(lines.length > 0, 'matchProducts must return lines')
  const box = lines.find((l) => l.productId === 'box-m')
  assert(Boolean(box && box.qty === 250), 'purpose products must follow volume qty')
  logs.push('matchProducts volume scaling OK')

  const priced = calculateTotal(lines, INITIAL_PRODUCTS, QUIZ_STEPS, answers)
  assert(priced.multiplier === 1.15, 'urgent multiplier must apply once')
  assert(priced.modifiersTotal >= 800, 'branding modifier must apply')
  assert(priced.total > 0, 'total must be positive')
  logs.push(`pricing OK (total=${priced.total})`)

  // Exclusive volumes should not stack in volumeQty if both somehow present —
  // vol-large wins by priority.
  assert(volumeQty({ volume: ['vol-small', 'vol-large'] }) === 250, 'largest volume wins')
  logs.push('volume priority OK')

  assert(isValidPhone('+7 700 123 45 67'), 'phone valid')
  assert(!isValidPhone('123'), 'phone invalid short')
  logs.push('phone validation OK')

  return logs
}
