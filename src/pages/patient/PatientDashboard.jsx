import { useState, useEffect } from 'react'
import {
  Calendar, FileText, CreditCard, Clock,
  CheckCircle, AlertCircle, Loader2,
  ArrowRight, Stethoscope, Video,
} from 'lucide-react'
import {
  getRdvsByPatient, getFacturesByPatient,
  getConsultationsByPatient,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, isToday, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

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

export function PatientDashboard() {
  const { user }          = useAuthStore()
  const navigate          = useNavigate()
  const [rdvs,            setRdvs]            = useState([])
  const [factures,        setFactures]        = useState([])
  const [consultations,   setConsultations]   = useState([])
  const [chargement,      setChargement]      = useState(true)
  const [erreur,          setErreur]          = useState(null)

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const [r, f, c] = await Promise.all([
          getRdvsByPatient(user.uid),
          getFacturesByPatient(user.uid),
          getConsultationsByPatient(user.uid),
        ])
        setRdvs(r)
        setFactures(f)
        setConsultations(c)
      } catch (e) {
        setErreur('Impossible de charger vos données.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const rdvsAvenir = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && (isToday(d) || isFuture(d)) && r.statut !== 'annule'
  }).sort((a, b) => toDate(a.date) - toDate(b.date))

  const facturesImpayees  = factures.filter((f) => f.statut === 'impayee')
  const prochainRdv       = rdvsAvenir[0] || null

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
        <h1 className="page-title">
          Bonjour, {user?.prenom} 👋
        </h1>
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

      {/* Prochain RDV — mise en avant */}
      {prochainRdv && (
        <div className="card bg-gradient-primary text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-1">
                Prochain rendez-vous
              </p>
              <p className="text-xl font-bold">
                {toDate(prochainRdv.date)
                  ? format(toDate(prochainRdv.date), 'EEEE dd MMMM', { locale: fr })
                  : '—'
                }
                {prochainRdv.heure ? ` à ${prochainRdv.heure}` : ''}
              </p>
              <p className="text-primary-200 mt-1">{prochainRdv.motif}</p>
              <p className="text-primary-200 text-sm mt-0.5">{prochainRdv.medecinNom}</p>
            </div>
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
              ${prochainRdv.type === 'teleconsultation' ? 'bg-white/20' : 'bg-white/20'}
            `}>
              {prochainRdv.type === 'teleconsultation'
                ? <Video className="w-6 h-6 text-white" />
                : <Stethoscope className="w-6 h-6 text-white" />
              }
            </div>
          </div>
          {prochainRdv.type === 'teleconsultation' && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <a
                href={`https://meet.jit.si/NovaCare-${prochainRdv.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30
                           text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
              >
                <Video className="w-4 h-4" />
                Rejoindre la séance vidéo
              </a>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icone={Calendar}
          valeur={rdvsAvenir.length}
          label="RDV à venir"
          couleur="bg-info-50 text-info"
        />
        <KpiCard
          icone={Stethoscope}
          valeur={consultations.length}
          label="Consultations"
          couleur="bg-primary-50 text-primary"
        />
        <KpiCard
          icone={CreditCard}
          valeur={facturesImpayees.length}
          label="Factures impayées"
          couleur="bg-danger-50 text-danger"
        />
        <KpiCard
          icone={FileText}
          valeur={rdvs.filter((r) => r.statut === 'termine').length}
          label="Visites totales"
          couleur="bg-success-50 text-success"
        />
      </div>

      {/* Prochains RDV */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Mes rendez-vous à venir</h2>
          <button
            onClick={() => navigate('/patient/rdv')}
            className="btn-ghost btn-sm flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {rdvsAvenir.length === 0 ? (
          <div className="empty-state py-8">
            <Calendar className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Aucun rendez-vous à venir</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rdvsAvenir.slice(0, 3).map((rdv) => {
              const date = toDate(rdv.date)
              return (
                <div key={rdv.id} className="flex items-center gap-4 p-3 rounded-xl bg-neutral-bg">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${rdv.type === 'teleconsultation' ? 'bg-info-50 text-info' : 'bg-primary-50 text-primary'}
                  `}>
                    {rdv.type === 'teleconsultation'
                      ? <Video className="w-4 h-4" />
                      : <Stethoscope className="w-4 h-4" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-text truncate">
                      {rdv.motif}
                    </p>
                    <p className="text-xs text-neutral-muted">
                      {date ? format(date, 'dd MMM yyyy', { locale: fr }) : '—'}
                      {rdv.heure ? ` · ${rdv.heure}` : ''}
                      {' · '}{rdv.medecinNom}
                    </p>
                  </div>
                  {isToday(date) && (
                    <span className="badge-primary flex-shrink-0">Aujourd'hui</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Factures impayées */}
      {facturesImpayees.length > 0 && (
        <div className="card border-danger-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-danger">
              Factures en attente
            </h2>
            <button
              onClick={() => navigate('/patient/factures')}
              className="btn-ghost btn-sm flex items-center gap-1 text-danger"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {facturesImpayees.slice(0, 2).map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-danger-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-neutral-text">{f.service}</p>
                  <p className="text-xs text-neutral-muted">
                    {f.dateCreation
                      ? format(toDate(f.dateCreation), 'dd MMM yyyy', { locale: fr })
                      : '—'
                    }
                  </p>
                </div>
                <p className="font-bold text-danger">
                  {f.montant?.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Mes RDV',       desc: 'Rendez-vous',          to: '/patient/rdv',         couleur: 'bg-info-50 text-info'       },
          { label: 'Mon dossier',   desc: 'Historique médical',   to: '/patient/dossier',     couleur: 'bg-primary-50 text-primary' },
          { label: 'Ordonnances',   desc: 'Mes prescriptions',    to: '/patient/ordonnances', couleur: 'bg-accent-50 text-accent'   },
          { label: 'Factures',      desc: 'Paiements',            to: '/patient/factures',    couleur: 'bg-success-50 text-success' },
          { label: 'Téléconsult.',  desc: 'Consultation vidéo',   to: '/patient/teleconsultation', couleur: 'bg-purple-50 text-purple-600' },
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

export default PatientDashboard