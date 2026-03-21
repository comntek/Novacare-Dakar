import { useState, useEffect } from 'react'
import {
  CreditCard, AlertCircle, CheckCircle,
  Clock, TrendingUp,
} from 'lucide-react'
import { getFacturesByPatient } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function PatientFactures() {
  const { user }      = useAuthStore()
  const [factures,    setFactures]    = useState([])
  const [chargement,  setChargement]  = useState(true)
  const [erreur,      setErreur]      = useState(null)
  const [filtre,      setFiltre]      = useState('tous')

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const data = await getFacturesByPatient(user.uid)
        setFactures(data)
      } catch (e) {
        setErreur('Impossible de charger vos factures.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const totalPaye   = factures.filter((f) => f.statut === 'payee').reduce((a, f) => a + (f.montant || 0), 0)
  const totalDu     = factures.filter((f) => f.statut === 'impayee').reduce((a, f) => a + (f.montant || 0), 0)
  const nbImpayees  = factures.filter((f) => f.statut === 'impayee').length
  const nbPayees    = factures.filter((f) => f.statut === 'payee').length

  const facturesFiltrees = factures.filter((f) => {
    if (filtre === 'impayee') return f.statut === 'impayee'
    if (filtre === 'payee')   return f.statut === 'payee'
    return true
  })

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
        <h1 className="page-title">Mes factures</h1>
        <p className="page-subtitle">{factures.length} facture{factures.length > 1 ? 's' : ''} au total</p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-gradient-primary text-white">
          <TrendingUp className="w-6 h-6 text-white/60 mb-2" />
          <p className="text-2xl font-bold">{totalPaye.toLocaleString('fr-FR')}</p>
          <p className="text-primary-200 text-sm">FCFA payés · {nbPayees} facture{nbPayees > 1 ? 's' : ''}</p>
        </div>
        <div className="card border-danger-100">
          <Clock className="w-6 h-6 text-danger/40 mb-2" />
          <p className="text-2xl font-bold text-danger">{totalDu.toLocaleString('fr-FR')}</p>
          <p className="text-neutral-muted text-sm">FCFA dus · {nbImpayees} impayée{nbImpayees > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {[
          { id: 'tous',     label: `Toutes (${factures.length})` },
          { id: 'impayee',  label: `Impayées (${nbImpayees})`   },
          { id: 'payee',    label: `Payées (${nbPayees})`        },
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
      {facturesFiltrees.length === 0 ? (
        <div className="empty-state">
          <CreditCard className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Aucune facture</p>
        </div>
      ) : (
        <div className="space-y-2">
          {facturesFiltrees.map((f) => (
            <div key={f.id} className="card-hover flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${f.statut === 'payee' ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'}
              `}>
                {f.statut === 'payee'
                  ? <CheckCircle className="w-5 h-5" />
                  : <Clock className="w-5 h-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-text truncate">{f.service}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <p className="text-xs text-neutral-muted">
                    {f.dateCreation
                      ? format(toDate(f.dateCreation), 'dd MMM yyyy', { locale: fr })
                      : '—'
                    }
                  </p>
                  {f.modePaiement && (
                    <span className="text-xs text-neutral-muted">· {f.modePaiement}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-neutral-text">
                  {f.montant?.toLocaleString('fr-FR')}
                  <span className="text-xs font-normal text-neutral-muted ml-1">FCFA</span>
                </p>
                <span className={f.statut === 'payee' ? 'badge-success' : 'badge-danger'}>
                  {f.statut === 'payee' ? 'Payée' : 'Impayée'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientFactures