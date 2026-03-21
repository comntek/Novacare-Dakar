import { useState, useEffect } from 'react'
import {
  BookOpen, AlertCircle, Calendar,
  User, FileText, CreditCard,
  Stethoscope,
} from 'lucide-react'
import { getRdvs, getFactures, getConsultationsByMedecin } from '../../services/firestore'
import { getMedecins } from '../../services/firestore'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function AdminJournal() {
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
        setErreur('Impossible de charger le journal.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  // Construire les événements du journal depuis les données réelles
  const evenements = [
    ...rdvs.map((r) => ({
      id:      `rdv-${r.id}`,
      type:    'rdv',
      titre:   `RDV — ${r.patientNom}`,
      detail:  `${r.motif} · ${r.medecinNom}`,
      statut:  r.statut,
      date:    toDate(r.date),
      icon:    Calendar,
    })),
    ...factures.map((f) => ({
      id:      `fact-${f.id}`,
      type:    'facture',
      titre:   `Facture — ${f.patientNom}`,
      detail:  `${f.service} · ${f.montant?.toLocaleString('fr-FR')} FCFA`,
      statut:  f.statut,
      date:    toDate(f.dateCreation),
      icon:    CreditCard,
    })),
  ]
  .filter((e) => e.date)
  .sort((a, b) => b.date - a.date)
  .slice(0, 50)

  const groupesDate = evenements.reduce((acc, e) => {
    const d = e.date
    let label
    if (isToday(d))     label = 'Aujourd\'hui'
    else if (isYesterday(d)) label = 'Hier'
    else                label = format(d, 'dd MMMM yyyy', { locale: fr })

    if (!acc[label]) acc[label] = []
    acc[label].push(e)
    return acc
  }, {})

  const STATUT_COULEUR = {
    termine:         'text-success',
    payee:           'text-success',
    annule:          'text-danger',
    impayee:         'text-warning',
    confirme:        'text-info',
    en_consultation: 'text-accent',
    arrive:          'text-warning',
    en_attente:      'text-neutral-muted',
  }

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement du journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Journal d'activité</h1>
        <p className="page-subtitle">Historique des événements de NovaCare Dakar</p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {Object.keys(groupesDate).length === 0 ? (
        <div className="empty-state">
          <BookOpen className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucun événement enregistré</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupesDate).map(([label, events]) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm font-bold text-neutral-text">{label}</p>
                <div className="flex-1 h-px bg-neutral-border" />
                <p className="text-xs text-neutral-muted">{events.length} événement{events.length > 1 ? 's' : ''}</p>
              </div>

              <div className="space-y-2">
                {events.map((e) => {
                  const Icon = e.icon
                  return (
                    <div key={e.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-neutral-border/60">
                      <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                        ${e.type === 'rdv' ? 'bg-primary-50 text-primary' : 'bg-accent-50 text-accent'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-text truncate">{e.titre}</p>
                        <p className="text-xs text-neutral-muted truncate">{e.detail}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-semibold ${STATUT_COULEUR[e.statut] || 'text-neutral-muted'}`}>
                          {e.statut?.replace('_', ' ')}
                        </p>
                        <p className="text-2xs text-neutral-muted mt-0.5">
                          {e.date ? format(e.date, 'HH:mm') : '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminJournal