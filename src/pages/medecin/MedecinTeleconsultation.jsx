import { useState, useEffect } from 'react'
import {
  Video, AlertCircle, Loader2,
  Calendar, Clock, ExternalLink,
  CheckCircle, User,
} from 'lucide-react'
import { getRdvsByMedecin } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, isToday, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function genererLienJitsi(rdvId) {
  return `https://meet.jit.si/NovaCare-${rdvId}`
}

const STATUTS = {
  confirme:        { label: 'Confirmé',        classe: 'badge-info'    },
  arrive:          { label: 'Arrivé',           classe: 'badge-warning' },
  en_consultation: { label: 'En cours',         classe: 'badge-accent'  },
  termine:         { label: 'Terminé',          classe: 'badge-success' },
  annule:          { label: 'Annulé',           classe: 'badge-danger'  },
  en_attente:      { label: 'En attente',       classe: 'badge-neutral' },
}

export function MedecinTeleconsultation() {
  const { user }      = useAuthStore()
  const [rdvs,        setRdvs]        = useState([])
  const [chargement,  setChargement]  = useState(true)
  const [erreur,      setErreur]      = useState(null)
  const [filtre,      setFiltre]      = useState('aujourd_hui')

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const data = await getRdvsByMedecin(user.uid)
        const telecs = data.filter((r) => r.type === 'teleconsultation')
        setRdvs(telecs)
      } catch (e) {
        setErreur('Impossible de charger les téléconsultations.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const rdvsFiltres = rdvs.filter((r) => {
    const d = toDate(r.date)
    if (!d) return false
    if (filtre === 'aujourd_hui') return isToday(d)
    if (filtre === 'a_venir')     return isFuture(d) && !isToday(d)
    if (filtre === 'termines')    return r.statut === 'termine'
    return true
  })

  const totalAujourdhui = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && isToday(d)
  }).length

  const totalAvenir = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && isFuture(d) && !isToday(d)
  }).length

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

      {/* Header */}
      <div>
        <h1 className="page-title">Téléconsultations</h1>
        <p className="page-subtitle">
          {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="stat-value text-primary">{totalAujourdhui}</p>
          <p className="stat-label">Aujourd'hui</p>
        </div>
        <div className="card text-center">
          <p className="stat-value text-info">{totalAvenir}</p>
          <p className="stat-label">À venir</p>
        </div>
        <div className="card text-center">
          <p className="stat-value text-success">
            {rdvs.filter((r) => r.statut === 'termine').length}
          </p>
          <p className="stat-label">Terminées</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'aujourd_hui', label: `Aujourd'hui (${totalAujourdhui})` },
          { id: 'a_venir',     label: `À venir (${totalAvenir})`         },
          { id: 'termines',    label: 'Terminées'                         },
          { id: 'tous',        label: `Toutes (${rdvs.length})`           },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFiltre(id)}
            className={`
              px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-250
              ${filtre === id
                ? 'bg-primary text-white shadow-btn'
                : 'bg-white border border-neutral-border text-neutral-subtle hover:border-primary hover:text-primary'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {rdvsFiltres.length === 0 ? (
        <div className="empty-state">
          <Video className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucune téléconsultation</p>
          <p className="text-sm mt-1">
            {filtre === 'aujourd_hui'
              ? 'Aucune téléconsultation prévue aujourd\'hui'
              : 'Aucune téléconsultation dans cette catégorie'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvsFiltres.map((rdv) => {
            const statut     = STATUTS[rdv.statut] || STATUTS.en_attente
            const date       = toDate(rdv.date)
            const estAujourd = date && isToday(date)
            const peutLancer = ['confirme', 'arrive', 'en_consultation'].includes(rdv.statut)
            const lienJitsi  = genererLienJitsi(rdv.id)

            return (
              <div key={rdv.id} className="card-hover">
                <div className="flex items-start gap-4">

                  {/* Icône vidéo */}
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${peutLancer ? 'bg-info-50 text-info' : 'bg-neutral-bg text-neutral-muted'}
                  `}>
                    <Video className="w-5 h-5" />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-text">{rdv.patientNom}</p>
                      <span className={`badge ${statut.classe}`}>{statut.label}</span>
                      {estAujourd && (
                        <span className="badge-primary">Aujourd'hui</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-muted mt-0.5 truncate">{rdv.motif}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date ? format(date, 'dd MMM yyyy', { locale: fr }) : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rdv.heure}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {peutLancer ? (
                      <a
                        href={lienJitsi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary btn-sm flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Lancer
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : rdv.statut === 'termine' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : null}
                  </div>
                </div>

                {/* Lien Jitsi visible */}
                {peutLancer && (
                  <div className="mt-3 pt-3 border-t border-neutral-border">
                    <p className="text-xs text-neutral-muted mb-1">Lien de la séance :</p>
                    <div className="flex items-center gap-2 bg-neutral-bg rounded-lg px-3 py-2">
                      <p className="text-xs text-primary truncate flex-1">{lienJitsi}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(lienJitsi)}
                        className="text-xs text-neutral-muted hover:text-primary transition-colors flex-shrink-0"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MedecinTeleconsultation