import { useState, useEffect } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight,
  Plus, X, AlertCircle, Loader2,
  Clock, Stethoscope, Video, Globe,
  CheckCircle, Edit, Trash2, User,
  Phone, Mail, Save,
} from 'lucide-react'
import {
  getRdvs, createRdv, getPatients, getMedecins,
  getRdvsSite, confirmerRdvSite, updateRdv, deleteRdv,
  createPatient,
} from '../../services/firestore'
import { format, addDays, subDays, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function genererNumeroDossier() {
  return `PAT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
}

const HEURES = [
  '07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00',
]

const STATUTS_COULEUR = {
  en_attente:      'bg-neutral-100 text-neutral-600 border-neutral-200',
  confirme:        'bg-info-100 text-info border-info-100',
  arrive:          'bg-warning-100 text-warning border-warning-100',
  en_consultation: 'bg-accent-100 text-accent border-accent-100',
  termine:         'bg-success-100 text-success border-success-100',
  annule:          'bg-danger-100 text-danger border-danger-100',
}

const STATUTS_LABELS = {
  en_attente:      'En attente',
  confirme:        'Confirmé',
  arrive:          'Arrivé',
  en_consultation: 'En consultation',
  termine:         'Terminé',
  annule:          'Annulé',
}

// ── Modal nouveau RDV ─────────────────────────────────────
function ModalNouveauRdv({ datePre, onClose, onSave, patients, medecins }) {
  const [form, setForm] = useState({
    patientId: '', medecinId: '',
    date:  datePre ? format(datePre, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    heure: '09:00', motif: '', type: 'presentiel',
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.patientId || !form.medecinId || !form.motif) {
      setErreur('Patient, médecin et motif sont obligatoires.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      const patient = patients.find((p) => p.id === form.patientId)
      const medecin = medecins.find((m) => m.id === form.medecinId)
      await onSave({
        patientId:  form.patientId,
        patientNom: `${patient.prenom} ${patient.nom}`,
        medecinId:  form.medecinId,
        medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
        date:       new Date(form.date),
        heure:      form.heure,
        motif:      form.motif.trim(),
        type:       form.type,
        statut:     'confirme',
      })
      onClose()
    } catch (e) {
      setErreur('Erreur lors de la création.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Nouveau rendez-vous</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="modal-body space-y-4">
          {erreur && <div className="alert-error"><AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p></div>}
          <div>
            <label className="form-label">Patient *</label>
            <select className="form-input" value={form.patientId} onChange={(e) => update('patientId', e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Médecin *</label>
            <select className="form-input" value={form.medecinId} onChange={(e) => update('medecinId', e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {medecins.map((m) => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}{m.specialite ? ` · ${m.specialite}` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={(e) => update('date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Heure *</label>
              <select className="form-input" value={form.heure} onChange={(e) => update('heure', e.target.value)}>
                {HEURES.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Motif *</label>
            <input className="form-input" value={form.motif} onChange={(e) => update('motif', e.target.value)} placeholder="Motif de la consultation..." />
          </div>
          <div>
            <label className="form-label">Type</label>
            <div className="flex gap-2">
              {[
                { id: 'presentiel',       label: '🏥 Présentiel'      },
                { id: 'teleconsultation', label: '📹 Téléconsultation' },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => update('type', id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${form.type === id ? 'bg-primary text-white border-primary shadow-btn' : 'bg-white text-neutral-subtle border-neutral-border hover:border-primary'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary">
            {sauvegarde ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : <><Plus className="w-4 h-4" /> Créer le RDV</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal RDV site web ────────────────────────────────────
function ModalRdvSite({ rdv, medecins, onClose, onConfirmer, onModifier, onSupprimer }) {
  const [onglet,     setOnglet]     = useState('details') // details | modifier | patient
  const [form,       setForm]       = useState({
    medecinId:  rdv.medecinId  || '',
    medecinNom: rdv.medecinNom || '',
    date:       rdv.date ? format(toDate(rdv.date), 'yyyy-MM-dd') : '',
    heure:      rdv.heure || '09:00',
    motif:      rdv.motif || '',
    type:       rdv.type  || 'presentiel',
  })
  const [formPatient, setFormPatient] = useState({
    prenom:    rdv.patientPrenom      || rdv.patientNom?.split(' ')[0] || '',
    nom:       rdv.patientNomFamille  || rdv.patientNom?.split(' ').slice(1).join(' ') || '',
    telephone: rdv.patientTelephone   || '',
    email:     rdv.patientEmail       || '',
  })
  const [sauvegarde,  setSauvegarde]  = useState(false)
  const [erreur,      setErreur]      = useState(null)
  const [succes,      setSucces]      = useState(null)

  const update        = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const updatePatient = (k, v) => setFormPatient((f) => ({ ...f, [k]: v }))

  const handleModifier = async () => {
    if (!form.medecinId || !form.date || !form.heure || !form.motif) {
      setErreur('Tous les champs obligatoires doivent être remplis.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      const medecin = medecins.find((m) => m.id === form.medecinId)
      await onModifier(rdv.id, {
        medecinId:  form.medecinId,
        medecinNom: medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : form.medecinNom,
        date:       new Date(form.date),
        heure:      form.heure,
        motif:      form.motif.trim(),
        type:       form.type,
      })
      setSucces('RDV modifié avec succès.')
      setTimeout(() => onClose(), 1200)
    } catch (e) {
      setErreur('Erreur lors de la modification.')
    } finally {
      setSauvegarde(false)
    }
  }

  const handleConfirmer = async () => {
    setSauvegarde(true)
    setErreur(null)
    try {
      const medecin = medecins.find((m) => m.id === form.medecinId)
      await onConfirmer(rdv.id, {
        medecinId:  form.medecinId  || rdv.medecinId,
        medecinNom: medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : rdv.medecinNom,
        date:       new Date(form.date),
        heure:      form.heure,
        motif:      form.motif,
        type:       form.type,
      })
      onClose()
    } catch (e) {
      setErreur('Erreur lors de la confirmation.')
    } finally {
      setSauvegarde(false)
    }
  }

  const handleCreerPatient = async () => {
    if (!formPatient.prenom || !formPatient.nom) {
      setErreur('Prénom et nom sont obligatoires.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      await createPatient({
        prenom:        formPatient.prenom.trim(),
        nom:           formPatient.nom.trim(),
        telephone:     formPatient.telephone.trim(),
        email:         formPatient.email.trim(),
        numeroDossier: genererNumeroDossier(),
        allergies:     [],
        antecedents:   [],
        source:        'rdv_site',
      })
      setSucces('Patient créé dans la base avec succès !')
      setTimeout(() => setSucces(null), 3000)
    } catch (e) {
      setErreur('Erreur lors de la création du patient.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-text">{rdv.patientNom}</h2>
              <span className="badge-warning text-2xs flex items-center gap-1">
                <Globe className="w-3 h-3" /> Site web
              </span>
            </div>
            <p className="text-xs text-neutral-muted mt-0.5">{rdv.motif}</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-neutral-border">
          {[
            { id: 'details',  label: 'Détails'       },
            { id: 'modifier', label: 'Modifier'       },
            { id: 'patient',  label: 'Créer patient'  },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setOnglet(id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all
                ${onglet === id ? 'border-primary text-primary' : 'border-transparent text-neutral-muted hover:text-neutral-text'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body space-y-4">
          {erreur && <div className="alert-error"><AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p></div>}
          {succes && <div className="alert-success"><CheckCircle className="w-4 h-4 flex-shrink-0" /><p>{succes}</p></div>}

          {/* ── Détails ── */}
          {onglet === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Date',    value: rdv.date ? format(toDate(rdv.date), 'dd MMM yyyy', { locale: fr }) : '—' },
                  { label: 'Heure',   value: rdv.heure || '—'   },
                  { label: 'Motif',   value: rdv.motif || '—'   },
                  { label: 'Type',    value: rdv.type === 'teleconsultation' ? '📹 Téléconsultation' : '🏥 Présentiel' },
                  { label: 'Médecin', value: rdv.medecinNom || 'Non assigné' },
                  { label: 'Statut',  value: STATUTS_LABELS[rdv.statut] || rdv.statut },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-neutral-bg rounded-xl p-3">
                    <p className="text-xs text-neutral-muted">{label}</p>
                    <p className="text-sm font-semibold text-neutral-text mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Contact patient */}
              <div className="p-4 bg-warning-50 border border-warning-100 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-warning uppercase tracking-wide">Contact patient</p>
                {rdv.patientTelephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-neutral-muted" />
                    <span>{rdv.patientTelephone}</span>
                  </div>
                )}
                {rdv.patientEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-neutral-muted" />
                    <span>{rdv.patientEmail}</span>
                  </div>
                )}
                {rdv.notes && (
                  <div className="text-sm text-neutral-muted mt-2">
                    <p className="font-medium text-neutral-text">Notes :</p>
                    <p>{rdv.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Modifier ── */}
          {onglet === 'modifier' && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Médecin *</label>
                <select className="form-input" value={form.medecinId}
                  onChange={(e) => update('medecinId', e.target.value)}>
                  <option value="">-- Sélectionner --</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.prenom} {m.nom}{m.specialite ? ` · ${m.specialite}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date}
                    onChange={(e) => update('date', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Heure *</label>
                  <select className="form-input" value={form.heure}
                    onChange={(e) => update('heure', e.target.value)}>
                    {HEURES.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Motif</label>
                <input className="form-input" value={form.motif}
                  onChange={(e) => update('motif', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Type</label>
                <div className="flex gap-2">
                  {[
                    { id: 'presentiel',       label: '🏥 Présentiel'      },
                    { id: 'teleconsultation', label: '📹 Téléconsultation' },
                  ].map(({ id, label }) => (
                    <button key={id} onClick={() => update('type', id)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                        ${form.type === id ? 'bg-primary text-white border-primary shadow-btn' : 'bg-white text-neutral-subtle border-neutral-border hover:border-primary'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Créer patient ── */}
          {onglet === 'patient' && (
            <div className="space-y-4">
              <div className="p-3 bg-info-50 border border-info-100 rounded-xl">
                <p className="text-xs text-info font-semibold mb-1">ℹ️ Créer le dossier patient</p>
                <p className="text-xs text-neutral-muted">
                  Créez le dossier de ce patient dans la base pour le suivre après son RDV.
                  Il pourra créer son compte sur l'appli et y accéder.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Prénom *</label>
                  <input className="form-input" value={formPatient.prenom}
                    onChange={(e) => updatePatient('prenom', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Nom *</label>
                  <input className="form-input" value={formPatient.nom}
                    onChange={(e) => updatePatient('nom', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Téléphone
                </label>
                <input className="form-input" value={formPatient.telephone}
                  onChange={(e) => updatePatient('telephone', e.target.value)} />
              </div>
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input type="email" className="form-input" value={formPatient.email}
                  onChange={(e) => updatePatient('email', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="modal-footer flex-wrap gap-2">
          {/* Supprimer */}
          <button onClick={() => onSupprimer(rdv.id)}
            className="btn-sm flex items-center gap-1.5 text-danger hover:bg-danger-50 rounded-xl px-3 py-2">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>

          <div className="flex-1" />

          <button onClick={onClose} className="btn-outline btn-sm">Fermer</button>

          {onglet === 'details' && rdv.statut === 'en_attente' && (
            <button onClick={handleConfirmer} disabled={sauvegarde} className="btn-primary btn-sm">
              {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirmer le RDV
            </button>
          )}

          {onglet === 'modifier' && (
            <button onClick={handleModifier} disabled={sauvegarde} className="btn-primary btn-sm">
              {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          )}

          {onglet === 'patient' && (
            <button onClick={handleCreerPatient} disabled={sauvegarde} className="btn-primary btn-sm">
              {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              Créer le dossier
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function SecretaireAgenda() {
  const [rdvs,       setRdvs]       = useState([])
  const [rdvsSite,   setRdvsSite]   = useState([])
  const [patients,   setPatients]   = useState([])
  const [medecins,   setMedecins]   = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)
  const [dateActive, setDateActive] = useState(new Date())
  const [modalNouv,  setModalNouv]  = useState(false)
  const [datePre,    setDatePre]    = useState(null)
  const [onglet,     setOnglet]     = useState('agenda')  // agenda | site
  const [rdvSiteSelec, setRdvSiteSelec] = useState(null)

  const charger = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const [r, rs, p, m] = await Promise.all([
        getRdvs(),
        getRdvsSite(),
        getPatients(),
        getMedecins(),
      ])
      setRdvs(r)
      setRdvsSite(rs)
      setPatients(p)
      setMedecins(m)
    } catch (e) {
      setErreur('Impossible de charger l\'agenda.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const handleSave       = async (data) => { await createRdv(data);                await charger() }
  const handleConfirmer  = async (id, data) => { await confirmerRdvSite(id, data); await charger() }
  const handleModifier   = async (id, data) => { await updateRdv(id, data);        await charger() }
  const handleSupprimer  = async (id) => {
    await deleteRdv(id)
    setRdvSiteSelec(null)
    await charger()
  }

  const debutSemaine = startOfWeek(dateActive, { weekStartsOn: 1 })
  const jours        = Array.from({ length: 7 }, (_, i) => addDays(debutSemaine, i))

  const rdvsDuJour = rdvs
    .filter((r) => { const d = toDate(r.date); return d && isSameDay(d, dateActive) })
    .sort((a, b) => (a.heure || '').localeCompare(b.heure || ''))

  const rdvsParJour = (jour) =>
    rdvs.filter((r) => { const d = toDate(r.date); return d && isSameDay(d, jour) }).length

  const nbSiteEnAttente = rdvsSite.filter((r) => r.statut === 'en_attente').length

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement de l'agenda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">{format(dateActive, 'MMMM yyyy', { locale: fr })}</p>
        </div>
        {onglet === 'agenda' && (
          <button onClick={() => { setDatePre(dateActive); setModalNouv(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouveau RDV
          </button>
        )}
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex border-b border-neutral-border gap-1">
        <button onClick={() => setOnglet('agenda')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all
            ${onglet === 'agenda' ? 'border-primary text-primary' : 'border-transparent text-neutral-muted hover:text-neutral-text'}`}>
          <Calendar className="w-4 h-4" />
          Agenda
        </button>
        <button onClick={() => setOnglet('site')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all
            ${onglet === 'site' ? 'border-primary text-primary' : 'border-transparent text-neutral-muted hover:text-neutral-text'}`}>
          <Globe className="w-4 h-4" />
          RDV site web
          {nbSiteEnAttente > 0 && (
            <span className="w-5 h-5 bg-warning rounded-full flex items-center justify-center">
              <span className="text-2xs text-white font-bold">{nbSiteEnAttente}</span>
            </span>
          )}
        </button>
      </div>

      {/* ── ONGLET AGENDA ── */}
      {onglet === 'agenda' && (
        <>
          {/* Navigation semaine */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setDateActive(subDays(dateActive, 7))} className="btn-icon">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-neutral-text">
                {format(debutSemaine, 'dd MMM', { locale: fr })} —{' '}
                {format(addDays(debutSemaine, 6), 'dd MMM yyyy', { locale: fr })}
              </span>
              <button onClick={() => setDateActive(addDays(dateActive, 7))} className="btn-icon">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {jours.map((jour) => {
                const estActif   = isSameDay(jour, dateActive)
                const estAujourd = isSameDay(jour, new Date())
                const nbRdv      = rdvsParJour(jour)
                return (
                  <button key={jour.toISOString()} onClick={() => setDateActive(jour)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                      ${estActif ? 'bg-primary text-white shadow-btn'
                        : estAujourd ? 'bg-primary-50 text-primary'
                        : 'hover:bg-neutral-bg text-neutral-subtle'}`}>
                    <span className="text-2xs font-medium uppercase">
                      {format(jour, 'EEE', { locale: fr })}
                    </span>
                    <span className="text-base font-bold leading-none">{format(jour, 'dd')}</span>
                    {nbRdv > 0 && (
                      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full
                        ${estActif ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary'}`}>
                        {nbRdv}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* RDV du jour */}
          <div>
            <h2 className="section-title mb-3">
              {format(dateActive, 'EEEE dd MMMM', { locale: fr })}
              <span className="ml-2 text-sm font-normal text-neutral-muted">
                · {rdvsDuJour.length} rendez-vous
              </span>
            </h2>
            {rdvsDuJour.length === 0 ? (
              <div className="empty-state">
                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Aucun rendez-vous ce jour</p>
                <button onClick={() => { setDatePre(dateActive); setModalNouv(true) }}
                  className="btn-outline mt-4 btn-sm">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un RDV
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {rdvsDuJour.map((rdv) => (
                  <div key={rdv.id} className="card-hover flex items-center gap-4">
                    <div className="w-14 text-center flex-shrink-0">
                      <p className="text-base font-bold text-primary">{rdv.heure}</p>
                      <p className="text-2xs text-neutral-muted">
                        {rdv.type === 'teleconsultation' ? '📹' : '🏥'}
                      </p>
                    </div>
                    <div className="w-px self-stretch bg-neutral-border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-neutral-text">{rdv.patientNom}</p>
                        <span className={`badge ${STATUTS_COULEUR[rdv.statut] || 'badge-neutral'}`}>
                          {STATUTS_LABELS[rdv.statut] || rdv.statut}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-muted mt-0.5 truncate">{rdv.motif}</p>
                      <p className="text-xs text-neutral-subtle mt-0.5 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> {rdv.medecinNom}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ONGLET RDV SITE WEB ── */}
      {onglet === 'site' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-neutral-text">
                {rdvsSite.length} demande{rdvsSite.length > 1 ? 's' : ''} reçue{rdvsSite.length > 1 ? 's' : ''} via le site
              </p>
              <p className="text-sm text-neutral-muted">
                {nbSiteEnAttente} en attente de traitement
              </p>
            </div>
          </div>

          {rdvsSite.length === 0 ? (
            <div className="empty-state">
              <Globe className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">Aucune demande de RDV via le site</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rdvsSite.map((rdv) => {
                const date = toDate(rdv.date)
                return (
                  <div key={rdv.id}
                    onClick={() => setRdvSiteSelec(rdv)}
                    className={`card-hover flex items-start gap-4
                      ${rdv.statut === 'en_attente' ? 'border-l-4 border-l-warning' : ''}`}>

                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                      ${rdv.type === 'teleconsultation' ? 'bg-info-50 text-info' : 'bg-primary-50 text-primary'}`}>
                      {rdv.type === 'teleconsultation'
                        ? <Video className="w-5 h-5" />
                        : <Stethoscope className="w-5 h-5" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-neutral-text">{rdv.patientNom}</p>
                        <span className={`badge ${STATUTS_COULEUR[rdv.statut] || 'badge-neutral'}`}>
                          {STATUTS_LABELS[rdv.statut] || rdv.statut}
                        </span>
                        <span className="badge-warning text-2xs flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Site web
                        </span>
                      </div>
                      <p className="text-sm text-neutral-muted mt-0.5 truncate">{rdv.motif}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date ? format(date, 'dd MMM yyyy', { locale: fr }) : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rdv.heure}
                        </span>
                        {rdv.patientTelephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {rdv.patientTelephone}
                          </span>
                        )}
                      </div>
                    </div>

                    {rdv.statut === 'en_attente' && (
                      <div className="flex-shrink-0 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setRdvSiteSelec(rdv) }}
                          className="btn-primary btn-sm flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Traiter
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modalNouv && (
        <ModalNouveauRdv
          datePre={datePre}
          onClose={() => setModalNouv(false)}
          onSave={handleSave}
          patients={patients}
          medecins={medecins}
        />
      )}

      {rdvSiteSelec && (
        <ModalRdvSite
          rdv={rdvSiteSelec}
          medecins={medecins}
          onClose={() => { setRdvSiteSelec(null); charger() }}
          onConfirmer={handleConfirmer}
          onModifier={handleModifier}
          onSupprimer={handleSupprimer}
        />
      )}
    </div>
  )
}

export default SecretaireAgenda