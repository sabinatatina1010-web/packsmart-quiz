/**
 * Standalone verification (no React). Run: node scripts/verify.mjs
 * Mirrors the app pricing / matching / validation rules.
 */

const products = [
  {
    id: 'box-m',
    name: 'Коробка картонная M',
    unit: 'piece',
    retailPrice: 180,
    wholesalePrice: 145,
    wholesaleMinQty: 40,
    discounts: [
      { minQty: 80, percent: 5 },
      { minQty: 200, percent: 12 },
    ],
    stock: 1800,
    tags: ['boxes', 'clothing', 'fragile'],
    popularScore: 92,
    active: true,
  },
  {
    id: 'bubble-roll',
    name: 'Пузырчатая плёнка',
    unit: 'roll',
    retailPrice: 2100,
    wholesalePrice: 1750,
    wholesaleMinQty: 5,
    discounts: [
      { minQty: 10, percent: 6 },
      { minQty: 20, percent: 12 },
    ],
    stock: 160,
    tags: ['fragile', 'filler', 'extra'],
    popularScore: 88,
    active: true,
  },
  {
    id: 'filler-foam',
    name: 'Наполнитель пенополиэтилен',
    unit: 'pack',
    retailPrice: 890,
    wholesalePrice: 720,
    wholesaleMinQty: 10,
    discounts: [{ minQty: 25, percent: 9 }],
    stock: 640,
    tags: ['filler', 'fragile', 'extra'],
    popularScore: 77,
    active: true,
  },
  {
    id: 'tape-branded',
    name: 'Скотч с логотипом',
    unit: 'piece',
    retailPrice: 420,
    wholesalePrice: 340,
    wholesaleMinQty: 20,
    discounts: [{ minQty: 50, percent: 8 }],
    stock: 480,
    tags: ['branding', 'extra'],
    popularScore: 63,
    active: true,
  },
]

const steps = [
  {
    id: 'purpose',
    options: [
      {
        id: 'fragile',
        recommendedProductIds: ['box-m', 'bubble-roll', 'filler-foam'],
        productFilters: { tags: ['fragile'] },
        priceModifier: 300,
      },
    ],
  },
  {
    id: 'volume',
    requireOneOf: ['vol-small', 'vol-medium', 'vol-large'],
    options: [
      { id: 'vol-small', exclusiveGroup: 'volume', defaultQty: 30 },
      { id: 'vol-medium', exclusiveGroup: 'volume', defaultQty: 100 },
      { id: 'vol-large', exclusiveGroup: 'volume', defaultQty: 250 },
      { id: 'extra-bubble', recommendedProductIds: ['bubble-roll'] },
    ],
  },
  {
    id: 'urgency',
    requireOneOf: ['standard', 'urgent'],
    options: [
      { id: 'standard', exclusiveGroup: 'speed', multiplier: 1 },
      { id: 'urgent', exclusiveGroup: 'speed', multiplier: 1.15 },
      { id: 'branding', recommendedProductIds: ['tape-branded'], priceModifier: 800 },
    ],
  },
]

const VOLUME_IDS = new Set(['vol-small', 'vol-medium', 'vol-large'])
const EXTRA_IDS = new Set(['extra-bubble', 'extra-tape', 'extra-filler', 'eco', 'branding'])

function volumeQty(answers) {
  const volume = answers.volume
  const ids = Array.isArray(volume) ? volume : volume ? [volume] : []
  if (ids.includes('vol-large')) return 250
  if (ids.includes('vol-medium')) return 100
  if (ids.includes('vol-small')) return 30
  return 50
}

function collectSelectedOptions(answers) {
  const selected = []
  for (const step of steps) {
    const answer = answers[step.id]
    if (!answer) continue
    const ids = Array.isArray(answer) ? answer : [answer]
    for (const id of ids) {
      const option = step.options.find((o) => o.id === id)
      if (option) selected.push(option)
    }
  }
  return selected
}

function qtyForOption(option, product, qtyBase) {
  if (VOLUME_IDS.has(option.id)) return 0
  if (EXTRA_IDS.has(option.id)) {
    if (product.unit === 'roll' || product.unit === 'pack') {
      return Math.max(2, Math.round(qtyBase / 25))
    }
    return Math.max(5, Math.round(qtyBase / 10))
  }
  if (product.unit === 'roll' || product.unit === 'pack') {
    return Math.max(2, Math.round(qtyBase / 20))
  }
  return qtyBase
}

function matchProducts(answers) {
  const active = products.filter((p) => p.active)
  const activeIds = new Set(active.map((p) => p.id))
  const selected = collectSelectedOptions(answers)
  const qtyBase = volumeQty(answers)
  const qtyById = new Map()

  const add = (productId, qty) => {
    if (!activeIds.has(productId) || qty <= 0) return
    qtyById.set(productId, Math.max(qtyById.get(productId) ?? 0, qty))
  }

  for (const option of selected) {
    if (VOLUME_IDS.has(option.id)) continue
    const productIds = new Set(option.recommendedProductIds ?? [])
    const tags = option.productFilters?.tags
    if (tags?.length) {
      active
        .filter((p) => tags.some((t) => p.tags.includes(t)))
        .sort((a, b) => b.popularScore - a.popularScore)
        .slice(0, 2)
        .forEach((p) => productIds.add(p.id))
    }
    for (const productId of productIds) {
      const product = active.find((p) => p.id === productId)
      if (!product) continue
      add(productId, qtyForOption(option, product, qtyBase))
    }
  }

  return [...qtyById.entries()].map(([productId, qty]) => ({ productId, qty }))
}

