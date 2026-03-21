import {
  format,
  formatDistance,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  isValid,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export function toDate(value) {
  if (!value) return null
  if (value?.toDate) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : null
  }
  if (typeof value === 'number') return new Date(value)
  return null
}

export function formatDate(value, pattern = 'dd MMMM yyyy') {
  const date = toDate(value)
  if (!date) return '—'
  return format(date, pattern, { locale: fr })
}

export function formatDateShort(value) {
  return formatDate(value, 'dd/MM/yyyy')
}

export function formatDateTime(value) {
  return formatDate(value, 'dd/MM/yyyy à HH:mm')
}

export function formatTime(value) {
  return formatDate(value, 'HH:mm')
}

export function formatRelativeDate(value) {
  const date = toDate(value)
  if (!date) return '—'
  if (isToday(date)) return `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`
  if (isTomorrow(date)) return `Demain à ${format(date, 'HH:mm', { locale: fr })}`
  if (isYesterday(date)) return `Hier à ${format(date, 'HH:mm', { locale: fr })}`
  return format(date, 'EEE d MMM à HH:mm', { locale: fr })
}

export function fromNow(value) {
  const date = toDate(value)
  if (!date) return '—'
  return formatDistance(date, new Date(), { addSuffix: true, locale: fr })
}

export function formatMonth(value) {
  return formatDate(value, 'MMMM yyyy')
}

export function formatDayName(value, short = false) {
  return formatDate(value, short ? 'EEE' : 'EEEE')
}

export function generateTimeSlots(startHour = 8, endHour = 18, intervalMinutes = 30) {
  const slots = []
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      slots.push(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      )
    }
  }
  return slots
}

export function calculateAge(dateNaissance) {
  const date = toDate(dateNaissance)
  if (!date) return null
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const m = today.getMonth() - date.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--
  return age
}