import { useState, useEffect } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight,
  Plus, X, AlertCircle, Loader2,
  Stethoscope, Video, Clock, Edit,
  XCircle, Save,
} from 'lucide-react'
import {
  getRdvsByMedecin, createRdv, getPatientsByMedecin,
  updateRdv, updateStatutRdv,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, addDays, subDays, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
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
function ModalNouveauRdv({ datePre, onClose, onSave, patients, medecin }) {
  const [form, setForm] = useState({
    patientId: '',
    date:  datePre ? format(datePre, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    heure: '09:00', motif: '', type: 'presentiel',
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.patientId || !form.motif) {
      setErreur('Patient et motif sont obligatoires.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      const patient = patients.find((p) => p.id === form.patientId)
      await onSave({
        patientId:  form.patientId,
        patientNom: `${patient.prenom} ${patient.nom}`,
        medecinId:  medecin.uid,
        medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
        date:       new Date(form.date),
        heure:      form.heure,
        motif:      form.motif.trim(),
        type:       form.type,
        statut:     'confirme',
      })
      onClose()
    } catch (e) {
      setErreur('Erreur lors de la création du rendez-vous.')
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
              <option value="">-- Sélectionner un patient --</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
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

// ── Modal repousser RDV ───────────────────────────────────
function ModalRepousserRdv({ rdv, onClose, onSave }) {
  const [date,       setDate]       = useState(rdv.date ? format(toDate(rdv.date), 'yyyy-MM-dd') : '')
  const [heure,      setHeure]      = useState(rdv.heure || '09:00')
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const handleSubmit = async () => {
    if (!date || !heure) { setErreur('Date et heure obligatoires.'); return }
    setSauvegarde(true)
    try {
      await onSave(rdv.id, { date: new Date(date), heure })
      onClose()
    } catch (e) {
      setErreur('Erreur lors de la modification.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Repousser le RDV</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="modal-body space-y-4">
          {erreur && <div className="alert-error"><AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p></div>}

          <div className="p-3 bg-neutral-bg rounded-xl">
            <p className="text-xs text-neutral-muted">RDV actuel</p>
            <p className="text-sm font-semibold text-neutral-text mt-0.5">
              {rdv.patientNom} — {rdv.date ? format(toDate(rdv.date), 'dd MMM yyyy', { locale: fr }) : '—'} à {rdv.heure}
            </p>
          </div>

          <div>
            <label className="form-label">Nouvelle date *</label>
            <input type="date" className="form-input" value={date}
              onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Nouvel horaire *</label>
            <select className="form-input" value={heure} onChange={(e) => setHeure(e.target.value)}>
              {HEURES.map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary">
            {sauvegarde ? <><Loader2 className="w-4 h-4 animate-spin" /> Modification...</> : <><Save className="w-4 h-4" /> Repousser</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function MedecinAgenda() {
  const { user }        = useAuthStore()
  const [rdvs,          setRdvs]          = useState([])
  const [patients,      setPatients]      = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)
  const [dateActive,    setDateActive]    = useState(new Date())
  const [modalNouv,     setModalNouv]     = useState(false)
  const [datePre,       setDatePre]       = useState(null)
  const [rdvRepousser,  setRdvRepousser]  = useState(null)
  const [annulEnCours,  setAnnulEnCours]  = useState(null)

  const charger = async () => {
    if (!user?.uid) return
    setChargement(true)
    setErreur(null)
    try {
      const [r, p] = await Promise.all([
        getRdvsByMedecin(user.uid),
        getPatientsByMedecin(user.uid),
      ])
      setRdvs(r)
      setPatients(p)
    } catch (e) {
      setErreur('Impossible de charger l\'agenda.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [user])

  const handleSave      = async (data)    => { await createRdv(data);              await charger() }
  const handleRepousser = async (id, data) => { await updateRdv(id, data);         await charger() }
  const handleAnnuler   = async (id) => {
    setAnnulEnCours(id)
    try {
      await updateStatutRdv(id, 'annule')
      await charger()
    } catch (e) {
      setErreur('Impossible d\'annuler le RDV.')
    } finally {
      setAnnulEnCours(null)
    }
  }

  const debutSemaine = startOfWeek(dateActive, { weekStartsOn: 1 })
  const jours        = Array.from({ length: 7 }, (_, i) => addDays(debutSemaine, i))

  const rdvsDuJour = rdvs
    .filter((r) => { const d = toDate(r.date); return d && isSameDay(d, dateActive) })
    .sort((a, b) => (a.heure || '').localeCompare(b.heure || ''))

  const rdvsParJour = (jour) =>
    rdvs.filter((r) => { const d = toDate(r.date); return d && isSameDay(d, jour) }).length

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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mon agenda</h1>
          <p className="page-subtitle">{format(dateActive, 'MMMM yyyy', { locale: fr })}</p>
        </div>
        <button onClick={() => { setDatePre(dateActive); setModalNouv(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Nouveau RDV
        </button>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
        </div>
      )}

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
            {rdvsDuJour.map((rdv) => {
              const peutModifier = !['termine', 'annule', 'en_consultation'].includes(rdv.statut)
              return (
                <div key={rdv.id} className="card flex items-center gap-4">
                  {/* Heure + type */}
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-base font-bold text-primary">{rdv.heure}</p>
                    <div className={`w-7 h-7 mx-auto mt-1 rounded-lg flex items-center justify-center
                      ${rdv.type === 'teleconsultation' ? 'bg-info-50' : 'bg-primary-50'}`}>
                      {rdv.type === 'teleconsultation'
                        ? <Video className="w-3.5 h-3.5 text-info" />
                        : <Stethoscope className="w-3.5 h-3.5 text-primary" />
                      }
                    </div>
                  </div>

                  <div className="w-px self-stretch bg-neutral-border flex-shrink-0" />

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-text">{rdv.patientNom}</p>
                      <span className={`badge ${STATUTS_COULEUR[rdv.statut] || 'badge-neutral'}`}>
                        {STATUTS_LABELS[rdv.statut] || rdv.statut}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-muted mt-0.5 truncate">{rdv.motif}</p>
                  </div>

                  {/* Actions */}
                  {peutModifier && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setRdvRepousser(rdv)}
                        className="btn-icon w-8 h-8 text-info hover:bg-info-50"
                        title="Repousser"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAnnuler(rdv.id)}
                        disabled={annulEnCours === rdv.id}
                        className="btn-icon w-8 h-8 text-danger hover:bg-danger-50"
                        title="Annuler"
                      >
                        {annulEnCours === rdv.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <XCircle className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalNouv && (
        <ModalNouveauRdv
          datePre={datePre}
          onClose={() => setModalNouv(false)}
          onSave={handleSave}
          patients={patients}
          medecin={user}
        />
      )}

      {rdvRepousser && (
        <ModalRepousserRdv
          rdv={rdvRepousser}
          onClose={() => setRdvRepousser(null)}
          onSave={handleRepousser}
        />
      )}
    </div>
  )
}

export default MedecinAgenda