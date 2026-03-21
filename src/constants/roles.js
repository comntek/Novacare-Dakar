export const ROLES = {
  VISITEUR: 'visiteur',
  PATIENT: 'patient',
  MEDECIN: 'medecin',
  SECRETAIRE: 'secretaire',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  [ROLES.VISITEUR]: 'Visiteur',
  [ROLES.PATIENT]: 'Patient',
  [ROLES.MEDECIN]: 'Médecin',
  [ROLES.SECRETAIRE]: 'Secrétaire',
  [ROLES.ADMIN]: 'Administrateur',
}

export const ROLE_COLORS = {
  [ROLES.PATIENT]: 'bg-blue-100 text-blue-700',
  [ROLES.MEDECIN]: 'bg-green-100 text-green-700',
  [ROLES.SECRETAIRE]: 'bg-amber-100 text-amber-700',
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
}

export const ROLE_REDIRECT = {
  [ROLES.PATIENT]: '/patient/dashboard',
  [ROLES.MEDECIN]: '/medecin/dashboard',
  [ROLES.SECRETAIRE]: '/secretaire/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
}