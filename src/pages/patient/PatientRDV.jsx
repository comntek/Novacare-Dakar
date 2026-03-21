import { useState, useEffect } from 'react'
import {
  Calendar, Video, Stethoscope, AlertCircle,
  Clock, CheckCircle, XCircle, Filter,
} from 'lucide-react'
import { getRdvsByPatient } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, isToday, isFuture, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const STATUTS = {
  en_attente:      { label: 'En attente',      classe: 'badge-neutral'  },
  confirme:        { label: 'Confirmé',         classe: 'badge-info'     },
  arrive:          { label: 'Arrivé',           classe: 'badge-warning'  },
  en_consultation: { label: 'En consultation',  classe: 'badge-accent'   },
  termine:         { label: 'Terminé',          classe: 'badge-success'  },
  annule:          { label: 'Annulé',           classe: 'badge-danger'   },
}

export function PatientRDV() {
  const { user }      = useAuthStore()
  const [rdvs,        setRdvs]        = useState([])
  const [chargement,  setChargement]  = useState(true)
  const [erreur,      setErreur]      = useState(null)
  const [filtre,      setFiltre]      = useState('avenir')

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const data = await getRdvsByPatient(user.uid)
        setRdvs(data)
      } catch (e) {
        setErreur('Impossible de charger vos rendez-vous.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const rdvsFiltres = rdvs.filter((r) => {
    const d = toDate(r.date)
    if (!d) return false
    if (filtre === 'avenir')   return (isToday(d) || isFuture(d)) && r.statut !== 'annule'
    if (filtre === 'passes')   return isPast(d) && !isToday(d)
    if (filtre === 'annules')  return r.statut === 'annule'
    return true
  }).sort((a, b) => {
    const da = toDate(a.date)
    const db = toDate(b.date)
    return filtre === 'passes' ? db - da : da - db
  })

  const nbAvenir  = rdvs.filter((r) => { const d = toDate(r.date); return d && (isToday(d) || isFuture(d)) && r.statut !== 'annule' }).length
  const nbPasses  = rdvs.filter((r) => { const d = toDate(r.date); return d && isPast(d) && !isToday(d) }).length
  const nbAnnules = rdvs.filter((r) => r.statut === 'annule').length

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
        <h1 className="page-title">Mes rendez-vous</h1>
        <p className="page-subtitle">{rdvs.length} rendez-vous au total</p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'avenir',  label: `À venir (${nbAvenir})`   },
          { id: 'passes',  label: `Passés (${nbPasses})`    },
          { id: 'annules', label: `Annulés (${nbAnnules})`  },
          { id: 'tous',    label: `Tous (${rdvs.length})`   },
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

      {rdvsFiltres.length === 0 ? (
        <div className="empty-state">
          <Calendar className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Aucun rendez-vous</p>
          <p className="text-sm mt-1">
            {filtre === 'avenir' ? 'Aucun rendez-vous à venir' : 'Aucun rendez-vous dans cette catégorie'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvsFiltres.map((rdv) => {
            const date   = toDate(rdv.date)
            const statut = STATUTS[rdv.statut] || STATUTS.en_attente
            const auj    = date && isToday(date)

            return (
              <div key={rdv.id} className="card-hover">
                <div className="flex items-start gap-4">

                  {/* Icône type */}
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${rdv.type === 'teleconsultation' ? 'bg-info-50 text-info' : 'bg-primary-50 text-primary'}
                  `}>
                    {rdv.type === 'teleconsultation'
                      ? <Video className="w-5 h-5" />
                      : <Stethoscope className="w-5 h-5" />
                    }
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-text">{rdv.motif}</p>
                      <span className={`badge ${statut.classe}`}>{statut.label}</span>
                      {auj && <span className="badge-primary">Aujourd'hui</span>}
                    </div>
                    <p className="text-sm text-neutral-muted mt-0.5">{rdv.medecinNom}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date ? format(date, 'dd MMMM yyyy', { locale: fr }) : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rdv.heure}
                      </span>
                      <span className="capitalize">
                        {rdv.type === 'teleconsultation' ? '📹 Téléconsultation' : '🏥 Présentiel'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lien Jitsi si téléconsultation à venir */}
                {rdv.type === 'teleconsultation' &&
                 ['confirme', 'arrive', 'en_consultation'].includes(rdv.statut) && (
                  <div className="mt-3 pt-3 border-t border-neutral-border">
                    <a
                      href={`https://meet.jit.si/NovaCare-${rdv.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary btn-sm inline-flex items-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Rejoindre la séance vidéo
                    </a>
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

export default PatientRDV