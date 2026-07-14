import { useState, useEffect } from 'react'
import {
  Users, Search, Plus, X, AlertCircle,
  Loader2, Phone, Mail, ChevronRight,
  UserCheck, Save, CheckCircle,
} from 'lucide-react'
import {
  getPatients, createPatient, getRdvsByPatient,
  getMedecins, updatePatient,
} from '../../services/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function genererNumeroDossier() {
  const annee = new Date().getFullYear()
  const rand  = Math.floor(Math.random() * 9000) + 1000
  return `PAT-${annee}-${rand}`
}

// ── Modal nouveau patient ─────────────────────────────────
function ModalNouveauPatient({ onClose, onSave, medecins }) {
  const [form, setForm] = useState({
    prenom: '', nom: '', dateNaissance: '', sexe: 'Masculin',
    telephone: '', email: '', adresse: '', groupeSanguin: '',
    assurance: '', allergies: '', antecedents: '',
    medecinReferentId: '', medecinReferentNom: '',
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.prenom || !form.nom || !form.telephone) {
      setErreur('Prénom, nom et téléphone sont obligatoires.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      const medecinChoisi = medecins.find((m) => m.id === form.medecinReferentId)
      await onSave({
        prenom:            form.prenom.trim(),
        nom:               form.nom.trim(),
        dateNaissance:     form.dateNaissance ? new Date(form.dateNaissance) : null,
        sexe:              form.sexe,
        telephone:         form.telephone.trim(),
        email:             form.email.trim(),
        adresse:           form.adresse.trim(),
        groupeSanguin:     form.groupeSanguin,
        assurance:         form.assurance.trim() || null,
        allergies:         form.allergies
          ? form.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
        antecedents:       form.antecedents
          ? form.antecedents.split(',').map((a) => a.trim()).filter(Boolean) : [],
        numeroDossier:     genererNumeroDossier(),
        medecinReferentId: form.medecinReferentId || null,
        medecinReferentNom: medecinChoisi
          ? `Dr. ${medecinChoisi.prenom} ${medecinChoisi.nom}` : null,
      })
      onClose()
    } catch (e) {
      setErreur(e.message ? `Erreur : ${e.message}` : 'Erreur lors de l\'enregistrement.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Nouveau patient</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-4">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Prénom *</label>
              <input className="form-input" value={form.prenom}
                onChange={(e) => update('prenom', e.target.value)} placeholder="Aminata" />
            </div>
            <div>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.nom}
                onChange={(e) => update('nom', e.target.value)} placeholder="Diallo" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date de naissance</label>
              <input type="date" className="form-input" value={form.dateNaissance}
                onChange={(e) => update('dateNaissance', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Sexe</label>
              <select className="form-input" value={form.sexe}
                onChange={(e) => update('sexe', e.target.value)}>
                <option>Masculin</option>
                <option>Féminin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Téléphone *</label>
            <input className="form-input" value={form.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              placeholder="+221 77 000 00 00" />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email}
              onChange={(e) => update('email', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Adresse</label>
            <input className="form-input" value={form.adresse}
              onChange={(e) => update('adresse', e.target.value)}
              placeholder="Quartier, Ville" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Groupe sanguin</label>
              <select className="form-input" value={form.groupeSanguin}
                onChange={(e) => update('groupeSanguin', e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Assurance</label>
              <input className="form-input" value={form.assurance}
                onChange={(e) => update('assurance', e.target.value)}
                placeholder="IPRES, CNSS..." />
            </div>
          </div>

          {/* Médecin référent */}
          <div>
            <label className="form-label flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5" /> Médecin référent
            </label>
            <select className="form-input" value={form.medecinReferentId}
              onChange={(e) => update('medecinReferentId', e.target.value)}>
              <option value="">-- Aucun médecin assigné --</option>
              {medecins.map((m) => (
                <option key={m.id} value={m.id}>
                  Dr. {m.prenom} {m.nom} — {m.specialiteNom || m.specialite || 'Généraliste'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Allergies <span className="text-neutral-muted font-normal normal-case">(séparées par virgule)</span></label>
            <input className="form-input" value={form.allergies}
              onChange={(e) => update('allergies', e.target.value)}
              placeholder="Pénicilline, Aspirine..." />
          </div>

          <div>
            <label className="form-label">Antécédents <span className="text-neutral-muted font-normal normal-case">(séparés par virgule)</span></label>
            <input className="form-input" value={form.antecedents}
              onChange={(e) => update('antecedents', e.target.value)}
              placeholder="Diabète, Hypertension..." />
          </div>
        </div>

        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary">
            {sauvegarde
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
              : <><Plus className="w-4 h-4" /> Enregistrer</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal détail patient ──────────────────────────────────
function ModalDetailPatient({ patient, onClose, onUpdate, medecins }) {
  const [rdvs,             setRdvs]             = useState([])
  const [chargement,       setChargement]       = useState(true)
  const [medecinReferentId,setMedecinReferentId] = useState(patient.medecinReferentId || '')
  const [sauvegarde,       setSauvegarde]       = useState(false)
  const [succes,           setSucces]           = useState(false)
  const [erreur,           setErreur]           = useState(null)

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await getRdvsByPatient(patient.id)
        setRdvs(data)
      } catch (e) {
        // silencieux
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [patient.id])

  const handleSaveMedecin = async () => {
    setSauvegarde(true)
    setErreur(null)
    try {
      const medecinChoisi = medecins.find((m) => m.id === medecinReferentId)
      await updatePatient(patient.id, {
        medecinReferentId:  medecinReferentId || null,
        medecinReferentNom: medecinChoisi
          ? `Dr. ${medecinChoisi.prenom} ${medecinChoisi.nom}` : null,
      })
      setSucces(true)
      setTimeout(() => setSucces(false), 2000)
      onUpdate()
    } catch (e) {
      setErreur(e.message ? `Impossible de sauvegarder : ${e.message}` : 'Impossible de sauvegarder.')
    } finally {
      setSauvegarde(false)
    }
  }

  const age = patient.dateNaissance
    ? Math.floor((Date.now() - toDate(patient.dateNaissance).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25))
    : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
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
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-5">

          {/* Infos de base */}
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

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide">Contact</p>
            {patient.telephone && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Phone className="w-4 h-4 text-neutral-muted" />{patient.telephone}
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Mail className="w-4 h-4 text-neutral-muted" />{patient.email}
              </div>
            )}
          </div>

          {/* ── Médecin référent ── */}
          <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5" /> Médecin référent
            </p>

            {erreur && (
              <div className="alert-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
              </div>
            )}
            {succes && (
              <div className="alert-success">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p>Médecin référent mis à jour.</p>
              </div>
            )}

            <select
              className="form-input"
              value={medecinReferentId}
              onChange={(e) => setMedecinReferentId(e.target.value)}
            >
              <option value="">-- Aucun médecin assigné --</option>
              {medecins.map((m) => (
                <option key={m.id} value={m.id}>
                  Dr. {m.prenom} {m.nom} — {m.specialiteNom || m.specialite || 'Généraliste'}
                </option>
              ))}
            </select>

            <button
              onClick={handleSaveMedecin}
              disabled={sauvegarde}
              className="btn-primary btn-sm w-full"
            >
              {sauvegarde
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde...</>
                : <><Save className="w-3.5 h-3.5" /> Enregistrer le médecin référent</>
              }
            </button>
          </div>

          {/* Allergies */}
          {patient.allergies?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <span key={a} className="badge-danger">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Antécédents */}
          {patient.antecedents?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide mb-2">Antécédents</p>
              <div className="space-y-1">
                {patient.antecedents.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-neutral-text">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique RDV */}
          <div>
            <p className="text-xs font-semibold text-neutral-subtle uppercase tracking-wide mb-2">
              Historique rendez-vous
            </p>
            {chargement ? (
              <div className="flex items-center gap-2 text-sm text-neutral-muted py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
              </div>
            ) : rdvs.length === 0 ? (
              <p className="text-sm text-neutral-muted">Aucun rendez-vous enregistré</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {rdvs.slice(0, 5).map((rdv) => (
                  <div key={rdv.id}
                    className="flex items-center justify-between p-2 bg-neutral-bg rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-neutral-text">
                        {rdv.date ? format(toDate(rdv.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                        {rdv.heure ? ` · ${rdv.heure}` : ''}
                      </p>
                      <p className="text-xs text-neutral-muted">{rdv.motif}</p>
                    </div>
                    <span className={`badge text-2xs
                      ${rdv.statut === 'termine' ? 'badge-success' : ''}
                      ${rdv.statut === 'annule'  ? 'badge-danger'  : ''}
                      ${rdv.statut === 'confirme'? 'badge-info'    : ''}
                      ${!['termine','annule','confirme'].includes(rdv.statut) ? 'badge-neutral' : ''}
                    `}>
                      {rdv.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer justify-end">
          <button onClick={onClose} className="btn-outline">Fermer</button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function SecretairePatients() {
  const [patients,     setPatients]     = useState([])
  const [medecins,     setMedecins]     = useState([])
  const [chargement,   setChargement]   = useState(true)
  const [erreur,       setErreur]       = useState(null)
  const [recherche,    setRecherche]    = useState('')
  const [filtreGenre,  setFiltreGenre]  = useState('tous')
  const [modalNouveau, setModalNouveau] = useState(false)
  const [patientSelec, setPatientSelec] = useState(null)

  const charger = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const [pats, meds] = await Promise.all([getPatients(), getMedecins()])
      setPatients(pats)
      setMedecins(meds)
    } catch (e) {
      setErreur('Impossible de charger les patients.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const handleSave = async (data) => {
    await createPatient(data)
    await charger()
  }

  const patientsFiltres = patients.filter((p) => {
    const matchSearch =
      `${p.prenom} ${p.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
      p.telephone?.includes(recherche) ||
      p.numeroDossier?.toLowerCase().includes(recherche.toLowerCase())
    const matchGenre = filtreGenre === 'tous' || p.sexe === filtreGenre
    return matchSearch && matchGenre
  })

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">
            {patients.length} patient{patients.length > 1 ? 's' : ''} enregistré{patients.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setModalNouveau(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nouveau patient
        </button>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
          <input className="form-input pl-10"
            placeholder="Rechercher par nom, téléphone, numéro dossier..."
            value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          {recherche && (
            <button onClick={() => setRecherche('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { id: 'tous',     label: 'Tous'   },
            { id: 'Masculin', label: 'Hommes' },
            { id: 'Féminin',  label: 'Femmes' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setFiltreGenre(id)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-250
                ${filtreGenre === id
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-white border border-neutral-border text-neutral-subtle hover:border-primary hover:text-primary'
                }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {chargement ? (
        <div className="page-loader">
          <div className="text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-sm text-neutral-muted">Chargement...</p>
          </div>
        </div>
      ) : patientsFiltres.length === 0 ? (
        <div className="empty-state">
          <Users className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">{recherche ? 'Aucun résultat' : 'Aucun patient enregistré'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patientsFiltres.map((patient) => {
            const age = patient.dateNaissance
              ? Math.floor((Date.now() - toDate(patient.dateNaissance).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25))
              : null

            return (
              <div key={patient.id} onClick={() => setPatientSelec(patient)}
                className="card-hover flex items-center gap-4">
                <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center
                                justify-center flex-shrink-0">
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
                    {/* Badge médecin référent */}
                    {patient.medecinReferentNom && (
                      <span className="badge-primary text-2xs flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {patient.medecinReferentNom}
                      </span>
                    )}
                    {!patient.medecinReferentId && (
                      <span className="badge-warning text-2xs">Sans médecin référent</span>
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
                <div className="hidden sm:block text-right flex-shrink-0">
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

      {modalNouveau && (
        <ModalNouveauPatient
          onClose={() => setModalNouveau(false)}
          onSave={handleSave}
          medecins={medecins}
        />
      )}
      {patientSelec && (
        <ModalDetailPatient
          patient={patientSelec}
          onClose={() => setPatientSelec(null)}
          onUpdate={charger}
          medecins={medecins}
        />
      )}
    </div>
  )
}

export default SecretairePatients