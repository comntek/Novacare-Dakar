export function generateNumeroDossier(sequence) {
  const year = new Date().getFullYear()
  const num = String(sequence).padStart(4, '0')
  return `PAT-${year}-${num}`
}

export function generateNumeroFacture(sequence) {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const num = String(sequence).padStart(4, '0')
  return `FAC-${year}${month}-${num}`
}

export function generateUniqueId(prefix = '') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${random}`.toUpperCase()
}

export function generateRoomToken(rdvId, patientId, medecinId) {
  const base = `${rdvId}-${patientId}-${medecinId}`
  return btoa(base).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}