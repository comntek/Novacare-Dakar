import { useState, useEffect } from 'react'
import {
  Users, Search, X, AlertCircle,
  Loader2, Phone, Mail, ChevronRight,
  FileText, Stethoscope, ClipboardList,
} from 'lucide-react'
import {
  getPatientsByMedecin, getConsultationsByPatient,
  getFacturesByPatient,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

// ── Modal dossier patient ─────────────────────────────────
function ModalDossier({ patient, onClose }) {
  const [onglet,        setOnglet]        = useState('infos')
  const [consultations, setConsultations] = useState([])
  const [factures,      setFactures]      = useState([])
  const [chargement,    setChargement]    = useState(true)

  useEffect(() => {
    const charger = async () => {
      try {
        const [c, f] = await Promise.all([
          getConsultationsByPatient(patient.id),
          getFacturesByPatient(patient.id),
        ])
        setConsultations(c)
        setFactures(f)
      } catch (e) {
        // silencieux
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [patient.id])

  const age = patient.dateNaissance
    ? Math.floor(
        (Date.now() - toDate(patient.dateNaissance).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
      )
    : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">
                {patient.prenom?.[0]}{patient.nom?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-text">
                {patient.prenom} {patient.nom}
              </h2>
              <p className="text-xs text-neutral-muted">{patient.numeroDossier}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-neutral-border px-6">
          {[
            { id: 'infos',        label: 'Informations',   icon: FileText      },
            { id: 'consultations',label: 'Consultations',  icon: Stethoscope   },
            { id: 'ordonnances',  label: 'Ordonnances',    icon: ClipboardList },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
                ${onglet === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-muted hover:text-neutral-text'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body">

          {/* Infos */}
          {onglet === 'infos' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Âge',            valeur: age ? `${age} ans` : '—'     },
                  { label: 'Sexe',           valeur: patient.sexe || '—'           },
                  { label: 'Groupe sanguin', valeur: patient.groupeSanguin || '—'  },
                  { label: 'Assurance',      valeur: patient.assurance || 'Aucune' },
                ].map(({ label, valeur }) => (
                  <div key={label} className="bg-neutral-bg rounded-xl p-3">
                    <p className="text-xs text-neutral-muted">{label}</p>
                    <p className="text-sm font-semibold text-neutral-text mt-0.5">{valeur}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {patient.telephone && (
                  <div className="flex items-center gap-2 text-sm text-neutral-text">
                    <Phone className="w-4 h-4 text-neutral-muted" />
                    {patient.telephone}
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm text-neutral-text">
                    <Mail className="w-4 h-4 text-neutral-muted" />
                    {patient.email}
                  </div>
                )}
              </div>

              {patient.allergies?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide mb-2">
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((a) => (
                      <span key={a} className="badge-danger">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {patient.antecedents?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide mb-2">
                    Antécédents
                  </p>
                  <div className="space-y-1">
                    {patient.antecedents.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-neutral-text">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consultations */}
          {onglet === 'consultations' && (
            <div>
              {chargement ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : consultations.length === 0 ? (
                <div className="empty-state py-8">
                  <Stethoscope className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Aucune consultation enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <div key={c.id} className="bg-neutral-bg rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-neutral-text">
                          {c.date
                            ? format(toDate(c.date), 'dd MMMM yyyy', { locale: fr })
                            : '—'
                          }
                        </p>
                        <span className="badge-success">Terminée</span>
                      </div>
                      <p className="text-sm text-neutral-text">
                        <span className="font-medium">Diagnostic : </span>
                        {c.diagnostic}
                      </p>
                      {c.planTraitement && (
                        <p className="text-xs text-neutral-muted">{c.planTraitement}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ordonnances */}
          {onglet === 'ordonnances' && (
            <div>
              {chargement ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : consultations.filter((c) => c.ordonnances?.length > 0).length === 0 ? (
                <div className="empty-state py-8">
                  <ClipboardList className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Aucune ordonnance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations
                    .filter((c) => c.ordonnances?.length > 0)
                    .map((c) => (
                      <div key={c.id} className="bg-neutral-bg rounded-xl p-4">
                        <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide mb-3">
                          {c.date
                            ? format(toDate(c.date), 'dd MMMM yyyy', { locale: fr })
                            : '—'
                          }
                        </p>
                        <div className="space-y-2">
                          {c.ordonnances.map((o, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-neutral-text">{o.medicament}</p>
                                <p className="text-xs text-neutral-muted">
                                  {o.posologie} · {o.duree}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer justify-end">
          <button onClick={onClose} className="btn-outline">Fermer</button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function MedecinPatients() {
  const { user }         = useAuthStore()
  const [patients,       setPatients]       = useState([])
  const [chargement,     setChargement]     = useState(true)
  const [erreur,         setErreur]         = useState(null)
  const [recherche,      setRecherche]      = useState('')
  const [patientSelec,   setPatientSelec]   = useState(null)

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const data = await getPatientsByMedecin(user.uid)
        setPatients(data)
      } catch (e) {
        setErreur('Impossible de charger les patients.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const patientsFiltres = patients.filter((p) => {
    const search = recherche.toLowerCase()
    return (
      `${p.prenom} ${p.nom}`.toLowerCase().includes(search) ||
      p.telephone?.includes(search) ||
      p.numeroDossier?.toLowerCase().includes(search)
    )
  })

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement des patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Mes patients</h1>
        <p className="page-subtitle">
          {patients.length} patient{patients.length > 1 ? 's' : ''} référent{patients.length > 1 ? 's' : ''}
        </p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
        <input
          className="form-input pl-10"
          placeholder="Rechercher par nom, téléphone, numéro dossier..."
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

      {patientsFiltres.length === 0 ? (
        <div className="empty-state">
          <Users className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">
            {recherche ? 'Aucun résultat' : 'Aucun patient référent'}
          </p>
          <p className="text-sm mt-1">
            {recherche
              ? `Aucun patient ne correspond à "${recherche}"`
              : 'Vos patients référents apparaîtront ici'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {patientsFiltres.map((patient) => {
            const age = patient.dateNaissance
              ? Math.floor(
                  (Date.now() - toDate(patient.dateNaissance).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
                )
              : null

            return (
              <div
                key={patient.id}
                onClick={() => setPatientSelec(patient)}
                className="card-hover flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {patient.prenom?.[0]}{patient.nom?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-text">
                      {patient.prenom} {patient.nom}
                    </p>
                    {patient.groupeSanguin && (
                      <span className="badge-danger text-2xs">{patient.groupeSanguin}</span>
                    )}
                    {patient.allergies?.length > 0 && (
                      <span className="badge-warning text-2xs">
                        ⚠️ {patient.allergies.length} allergie{patient.allergies.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-neutral-muted">{patient.numeroDossier}</span>
                    {age && <span className="text-xs text-neutral-muted">{age} ans · {patient.sexe}</span>}
                    {patient.telephone && (
                      <span className="text-xs text-neutral-muted flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {patient.telephone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  {patient.assurance
                    ? <span className="badge-primary">{patient.assurance}</span>
                    : <span className="badge-neutral">Sans assurance</span>
                  }
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-muted flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {patientSelec && (
        <ModalDossier
          patient={patientSelec}
          onClose={() => setPatientSelec(null)}
        />
      )}
    </div>
  )
}

export default MedecinPatients