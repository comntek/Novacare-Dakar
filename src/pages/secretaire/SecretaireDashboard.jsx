import { useState, useEffect } from 'react'
import {
  Users, Calendar, CreditCard, TrendingUp,
  Clock, CheckCircle, AlertCircle, Loader2,
  ArrowRight,
} from 'lucide-react'
import { getPatients, getRdvs, getFactures } from '../../services/firestore'
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

export function SecretaireDashboard() {
  const navigate = useNavigate()

  const [patients,   setPatients]   = useState([])
  const [rdvs,       setRdvs]       = useState([])
  const [factures,   setFactures]   = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)

  useEffect(() => {
    const charger = async () => {
      setChargement(true)
      setErreur(null)
      try {
        const [p, r, f] = await Promise.all([
          getPatients(),
          getRdvs(),
          getFactures(),
        ])
        setPatients(p)
        setRdvs(r)
        setFactures(f)
      } catch (e) {
        setErreur('Impossible de charger les données.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  // KPIs
  const rdvsAujourdhui = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && isToday(d)
  })

  const rdvsEnAttente = rdvsAujourdhui.filter((r) =>
    ['en_attente', 'confirme', 'arrive'].includes(r.statut)
  ).length

  const rdvsTermines = rdvsAujourdhui.filter((r) =>
    r.statut === 'termine'
  ).length

  const facturesImpayees = factures.filter((f) => f.statut === 'impayee').length

  const revenusJour = factures
    .filter((f) => {
      const d = toDate(f.datePaiement)
      return d && isToday(d) && f.statut === 'payee'
    })
    .reduce((acc, f) => acc + (f.montant || 0), 0)

  // Prochains RDV du jour non terminés
  const prochainsRdvs = rdvsAujourdhui
    .filter((r) => !['termine', 'annule', 'absent'].includes(r.statut))
    .sort((a, b) => (a.heure || '').localeCompare(b.heure || ''))
    .slice(0, 5)

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
        <h1 className="page-title">Tableau de bord</h1>
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
          label="Consultations terminées"
          couleur="bg-success-50 text-success"
        />
        <KpiCard
          icone={Users}
          valeur={patients.length}
          label="Patients enregistrés"
          couleur="bg-primary-50 text-primary"
        />
        <KpiCard
          icone={CreditCard}
          valeur={facturesImpayees}
          label="Factures impayées"
          couleur="bg-danger-50 text-danger"
        />
      </div>

      {/* Revenus du jour */}
      <div className="card bg-gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium">Revenus encaissés aujourd'hui</p>
            <p className="text-3xl font-bold mt-1">
              {revenusJour.toLocaleString('fr-FR')} <span className="text-xl font-normal text-primary-200">FCFA</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Prochains RDV */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">File d'attente en cours</h2>
          <button
            onClick={() => navigate('/secretaire/accueil')}
            className="btn-ghost btn-sm flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {prochainsRdvs.length === 0 ? (
          <div className="empty-state py-8">
            <Clock className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Aucun rendez-vous en attente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prochainsRdvs.map((rdv) => (
              <div
                key={rdv.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-neutral-bg hover:bg-primary-50/40 transition-colors"
              >
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-sm font-bold text-primary">{rdv.heure}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-text truncate">{rdv.patientNom}</p>
                  <p className="text-xs text-neutral-muted truncate">{rdv.motif}</p>
                </div>
                <span className={`
                  badge flex-shrink-0
                  ${rdv.statut === 'arrive'          ? 'badge-warning'  : ''}
                  ${rdv.statut === 'en_consultation' ? 'badge-accent'   : ''}
                  ${rdv.statut === 'confirme'        ? 'badge-info'     : ''}
                  ${rdv.statut === 'en_attente'      ? 'badge-neutral'  : ''}
                `}>
                  {rdv.statut === 'arrive'          ? 'Arrivé'           : ''}
                  {rdv.statut === 'en_consultation' ? 'En consultation'  : ''}
                  {rdv.statut === 'confirme'        ? 'Confirmé'         : ''}
                  {rdv.statut === 'en_attente'      ? 'En attente'       : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Gérer la file',     desc: 'File d\'attente temps réel', to: '/secretaire/accueil',  couleur: 'bg-info-50 text-info'         },
          { label: 'Nouveau patient',    desc: 'Enregistrer un patient',     to: '/secretaire/patients', couleur: 'bg-primary-50 text-primary'   },
          { label: 'Encaisser',          desc: 'Gérer les paiements',        to: '/secretaire/caisse',   couleur: 'bg-success-50 text-success'   },
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

export default SecretaireDashboard