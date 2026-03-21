import { useState, useEffect } from 'react'
import {
  Bell, AlertCircle, CheckCircle,
  Clock, Info, AlertTriangle,
} from 'lucide-react'
import { getRdvs, getFactures } from '../../services/firestore'
import { format, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function AdminNotifications() {
  const [rdvs,       setRdvs]       = useState([])
  const [factures,   setFactures]   = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)

  useEffect(() => {
    const charger = async () => {
      setChargement(true)
      setErreur(null)
      try {
        const [r, f] = await Promise.all([getRdvs(), getFactures()])
        setRdvs(r)
        setFactures(f)
      } catch (e) {
        setErreur('Impossible de charger les notifications.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  // Générer les notifications depuis les données réelles
  const notifications = []

  // RDV du jour
  const rdvsAujourdhui = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && isToday(d) && r.statut !== 'annule'
  })
  if (rdvsAujourdhui.length > 0) {
    notifications.push({
      id:      'rdv-jour',
      type:    'info',
      titre:   `${rdvsAujourdhui.length} rendez-vous aujourd'hui`,
      message: `${rdvsAujourdhui.filter((r) => r.statut === 'termine').length} terminés, ${rdvsAujourdhui.filter((r) => ['confirme','arrive','en_attente'].includes(r.statut)).length} en attente`,
      icon:    Clock,
    })
  }

  // Factures impayées
  const impayees = factures.filter((f) => f.statut === 'impayee')
  if (impayees.length > 0) {
    notifications.push({
      id:      'factures-impayees',
      type:    'warning',
      titre:   `${impayees.length} facture${impayees.length > 1 ? 's' : ''} impayée${impayees.length > 1 ? 's' : ''}`,
      message: `Total en attente : ${impayees.reduce((a, f) => a + (f.montant || 0), 0).toLocaleString('fr-FR')} FCFA`,
      icon:    AlertTriangle,
    })
  }

  // RDV annulés récents
  const annules = rdvs.filter((r) => r.statut === 'annule')
  if (annules.length > 0) {
    notifications.push({
      id:      'rdv-annules',
      type:    'danger',
      titre:   `${annules.length} rendez-vous annulé${annules.length > 1 ? 's' : ''}`,
      message: 'Des rendez-vous ont été annulés récemment',
      icon:    AlertCircle,
    })
  }

  // RDV terminés
  const termines = rdvs.filter((r) => r.statut === 'termine')
  if (termines.length > 0) {
    notifications.push({
      id:      'rdv-termines',
      type:    'success',
      titre:   `${termines.length} consultation${termines.length > 1 ? 's' : ''} terminée${termines.length > 1 ? 's' : ''}`,
      message: 'Toutes les consultations terminées ont été enregistrées',
      icon:    CheckCircle,
    })
  }

  const TYPE_CONFIG = {
    info:    { bg: 'bg-info-50    border-info-100',    icon: 'text-info'    },
    warning: { bg: 'bg-warning-50 border-warning-100', icon: 'text-warning' },
    danger:  { bg: 'bg-danger-50  border-danger-100',  icon: 'text-danger'  },
    success: { bg: 'bg-success-50 border-success-100', icon: 'text-success' },
  }

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          {notifications.length} notification{notifications.length > 1 ? 's' : ''} · Basées sur les données en temps réel
        </p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucune notification</p>
          <p className="text-sm mt-1">Tout est à jour</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type]
            const Icon   = notif.icon
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border ${config.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white`}>
                  <Icon className={`w-5 h-5 ${config.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-text">{notif.titre}</p>
                  <p className="text-sm text-neutral-muted mt-0.5">{notif.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminNotifications