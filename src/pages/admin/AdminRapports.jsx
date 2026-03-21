import { useState, useEffect } from 'react'
import {
  BarChart2, AlertCircle, TrendingUp,
  Users, Calendar, CreditCard,
  Download,
} from 'lucide-react'
import {
  getPatients, getRdvs, getFactures,
} from '../../services/firestore'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format, subMonths, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function AdminRapports() {
  const [patients,   setPatients]   = useState([])
  const [rdvs,       setRdvs]       = useState([])
  const [factures,   setFactures]   = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)
  const [periode,    setPeriode]    = useState(6)

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
        setErreur('Impossible de charger les rapports.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  const donneesParMois = Array.from({ length: periode }, (_, i) => {
    const mois     = subMonths(new Date(), periode - 1 - i)
    const rdvsMois = rdvs.filter((r) => {
      const d = toDate(r.date)
      return d && isSameMonth(d, mois)
    })
    const revenus = factures
      .filter((f) => {
        const d = toDate(f.datePaiement || f.dateCreation)
        return d && isSameMonth(d, mois) && f.statut === 'payee'
      })
      .reduce((acc, f) => acc + (f.montant || 0), 0)

    return {
      mois:       format(mois, 'MMM yy', { locale: fr }),
      rdvTotal:   rdvsMois.length,
      termines:   rdvsMois.filter((r) => r.statut === 'termine').length,
      annules:    rdvsMois.filter((r) => r.statut === 'annule').length,
      revenus,
    }
  })

  const totalRevenus   = factures.filter((f) => f.statut === 'payee').reduce((a, f) => a + (f.montant || 0), 0)
  const totalImpaye    = factures.filter((f) => f.statut === 'impayee').reduce((a, f) => a + (f.montant || 0), 0)
  const tauxCompletion = rdvs.length > 0
    ? ((rdvs.filter((r) => r.statut === 'termine').length / rdvs.length) * 100).toFixed(1)
    : '0.0'

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Rapports</h1>
          <p className="page-subtitle">Analyse de l'activité de NovaCare Dakar</p>
        </div>
        <div className="flex gap-2">
          {[3, 6, 12].map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`
                px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-250
                ${periode === p
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-white border border-neutral-border text-neutral-subtle hover:border-primary hover:text-primary'
                }
              `}
            >
              {p} mois
            </button>
          ))}
        </div>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total patients',     value: patients.length,                   icon: Users,      couleur: 'bg-info-50 text-info'       },
          { label: 'Total RDV',          value: rdvs.length,                       icon: Calendar,   couleur: 'bg-primary-50 text-primary' },
          { label: 'Taux complétion',    value: `${tauxCompletion}%`,              icon: TrendingUp, couleur: 'bg-success-50 text-success' },
          { label: 'Revenus totaux',     value: `${(totalRevenus/1000).toFixed(0)}K FCFA`, icon: CreditCard, couleur: 'bg-accent-50 text-accent' },
        ].map(({ label, value, icon: Icon, couleur }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`stat-icon ${couleur}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique RDV */}
      <div className="card">
        <h2 className="section-title mb-6">Activité des rendez-vous</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={donneesParMois}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="termines" name="Terminés"  fill="#0A5C3E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="annules"  name="Annulés"   fill="#E11D48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique revenus */}
      <div className="card">
        <h2 className="section-title mb-6">Évolution des revenus (FCFA)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={donneesParMois}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            />
            <Tooltip formatter={(v) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Revenus']} />
            <Line
              type="monotone" dataKey="revenus" name="Revenus"
              stroke="#C9922A" strokeWidth={2} dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-gradient-primary text-white">
          <TrendingUp className="w-6 h-6 text-white/60 mb-3" />
          <p className="text-3xl font-bold">{totalRevenus.toLocaleString('fr-FR')}</p>
          <p className="text-primary-200 mt-1">FCFA encaissés</p>
          <p className="text-primary-200 text-sm mt-0.5">
            {factures.filter((f) => f.statut === 'payee').length} factures payées
          </p>
        </div>
        <div className="card border-danger-100">
          <CreditCard className="w-6 h-6 text-danger/40 mb-3" />
          <p className="text-3xl font-bold text-danger">{totalImpaye.toLocaleString('fr-FR')}</p>
          <p className="text-neutral-muted mt-1">FCFA en attente</p>
          <p className="text-neutral-muted text-sm mt-0.5">
            {factures.filter((f) => f.statut === 'impayee').length} factures impayées
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminRapports