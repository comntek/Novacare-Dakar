import { useState, useEffect } from 'react'
import {
  CreditCard, Search, X, AlertCircle,
  Loader2, CheckCircle, Clock, Filter,
  ChevronRight, Banknote, TrendingUp,
} from 'lucide-react'
import { getFactures, payerFacture } from '../../services/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const MODES_PAIEMENT = ['Wave', 'Orange Money', 'Espèces', 'Chèque', 'Carte bancaire']

// ── Modal paiement ────────────────────────────────────────
function ModalPaiement({ facture, onClose, onPaye }) {
  const [mode,       setMode]       = useState('Wave')
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const handlePayer = async () => {
    setSauvegarde(true)
    setErreur(null)
    try {
      await payerFacture(facture.id, mode)
      onPaye()
      onClose()
    } catch (e) {
      setErreur('Erreur lors du paiement.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Encaisser le paiement</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-5">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="bg-primary-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-neutral-text">{facture.patientNom}</p>
                <p className="text-sm text-neutral-muted mt-0.5">{facture.service}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {facture.montant?.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-neutral-muted">FCFA</p>
              </div>
            </div>
            <div className="h-px bg-primary-100" />
            <div className="flex justify-between text-xs text-neutral-muted">
              <span>Facture #{facture.id}</span>
              <span>
                {facture.dateCreation
                  ? format(toDate(facture.dateCreation), 'dd MMM yyyy', { locale: fr })
                  : '—'
                }
              </span>
            </div>
          </div>

          {/* Mode de paiement */}
          <div>
            <label className="form-label">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MODES_PAIEMENT.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-250
                    ${mode === m
                      ? 'bg-primary text-white border-primary shadow-btn'
                      : 'bg-white text-neutral-subtle border-neutral-border hover:border-primary hover:text-primary'
                    }
                  `}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handlePayer} disabled={sauvegarde} className="btn-primary">
            {sauvegarde
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Encaissement...</>
              : <><CheckCircle className="w-4 h-4" /> Confirmer le paiement</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function SecretaireCaisse() {
  const [factures,      setFactures]      = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)
  const [recherche,     setRecherche]     = useState('')
  const [filtre,        setFiltre]        = useState('tous')
  const [factureSelec,  setFactureSelec]  = useState(null)

  const charger = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const data = await getFactures()
      setFactures(data)
    } catch (e) {
      setErreur('Impossible de charger les factures.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  // KPIs
  const totalEncaisse = factures
    .filter((f) => f.statut === 'payee')
    .reduce((acc, f) => acc + (f.montant || 0), 0)

  const totalImpaye = factures
    .filter((f) => f.statut === 'impayee')
    .reduce((acc, f) => acc + (f.montant || 0), 0)

  const nbImpayees = factures.filter((f) => f.statut === 'impayee').length
  const nbPayees   = factures.filter((f) => f.statut === 'payee').length

  // Filtrage
  const facturesFiltrees = factures.filter((f) => {
    const search = recherche.toLowerCase()
    const matchSearch =
      f.patientNom?.toLowerCase().includes(search) ||
      f.service?.toLowerCase().includes(search) ||
      f.id?.toLowerCase().includes(search)
    const matchFiltre =
      filtre === 'tous'    ||
      (filtre === 'payee'   && f.statut === 'payee')   ||
      (filtre === 'impayee' && f.statut === 'impayee')
    return matchSearch && matchFiltre
  })

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="page-title">Caisse</h1>
        <p className="page-subtitle">Gestion des paiements et factures</p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-200 text-sm">Total encaissé</p>
              <p className="text-2xl font-bold mt-1">
                {totalEncaisse.toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-primary-200 ml-1">FCFA</span>
              </p>
              <p className="text-primary-200 text-xs mt-1">{nbPayees} facture{nbPayees > 1 ? 's' : ''} payée{nbPayees > 1 ? 's' : ''}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white/40" />
          </div>
        </div>

        <div className="card border-danger-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-muted text-sm">En attente</p>
              <p className="text-2xl font-bold text-danger mt-1">
                {totalImpaye.toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-neutral-muted ml-1">FCFA</span>
              </p>
              <p className="text-neutral-muted text-xs mt-1">{nbImpayees} facture{nbImpayees > 1 ? 's' : ''} impayée{nbImpayees > 1 ? 's' : ''}</p>
            </div>
            <Clock className="w-8 h-8 text-danger/20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-muted text-sm">Total factures</p>
              <p className="text-2xl font-bold text-neutral-text mt-1">{factures.length}</p>
              <p className="text-neutral-muted text-xs mt-1">Toutes périodes</p>
            </div>
            <CreditCard className="w-8 h-8 text-neutral-border" />
          </div>
        </div>
      </div>

      {/* Recherche + filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
          <input
            className="form-input pl-10"
            placeholder="Rechercher par patient, service..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          {recherche && (
            <button
              onClick={() => setRecherche('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
                px-3 py-2 rounded-xl text-sm font-medium transition-all duration-250
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
      </div>

      {/* Liste factures */}
      {chargement ? (
        <div className="page-loader">
          <div className="text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-sm text-neutral-muted">Chargement des factures...</p>
          </div>
        </div>
      ) : facturesFiltrees.length === 0 ? (
        <div className="empty-state">
          <CreditCard className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Aucune facture</p>
          <p className="text-sm mt-1">
            {recherche ? `Aucun résultat pour "${recherche}"` : 'Aucune facture dans cette catégorie'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {facturesFiltrees.map((facture) => (
            <div
              key={facture.id}
              className="card-hover flex items-center gap-4"
            >
              {/* Statut icône */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${facture.statut === 'payee'
                  ? 'bg-success-50 text-success'
                  : 'bg-danger-50 text-danger'
                }
              `}>
                {facture.statut === 'payee'
                  ? <CheckCircle className="w-5 h-5" />
                  : <Clock className="w-5 h-5" />
                }
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-neutral-text">{facture.patientNom}</p>
                  <span className={facture.statut === 'payee' ? 'badge-success' : 'badge-danger'}>
                    {facture.statut === 'payee' ? 'Payée' : 'Impayée'}
                  </span>
                </div>
                <p className="text-sm text-neutral-muted truncate mt-0.5">{facture.service}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-neutral-muted">
                    {facture.dateCreation
                      ? format(toDate(facture.dateCreation), 'dd MMM yyyy', { locale: fr })
                      : '—'
                    }
                  </span>
                  {facture.modePaiement && (
                    <span className="text-xs text-neutral-muted">· {facture.modePaiement}</span>
                  )}
                </div>
              </div>

              {/* Montant */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-neutral-text">
                  {facture.montant?.toLocaleString('fr-FR')}
                  <span className="text-xs text-neutral-muted font-normal ml-1">FCFA</span>
                </p>
                {facture.statut === 'impayee' && (
                  <button
                    onClick={() => setFactureSelec(facture)}
                    className="btn-primary btn-sm mt-1.5"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Encaisser
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal paiement */}
      {factureSelec && (
        <ModalPaiement
          facture={factureSelec}
          onClose={() => setFactureSelec(null)}
          onPaye={charger}
        />
      )}
    </div>
  )
}

export default SecretaireCaisse