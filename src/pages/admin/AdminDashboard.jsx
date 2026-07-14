import { useState, useEffect } from 'react'
import {
  Users, Calendar, TrendingUp, Star,
  UserCheck, XCircle, BarChart2, Activity,
  Loader2, AlertCircle,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  getPatients, getRdvs, getFactures, getMedecins,
} from '../../services/firestore'
import { format, subMonths, isSameMonth, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const SPECIALITES_COULEURS = [
  '#0A5C3E', '#1B4F8A', '#C9922A', '#8B5CF6', '#EC4899',
]

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

export function AdminDashboard() {
  const [patients,   setPatients]   = useState([])
  const [rdvs,       setRdvs]       = useState([])
  const [factures,   setFactures]   = useState([])
  const [medecins,   setMedecins]   = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)

  useEffect(() => {
    const charger = async () => {
      setChargement(true)
      setErreur(null)
      try {
        const [p, r, f, m] = await Promise.all([
          getPatients(),
          getRdvs(),
          getFactures(),
          getMedecins(),
        ])
        setPatients(p)
        setRdvs(r)
        setFactures(f)
        setMedecins(m)
      } catch (e) {
        setErreur('Impossible de charger les données.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  // ── KPIs ─────────────────────────────────────────────
  const rdvsAujourdhui = rdvs.filter((r) => {
    const d = toDate(r.date)
    return d && isToday(d)
  }).length

  const totalRevenus = factures
    .filter((f) => f.statut === 'payee')
    .reduce((acc, f) => acc + (f.montant || 0), 0)

  const rdvAnnules     = rdvs.filter((r) => r.statut === 'annule').length
  const tauxAnnulation = rdvs.length > 0
    ? ((rdvAnnules / rdvs.length) * 100).toFixed(1)
    : '0.0'

  const nbImpayees = factures.filter((f) => f.statut === 'impayee').length
  const nbPayees   = factures.filter((f) => f.statut === 'payee').length
  const rdvTermines = rdvs.filter((r) => r.statut === 'termine').length

  const KPIS = [
    { label: 'Patients',        value: patients.length,                              icon: Users,      couleur: 'bg-info-50 text-info'       },
    { label: 'RDV aujourd\'hui',value: rdvsAujourdhui,                               icon: Calendar,   couleur: 'bg-primary-50 text-primary' },
    { label: 'Revenus (FCFA)',  value: `${(totalRevenus / 1000).toFixed(0)}K`,       icon: TrendingUp, couleur: 'bg-accent-50 text-accent'   },
    { label: 'Satisfaction',    value: '96,4%',                                      icon: Star,       couleur: 'bg-warning-50 text-warning' },
    { label: 'Médecins actifs', value: medecins.length,                              icon: UserCheck,  couleur: 'bg-success-50 text-success' },
    { label: 'Taux annulation', value: `${tauxAnnulation}%`,                         icon: XCircle,    couleur: 'bg-danger-50 text-danger'   },
  ]

  // ── Graphiques ────────────────────────────────────────
  const statsParMois = Array.from({ length: 6 }, (_, i) => {
    const mois = subMonths(new Date(), 5 - i)
    const rdvsMois = rdvs.filter((r) => {
      const d = toDate(r.date)
      return d && isSameMonth(d, mois)
    })
    return {
      mois:  format(mois, 'MMM', { locale: fr }),
      rdv:   rdvsMois.filter((r) => r.type !== 'teleconsultation').length,
      telec: rdvsMois.filter((r) => r.type === 'teleconsultation').length,
    }
  })

  const revenusParMois = Array.from({ length: 6 }, (_, i) => {
    const mois = subMonths(new Date(), 5 - i)
    const revenus = factures
      .filter((f) => {
        const d = toDate(f.datePaiement || f.dateCreation)
        return d && isSameMonth(d, mois) && f.statut === 'payee'
      })
      .reduce((acc, f) => acc + (f.montant || 0), 0)
    return {
      mois: format(mois, 'MMM', { locale: fr }),
      revenus,
    }
  })

  // Spécialités depuis les médecins réels
  const specialitesMap = {}
  medecins.forEach((m) => {
    const s = m.specialiteNom || m.specialite || 'Généraliste'
    specialitesMap[s] = (specialitesMap[s] || 0) + 1
  })
  const specialitesData = Object.entries(specialitesMap).map(([name, value], i) => ({
    name,
    value,
    color: SPECIALITES_COULEURS[i % SPECIALITES_COULEURS.length],
  }))

  // Top médecins depuis données réelles
  const topMedecins = medecins.slice(0, 4).map((m) => {
    const consultations = rdvs.filter(
      (r) => r.medecinId === m.id && r.statut === 'termine'
    ).length
    return {
      nom:          `Dr. ${m.prenom} ${m.nom}`,
      specialite:   m.specialiteNom || m.specialite || '—',
      consultations,
    }
  })

  const maxConsultations = Math.max(...topMedecins.map((m) => m.consultations), 1)

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement du tableau de bord...</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map(({ label, value, icon: Icon, couleur }) => (
          <KpiCard key={label} icone={Icon} valeur={value} label={label} couleur={couleur} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="section-title">Évolution des rendez-vous</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={statsParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone" dataKey="rdv" name="Consultations"
                stroke="#0A5C3E" strokeWidth={2} dot={{ r: 3 }}
              />
              <Line
                type="monotone" dataKey="telec" name="Téléconsultations"
                stroke="#C9922A" strokeWidth={2} dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h2 className="section-title">Revenus mensuels (FCFA)</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenusParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M`
                  : v >= 1000  ? `${(v / 1000).toFixed(0)}K`
                  : v
                }
              />
              <Tooltip formatter={(v) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Revenus']} />
              <Bar dataKey="revenus" name="Revenus" fill="#0A5C3E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spécialités + Top médecins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card">
          <h2 className="section-title mb-6">Répartition par spécialité</h2>
          {specialitesData.length === 0 ? (
            <div className="empty-state py-8">
              <p className="text-sm">Aucune donnée de spécialité</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={specialitesData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="value"
                  >
                    {specialitesData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {specialitesData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <p className="text-sm text-neutral-text flex-1">{name}</p>
                    <p className="text-sm font-bold text-neutral-text">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title mb-5">Performance médecins</h2>
          {topMedecins.length === 0 ? (
            <div className="empty-state py-8">
              <UserCheck className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Aucun médecin enregistré</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topMedecins.map(({ nom, specialite, consultations }) => (
                <div key={nom}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-neutral-text">{nom}</p>
                      <p className="text-xs text-neutral-muted">{specialite}</p>
                    </div>
                    <p className="text-sm font-bold text-neutral-text">
                      {consultations} consult.
                    </p>
                  </div>
                  <div className="w-full bg-neutral-border rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(consultations / maxConsultations) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Résumé factures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Factures payées',        value: nbPayees,   color: 'text-success', bg: 'bg-success-50' },
          { label: 'Factures impayées',       value: nbImpayees, color: 'text-danger',  bg: 'bg-danger-50'  },
          { label: 'Consultations terminées', value: rdvTermines,color: 'text-primary', bg: 'bg-primary-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-neutral-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default AdminDashboard