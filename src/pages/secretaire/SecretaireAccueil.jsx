import { useState, useEffect } from 'react'
import {
  Users, Clock, CheckCircle, XCircle,
  Loader2, RefreshCw, UserCheck, Stethoscope,
  AlertCircle, ChevronRight,
} from 'lucide-react'
import { ecouterRdvsDuJour, updateStatutRdv } from '../../services/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUTS = {
  en_attente:       { label: 'En attente',       classe: 'badge-neutral'  },
  confirme:         { label: 'Confirmé',          classe: 'badge-info'     },
  arrive:           { label: 'Arrivé',            classe: 'badge-warning'  },
  absent:           { label: 'Absent',            classe: 'badge-danger'   },
  en_consultation:  { label: 'En consultation',   classe: 'badge-accent'   },
  termine:          { label: 'Terminé',           classe: 'badge-success'  },
  annule:           { label: 'Annulé',            classe: 'badge-danger'   },
}

const TRANSITIONS = {
  en_attente:      { label: 'Marquer arrivé',       suivant: 'arrive',          icone: UserCheck    },
  confirme:        { label: 'Marquer arrivé',        suivant: 'arrive',          icone: UserCheck    },
  arrive:          { label: 'Envoyer en consult.',   suivant: 'en_consultation', icone: Stethoscope  },
  en_consultation: { label: 'Marquer terminé',       suivant: 'termine',         icone: CheckCircle  },
}

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function KpiCard({ icone: Icon, valeur, label, couleur }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`stat-icon ${couleur}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="stat-value">{valeur}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}

function CarteRdv({ rdv, onAction, actionEnCours }) {
  const statut     = STATUTS[rdv.statut]    || STATUTS.en_attente
  const transition = TRANSITIONS[rdv.statut]
  const enCours    = actionEnCours === rdv.id

  return (
    <div className={`card-hover animate-fade-in ${
      rdv.patientNonInscrit ? 'border-l-4 border-l-warning' : ''
    }`}>
      <div className="flex items-start gap-4">

        {/* Heure */}
        <div className="flex-shrink-0 text-center w-14">
          <p className="text-lg font-bold text-primary leading-none">{rdv.heure}</p>
          <p className="text-2xs text-neutral-muted mt-0.5">
            {rdv.type === 'teleconsultation' ? '📹 Télé' : '🏥 Présentiel'}
          </p>
        </div>

        {/* Séparateur vertical */}
        <div className="w-px self-stretch bg-neutral-border flex-shrink-0" />

        {/* Infos patient */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-neutral-text">{rdv.patientNom}</p>
            <span className={statut.classe}>{statut.label}</span>
            {/* Badge visiteur non inscrit */}
            {rdv.patientNonInscrit && (
              <span className="badge-warning flex items-center gap-1">
                ⚠️ Non inscrit · Site web
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-muted mt-0.5 truncate">{rdv.motif}</p>
          <p className="text-xs text-neutral-subtle mt-1">{rdv.medecinNom}</p>

          {/* Infos contact si non inscrit */}
          {rdv.patientNonInscrit && (rdv.patientTelephone || rdv.patientEmail) && (
            <div className="flex gap-3 mt-2 text-xs text-neutral-muted">
              {rdv.patientTelephone && (
                <span>📞 {rdv.patientTelephone}</span>
              )}
              {rdv.patientEmail && (
                <span>✉️ {rdv.patientEmail}</span>
              )}
            </div>
          )}
        </div>

        {/* Action */}
        {transition && rdv.statut !== 'termine' && rdv.statut !== 'annule' && (
          <div className="flex-shrink-0 flex flex-col gap-2">
            <button
              onClick={() => onAction(rdv.id, transition.suivant)}
              disabled={enCours}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              {enCours
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <transition.icone className="w-3.5 h-3.5" />
              }
              {transition.label}
            </button>
            {rdv.statut !== 'en_consultation' && (
              <button
                onClick={() => onAction(rdv.id, 'annule')}
                disabled={enCours}
                className="btn-sm btn-ghost text-danger hover:bg-danger-50
                           flex items-center gap-1.5 justify-center"
              >
                <XCircle className="w-3.5 h-3.5" />
                Annuler
              </button>
            )}
            {['en_attente', 'confirme', 'arrive'].includes(rdv.statut) && (
              <button
                onClick={() => onAction(rdv.id, 'absent')}
                disabled={enCours}
                className="btn-sm btn-ghost text-warning hover:bg-warning-50
                           flex items-center gap-1.5 justify-center"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Marquer absent
              </button>
            )}
          </div>
        )}

        {rdv.statut === 'termine' && (
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
        )}
      </div>
    </div>
  )
}

export function SecretaireAccueil() {
  const [rdvs,           setRdvs]           = useState([])
  const [chargement,     setChargement]     = useState(true)
  const [erreur,         setErreur]         = useState(null)
  const [actionEnCours,  setActionEnCours]  = useState(null)
  const [filtre,         setFiltre]         = useState('tous')

  // Écoute temps réel Firestore
  useEffect(() => {
    setChargement(true)
    setErreur(null)

    const unsub = ecouterRdvsDuJour((rdvsJour) => {
      const tries = [...rdvsJour].sort((a, b) => {
        const ha = a.heure || ''
        const hb = b.heure || ''
        return ha.localeCompare(hb)
      })
      setRdvs(tries)
      setChargement(false)
    })

    return () => unsub && unsub()
  }, [])

  const handleAction = async (rdvId, nouveauStatut) => {
    setActionEnCours(rdvId)
    try {
      await updateStatutRdv(rdvId, nouveauStatut)
    } catch (e) {
      setErreur('Impossible de mettre à jour le statut.')
    } finally {
      setActionEnCours(null)
    }
  }

  // KPIs calculés
  const total        = rdvs.length
  const enAttente    = rdvs.filter((r) => ['en_attente', 'confirme'].includes(r.statut)).length
  const enConsult    = rdvs.filter((r) => r.statut === 'en_consultation').length
  const termines     = rdvs.filter((r) => r.statut === 'termine').length
  const absents      = rdvs.filter((r) => r.statut === 'absent').length
  const annules      = rdvs.filter((r) => r.statut === 'annule').length

  // Filtrage
  const rdvFiltres = rdvs.filter((r) => {
    if (filtre === 'tous')            return true
    if (filtre === 'attente')         return ['en_attente', 'confirme', 'arrive'].includes(r.statut)
    if (filtre === 'en_consultation') return r.statut === 'en_consultation'
    if (filtre === 'termine')         return r.statut === 'termine'
    if (filtre === 'absent')          return r.statut === 'absent'
    if (filtre === 'annule')          return r.statut === 'annule'
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Accueil & File d'attente</h1>
          <p className="page-subtitle flex items-center gap-2">
            <span className="dot-live" />
            {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })} · Temps réel
          </p>
        </div>
      </div>

      {/* Erreur */}
      {erreur && (
        <div className="alert-error animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{erreur}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          icone={Users}
          valeur={total}
          label="RDV aujourd'hui"
          couleur="bg-info-50 text-info"
        />
        <KpiCard
          icone={Clock}
          valeur={enAttente}
          label="En attente"
          couleur="bg-warning-50 text-warning"
        />
        <KpiCard
          icone={Stethoscope}
          valeur={enConsult}
          label="En consultation"
          couleur="bg-accent-50 text-accent"
        />
        <KpiCard
          icone={CheckCircle}
          valeur={termines}
          label="Terminés"
          couleur="bg-success-50 text-success"
        />
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'tous',            label: `Tous (${total})`          },
          { id: 'attente',         label: `En attente (${enAttente})` },
          { id: 'en_consultation', label: `En consult. (${enConsult})` },
          { id: 'termine',         label: `Terminés (${termines})`   },
          { id: 'absent',          label: `Absents (${absents})`     },
          { id: 'annule',          label: `Annulés (${annules})`     },
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

      {/* Liste RDV */}
      {chargement ? (
        <div className="page-loader">
          <div className="text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-sm text-neutral-muted">Chargement de la file d'attente...</p>
          </div>
        </div>
      ) : rdvFiltres.length === 0 ? (
        <div className="empty-state">
          <Clock className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Aucun rendez-vous</p>
          <p className="text-sm mt-1">
            {filtre === 'tous'
              ? 'Aucun rendez-vous prévu aujourd\'hui'
              : 'Aucun rendez-vous dans cette catégorie'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvFiltres.map((rdv) => (
            <CarteRdv
              key={rdv.id}
              rdv={rdv}
              onAction={handleAction}
              actionEnCours={actionEnCours}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SecretaireAccueil