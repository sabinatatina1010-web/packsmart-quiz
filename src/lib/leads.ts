import type { LeadRecord } from '@/types/quiz'

const LEADS_KEY = 'packsmart_leads'
const STATS_KEY = 'packsmart_option_stats'
const PRODUCTS_KEY = 'packsmart_products'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function loadLeads(): LeadRecord[] {
  const leads = readJson<LeadRecord[]>(LEADS_KEY, [])
  return Array.isArray(leads) ? leads : []
}

export function saveLead(lead: LeadRecord): boolean {
  const leads = loadLeads()
  leads.unshift(lead)
  return writeJson(LEADS_KEY, leads)
}

export function loadOptionStats(): Record<string, number> {
  const stats = readJson<Record<string, number>>(STATS_KEY, {})
  return stats && typeof stats === 'object' ? stats : {}
}

export function trackAnswers(answers: Record<string, string | string[]>): boolean {
  const stats = loadOptionStats()
  for (const value of Object.values(answers)) {
    const ids = Array.isArray(value) ? value : [value]
    for (const id of ids) {
      if (!id) continue
      stats[id] = (stats[id] ?? 0) + 1
    }
  }
  return writeJson(STATS_KEY, stats)
}

function looksLikeProduct(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.retailPrice === 'number' &&
    typeof item.wholesalePrice === 'number' &&
    typeof item.unit === 'string'
  )
}

export function loadStoredProducts<T>(fallback: T): T {
  const stored = readJson<unknown>(PRODUCTS_KEY, null)
  if (!Array.isArray(stored) || stored.length === 0) return fallback
  if (!stored.every(looksLikeProduct)) return fallback
  return stored as T
}

export function saveStoredProducts<T>(products: T): boolean {
  return writeJson(PRODUCTS_KEY, products)
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
