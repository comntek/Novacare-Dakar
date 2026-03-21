import { useState, useEffect } from 'react'
import {
  Calendar, Users, ClipboardList, TrendingUp,
  Clock, CheckCircle, AlertCircle, Loader2,
  ArrowRight, Stethoscope,
} from 'lucide-react'
import {
  getRdvsByMedecin, getConsultationsByMedecin, getPatientsByMedecin,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function KpiCard({ icone: Icon, valeur, label, couleur, sousTitre }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`stat-icon ${couleur}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="stat-value">{valeur}</p>
        <p className="stat-label">{label}</p>
        {sousTitre && <p className="text-2xs text-neutral-muted mt-0.5">{sousTitre}</p>}
      </div>
    </div>
  )
}

export function MedecinDashboard() {
  const { user }    = useAuthStore()
  const navigate    = useNavigate()

  const [rdvs,          setRdvs]          = useState([])
  const [consultations, setConsultations] = useState([])
  const [patients,      setPatients]      = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const [r, c, p] = await Promise.all([
          getRdvsByMedecin(user.uid),
          getConsultationsByMedecin(user.uid),
          getPatientsByMedecin(user.uid),
        ])
        setRdvs(r)
        setConsultations(c)
        setPatients(p)
      } catch (e) {
        setErreur('Impossible de charger les données.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  // KPIs
  const rdvsAujourdhui = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && isToday(d)
  })

  const rdvsEnAttente = rdvsAujourdhui.filter((r) =>
    ['confirme', 'arrive', 'en_attente'].includes(r.statut)
  ).length

  const rdvsTermines = rdvs.filter((r) => r.statut === 'termine').length

  const prochainsRdvs = rdvsAujourdhui
    .filter((r) => !['termine', 'annule'].includes(r.statut))
    .sort((a, b) => (a.heure || '').localeCompare(b.heure || ''))
    .slice(0, 5)

  const dernieresConsultations = consultations.slice(0, 3)

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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Bonjour, Dr. {user?.prenom} {user?.nom} 👋
          </h1>
          <p className="page-subtitle">
            {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        {user?.specialite && (
          <span className="badge-primary text-sm px-3 py-1.5">
            {user.specialite}
          </span>
        )}
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icone={Calendar}
          valeur={rdvsAujourdhui.length}
          label="RDV aujourd'hui"
          sousTitre={`${rdvsEnAttente} en attente`}
          couleur="bg-info-50 text-info"
        />
        <KpiCard
          icone={CheckCircle}
          valeur={rdvsTermines}
          label="Consultations totales"
          couleur="bg-success-50 text-success"
        />
        <KpiCard
          icone={Users}
          valeur={patients.length}
          label="Mes patients"
          couleur="bg-primary-50 text-primary"
        />
        <KpiCard
          icone={ClipboardList}
          valeur={consultations.length}
          label="Dossiers créés"
          couleur="bg-accent-50 text-accent"
        />
      </div>

      {/* Prochains RDV du jour */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Prochains rendez-vous</h2>
          <button
            onClick={() => navigate('/medecin/agenda')}
            className="btn-ghost btn-sm flex items-center gap-1"
          >
            Voir l'agenda <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {prochainsRdvs.length === 0 ? (
          <div className="empty-state py-8">
            <Clock className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Aucun rendez-vous en attente aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prochainsRdvs.map((rdv) => (
              <div
                key={rdv.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-neutral-bg
                           hover:bg-primary-50/40 transition-colors cursor-pointer"
                onClick={() => navigate('/medecin/consultations')}
              >
                <div className="text-center w-14 flex-shrink-0">
                  <p className="text-sm font-bold text-primary">{rdv.heure}</p>
                  <p className="text-2xs text-neutral-muted">
                    {rdv.type === 'teleconsultation' ? '📹' : '🏥'}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-text truncate">
                    {rdv.patientNom}
                  </p>
                  <p className="text-xs text-neutral-muted truncate">{rdv.motif}</p>
                </div>
                <span className={`
                  badge flex-shrink-0
                  ${rdv.statut === 'arrive'          ? 'badge-warning'  : ''}
                  ${rdv.statut === 'en_consultation' ? 'badge-accent'   : ''}
                  ${rdv.statut === 'confirme'        ? 'badge-info'     : ''}
                  ${rdv.statut === 'en_attente'      ? 'badge-neutral'  : ''}
                `}>
                  {rdv.statut === 'arrive'          ? 'Arrivé'          : ''}
                  {rdv.statut === 'en_consultation' ? 'En consultation' : ''}
                  {rdv.statut === 'confirme'        ? 'Confirmé'        : ''}
                  {rdv.statut === 'en_attente'      ? 'En attente'      : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières consultations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Dernières consultations</h2>
          <button
            onClick={() => navigate('/medecin/consultations')}
            className="btn-ghost btn-sm flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dernieresConsultations.length === 0 ? (
          <div className="empty-state py-8">
            <Stethoscope className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Aucune consultation enregistrée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dernieresConsultations.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-neutral-bg
                           hover:bg-primary-50/40 transition-colors"
              >
                <div className="w-9 h-9 bg-success-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-text truncate">
                    {c.patientNom}
                  </p>
                  <p className="text-xs text-neutral-muted truncate">{c.diagnostic}</p>
                </div>
                <p className="text-xs text-neutral-muted flex-shrink-0">
                  {c.date
                    ? format(toDate(c.date), 'dd MMM', { locale: fr })
                    : '—'
                  }
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Mon agenda',       desc: 'Planning du jour',          to: '/medecin/agenda',          couleur: 'bg-info-50 text-info'       },
          { label: 'Consultations',    desc: 'Démarrer une consultation', to: '/medecin/consultations',   couleur: 'bg-primary-50 text-primary' },
          { label: 'Mes patients',     desc: 'Dossiers patients',         to: '/medecin/patients',        couleur: 'bg-accent-50 text-accent'   },
        ].map(({ label, desc, to, couleur }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card-hover text-left"
          >
            <div className={`w-9 h-9 ${couleur} rounded-xl flex items-center justify-center mb-3`}>
              <ArrowRight className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-neutral-text">{label}</p>
            <p className="text-xs text-neutral-muted mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

    </div>
  )
}

export default MedecinDashboard