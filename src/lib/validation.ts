export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone)
  // KZ/RU style numbers: 10–11 digits, or international up to 15
  return digits.length >= 10 && digits.length <= 15
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0
}
