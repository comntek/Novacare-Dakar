import { RDV_STATUS_COLORS, RDV_STATUS_LABELS, FACTURE_STATUS_COLORS, FACTURE_STATUS_LABELS } from '../../constants/status'

export function RdvStatusBadge({ statut }) {
  const color = RDV_STATUS_COLORS[statut] || 'bg-gray-100 text-gray-600'
  const label = RDV_STATUS_LABELS[statut] || statut
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}

export function FactureStatusBadge({ statut }) {
  const color = FACTURE_STATUS_COLORS[statut] || 'bg-gray-100 text-gray-600'
  const label = FACTURE_STATUS_LABELS[statut] || statut
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}

export default RdvStatusBadge