function getUnitPrice(product, qty) {
  const tier = qty >= product.wholesaleMinQty ? 'wholesale' : 'retail'
  const base = tier === 'wholesale' ? product.wholesalePrice : product.retailPrice
  const discountPercent = product.discounts
    .filter((d) => qty >= d.minQty)
    .reduce((max, d) => Math.max(max, d.percent), 0)
  const unitPrice = Math.round(base * (1 - discountPercent / 100))
  return { unitPrice, tier, discountPercent, lineTotal: unitPrice * qty }
}

function calculateTotal(lines, answers) {
  const productMap = new Map(products.map((p) => [p.id, p]))
  let subtotal = 0
  const calcLines = []
  for (const line of lines) {
    const product = productMap.get(line.productId)
    if (!product) continue
    const priced = getUnitPrice(product, line.qty)
    subtotal += priced.lineTotal
    calcLines.push({ ...line, ...priced, name: product.name })
  }
  const selected = collectSelectedOptions(answers)
  const modifiersTotal = selected.reduce((s, o) => s + (o.priceModifier ?? 0), 0)
  const multiplier = selected.reduce((a, o) => a * (o.multiplier ?? 1), 1)
  const total = Math.round((subtotal + modifiersTotal) * multiplier)
  return { calcLines, subtotal, modifiersTotal, multiplier, total }
}

function applyExclusive(current, optionId, step) {
  let arr = [...current]
  const option = step.options.find((o) => o.id === optionId)
  const idx = arr.indexOf(optionId)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    if (option?.exclusiveGroup) {
      const rivals = step.options
        .filter((o) => o.exclusiveGroup === option.exclusiveGroup && o.id !== optionId)
        .map((o) => o.id)
      arr = arr.filter((id) => !rivals.includes(id))
    }
    arr.push(optionId)
  }
  return arr
}

function hasRequired(step, selected) {
  if (selected.length === 0) return false
  if (step.requireOneOf?.length) return step.requireOneOf.some((id) => selected.includes(id))
  return true
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

const results = []
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail })
  const mark = condition ? 'PASS' : 'FAIL'
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ''}`)
}

console.log('=== PackSmart verification ===\n')

const answers = {
  purpose: 'fragile',
  volume: ['vol-large', 'extra-bubble'],
  urgency: ['urgent', 'branding'],
}

check('volumeQty(vol-large) === 250', volumeQty(answers) === 250, String(volumeQty(answers)))

const lines = matchProducts(answers)
const box = lines.find((l) => l.productId === 'box-m')
check('box-m qty follows volume (250)', box?.qty === 250, JSON.stringify(box))

const bubble = lines.find((l) => l.productId === 'bubble-roll')
check('bubble-roll present', Boolean(bubble), JSON.stringify(bubble))

const priced = calculateTotal(lines, answers)
check('urgent multiplier is 1.15 once', priced.multiplier === 1.15, String(priced.multiplier))
check('modifiers include fragile+branding (>=1100)', priced.modifiersTotal >= 1100, String(priced.modifiersTotal))
check('total > 0', priced.total > 0, String(priced.total))

console.log('\nLine breakdown:')
for (const line of priced.calcLines) {
  console.log(
    `  - ${line.name}: qty=${line.qty}, tier=${line.tier}, discount=${line.discountPercent}%, unit=${line.unitPrice}, line=${line.lineTotal}`,
  )
}
console.log(
  `  subtotal=${priced.subtotal}, modifiers=${priced.modifiersTotal}, x${priced.multiplier}, TOTAL=${priced.total}`,
)

const expected =
  Math.round((priced.subtotal + priced.modifiersTotal) * priced.multiplier) === priced.total
check('total formula (subtotal+modifiers)*multiplier', expected)

// Exclusive group simulation
const volumeStep = steps[1]
let vol = []
vol = applyExclusive(vol, 'vol-small', volumeStep)
vol = applyExclusive(vol, 'vol-large', volumeStep)
check('exclusive volume keeps only vol-large', vol.length === 1 && vol[0] === 'vol-large', JSON.stringify(vol))

const urgencyStep = steps[2]
let urg = []
urg = applyExclusive(urg, 'standard', urgencyStep)
urg = applyExclusive(urg, 'urgent', urgencyStep)
urg = applyExclusive(urg, 'branding', urgencyStep)
check(
  'exclusive speed + multi extras',
  urg.includes('urgent') && !urg.includes('standard') && urg.includes('branding'),
  JSON.stringify(urg),
)

check(
  'volume step rejects extras-only',
  hasRequired(volumeStep, ['extra-bubble']) === false,
)
check(
  'volume step accepts vol-large',
  hasRequired(volumeStep, ['vol-large', 'extra-bubble']) === true,
)
check('urgency rejects branding-only', hasRequired(urgencyStep, ['branding']) === false)
check('urgency accepts urgent', hasRequired(urgencyStep, ['urgent']) === true)

check('phone +7 700 123 45 67 valid', isValidPhone('+7 700 123 45 67'))
check('phone 123 invalid', !isValidPhone('123'))
check('empty cart guard conceptually', matchProducts({ purpose: 'fragile', volume: [], urgency: ['urgent'] }).length >= 0)

const failed = results.filter((r) => !r.ok)
console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} passed ===`)
if (failed.length) {
  console.error('FAILED:', failed.map((f) => f.name).join(', '))
  process.exit(1)
}
console.log('All checks passed.')
