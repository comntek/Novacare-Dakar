export const RDV_STATUS = {
  EN_ATTENTE: 'en_attente',
  CONFIRME: 'confirme',
  ARRIVE: 'arrive',
  EN_CONSULTATION: 'en_consultation',
  TERMINE: 'termine',
  ANNULE: 'annule',
}

export const RDV_STATUS_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  arrive: 'Arrivé',
  en_consultation: 'En consultation',
  termine: 'Terminé',
  annule: 'Annulé',
}

export const RDV_STATUS_COLORS = {
  en_attente: 'bg-amber-100 text-amber-700',
  confirme: 'bg-green-100 text-green-700',
  arrive: 'bg-blue-100 text-blue-700',
  en_consultation: 'bg-purple-100 text-purple-700',
  termine: 'bg-gray-100 text-gray-600',
  annule: 'bg-red-100 text-red-700',
}

export const RDV_TYPES = {
  PRESENTIEL: 'presentiel',
  TELECONSULTATION: 'teleconsultation',
}

export const FACTURE_STATUS = {
  IMPAYEE: 'impayee',
  PAYEE: 'payee',
  ANNULEE: 'annulee',
}

export const FACTURE_STATUS_LABELS = {
  impayee: 'Impayée',
  payee: 'Payée',
  annulee: 'Annulée',
}

export const FACTURE_STATUS_COLORS = {
  impayee: 'bg-amber-100 text-amber-700',
  payee: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-700',
}

export const MODES_PAIEMENT = [
  { id: 'especes', label: 'Espèces' },
  { id: 'wave', label: 'Wave' },
  { id: 'orange_money', label: 'Orange Money' },
  { id: 'free_money', label: 'Free Money' },
  { id: 'carte', label: 'Carte bancaire' },
]