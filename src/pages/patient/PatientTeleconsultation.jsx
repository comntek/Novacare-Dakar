import { useState, useEffect } from 'react'
import {
  Video, AlertCircle, Calendar,
  Clock, ExternalLink, CheckCircle,
} from 'lucide-react'
import { getRdvsByPatient } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, isToday, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function PatientTeleconsultation() {
  const { user }     = useAuthStore()
  const [rdvs,       setRdvs]       = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)
  const [filtre,     setFiltre]     = useState('avenir')

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const data = await getRdvsByPatient(user.uid)
        setRdvs(data.filter((r) => r.type === 'teleconsultation'))
      } catch (e) {
        setErreur('Impossible de charger vos téléconsultations.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const rdvsFiltres = rdvs.filter((r) => {
    const d = toDate(r.date)
    if (!d) return false
    if (filtre === 'avenir')  return (isToday(d) || isFuture(d)) && r.statut !== 'annule'
    if (filtre === 'termines') return r.statut === 'termine'
    return true
  }).sort((a, b) => toDate(a.date) - toDate(b.date))

  const nbAvenir   = rdvs.filter((r) => { const d = toDate(r.date); return d && (isToday(d) || isFuture(d)) && r.statut !== 'annule' }).length
  const nbTermines = rdvs.filter((r) => r.statut === 'termine').length

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
        <h1 className="page-title">Téléconsultations</h1>
        <p className="page-subtitle">Consultations vidéo avec votre médecin</p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2">
        {[
          { id: 'avenir',   label: `À venir (${nbAvenir})`    },
          { id: 'termines', label: `Terminées (${nbTermines})` },
          { id: 'tous',     label: `Toutes (${rdvs.length})`   },
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
          <Video className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucune téléconsultation</p>
          <p className="text-sm mt-1">
            {filtre === 'avenir'
              ? 'Aucune téléconsultation à venir'
              : 'Aucune téléconsultation dans cette catégorie'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvsFiltres.map((rdv) => {
            const date       = toDate(rdv.date)
            const peutRejoin = ['confirme', 'arrive', 'en_consultation'].includes(rdv.statut)
            const lienJitsi  = `https://meet.jit.si/NovaCare-${rdv.id}`

            return (
              <div key={rdv.id} className="card space-y-3">
                <div className="flex items-start gap-4">
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${peutRejoin ? 'bg-info-50 text-info' : 'bg-neutral-bg text-neutral-muted'}
                  `}>
                    <Video className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-text">{rdv.motif}</p>
                      {isToday(date) && <span className="badge-primary">Aujourd'hui</span>}
                    </div>
                    <p className="text-sm text-neutral-muted mt-0.5">{rdv.medecinNom}</p>
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

                  {rdv.statut === 'termine' && (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  )}
                </div>

                {peutRejoin && (
                  <div className="pt-3 border-t border-neutral-border">
                    <a
                      href={lienJitsi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary btn-sm inline-flex items-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Rejoindre la séance
                      <ExternalLink className="w-3 h-3" />
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

export default PatientTeleconsultation