import { useState, useEffect } from 'react'
import {
  Stethoscope, X, AlertCircle, Loader2,
  Plus, Trash2, CheckCircle, FileText,
  User, Clock, ChevronRight,
} from 'lucide-react'
import {
  getRdvsByMedecin, getPatientById,
  getConsultationsByPatient, createConsultation,
  updateConsultation, updateStatutRdv, createFacture,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

// ── Modal consultation ────────────────────────────────────
function ModalConsultation({ rdv, patient, consultationExistante, onClose, onSave, medecin }) {
  const [form, setForm] = useState({
    examenClinique: consultationExistante?.examenClinique || '',
    diagnostic:     consultationExistante?.diagnostic     || '',
    planTraitement: consultationExistante?.planTraitement || '',
    notes:          consultationExistante?.notes          || '',
  })
  const [ordonnances,  setOrdonnances]  = useState(
    consultationExistante?.ordonnances || []
  )
  const [nouvelleOrdo, setNouvelleOrdo] = useState({
    medicament: '', posologie: '', duree: '',
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [terminer,   setTerminer]   = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const update     = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const updateOrdo = (k, v) => setNouvelleOrdo((o) => ({ ...o, [k]: v }))

  const ajouterOrdonnance = () => {
    if (!nouvelleOrdo.medicament) return
    setOrdonnances((prev) => [...prev, { ...nouvelleOrdo }])
    setNouvelleOrdo({ medicament: '', posologie: '', duree: '' })
  }

  const supprimerOrdonnance = (i) =>
    setOrdonnances((prev) => prev.filter((_, idx) => idx !== i))

  const handleSauvegarder = async (terminerConsult = false) => {
    if (!form.diagnostic) {
      setErreur('Le diagnostic est obligatoire.')
      return
    }
    terminerConsult ? setTerminer(true) : setSauvegarde(true)
    setErreur(null)
    try {
      await onSave({
        ...form,
        ordonnances,
        rdvId:      rdv.id,
        patientId:  rdv.patientId,
        patientNom: rdv.patientNom,
        medecinId:  medecin.uid,
        medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
        date:       new Date(),
        statut:     terminerConsult ? 'termine' : 'en_cours',
        consultationId: consultationExistante?.id || null,
      }, terminerConsult)
      onClose()
    } catch (e) {
      setErreur('Erreur lors de la sauvegarde.')
    } finally {
      setSauvegarde(false)
      setTerminer(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="text-lg font-bold text-neutral-text">
              Consultation — {rdv.patientNom}
            </h2>
            <p className="text-xs text-neutral-muted mt-0.5">
              {rdv.motif} · {rdv.heure}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-5">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          {/* Infos patient */}
          {patient && (
            <div className="bg-primary-50 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {patient.prenom?.[0]}{patient.nom?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-text">
                  {patient.prenom} {patient.nom}
                </p>
                <div className="flex gap-3 mt-0.5 flex-wrap">
                  {patient.groupeSanguin && (
                    <span className="badge-danger text-2xs">{patient.groupeSanguin}</span>
                  )}
                  {patient.allergies?.length > 0 && (
                    <span className="badge-warning text-2xs">
                      ⚠️ Allergies : {patient.allergies.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-neutral-muted">
                <p>{patient.numeroDossier}</p>
              </div>
            </div>
          )}

          {/* Examen clinique */}
          <div>
            <label className="form-label">Examen clinique</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              value={form.examenClinique}
              onChange={(e) => update('examenClinique', e.target.value)}
              placeholder="TA, pouls, poids, signes cliniques..."
            />
          </div>

          {/* Diagnostic */}
          <div>
            <label className="form-label">Diagnostic *</label>
            <textarea
              className="form-input resize-none"
              rows={2}
              value={form.diagnostic}
              onChange={(e) => update('diagnostic', e.target.value)}
              placeholder="Diagnostic principal..."
            />
          </div>

          {/* Plan de traitement */}
          <div>
            <label className="form-label">Plan de traitement</label>
            <textarea
              className="form-input resize-none"
              rows={2}
              value={form.planTraitement}
              onChange={(e) => update('planTraitement', e.target.value)}
              placeholder="Traitement prescrit, examens complémentaires..."
            />
          </div>

          {/* Ordonnances */}
          <div>
            <label className="form-label">Ordonnances</label>
            <div className="space-y-2 mb-3">
              {ordonnances.length === 0 ? (
                <p className="text-sm text-neutral-muted">Aucune ordonnance ajoutée</p>
              ) : (
                ordonnances.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-neutral-bg rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-text">{o.medicament}</p>
                      <p className="text-xs text-neutral-muted">
                        {o.posologie} · {o.duree}
                      </p>
                    </div>
                    <button
                      onClick={() => supprimerOrdonnance(i)}
                      className="btn-icon w-7 h-7 text-danger hover:bg-danger-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Ajouter ordonnance */}
            <div className="grid grid-cols-3 gap-2">
              <input
                className="form-input col-span-3 sm:col-span-1"
                value={nouvelleOrdo.medicament}
                onChange={(e) => updateOrdo('medicament', e.target.value)}
                placeholder="Médicament"
              />
              <input
                className="form-input"
                value={nouvelleOrdo.posologie}
                onChange={(e) => updateOrdo('posologie', e.target.value)}
                placeholder="Posologie"
              />
              <input
                className="form-input"
                value={nouvelleOrdo.duree}
                onChange={(e) => updateOrdo('duree', e.target.value)}
                placeholder="Durée"
              />
            </div>
            <button
              onClick={ajouterOrdonnance}
              disabled={!nouvelleOrdo.medicament}
              className="btn-outline btn-sm mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes internes</label>
            <textarea
              className="form-input resize-none"
              rows={2}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Notes confidentielles..."
            />
          </div>
        </div>

        <div className="modal-footer justify-between">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <div className="flex gap-3">
            <button
              onClick={() => handleSauvegarder(false)}
              disabled={sauvegarde || terminer}
              className="btn-outline"
            >
              {sauvegarde
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                : 'Sauvegarder'
              }
            </button>
            <button
              onClick={() => handleSauvegarder(true)}
              disabled={sauvegarde || terminer}
              className="btn-primary"
            >
              {terminer
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalisation...</>
                : <><CheckCircle className="w-4 h-4" /> Terminer la consultation</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function MedecinConsultation() {
  const { user }          = useAuthStore()
  const [rdvs,            setRdvs]            = useState([])
  const [chargement,      setChargement]      = useState(true)
  const [erreur,          setErreur]          = useState(null)
  const [rdvSelec,        setRdvSelec]        = useState(null)
  const [patientSelec,    setPatientSelec]    = useState(null)
  const [consultExist,    setConsultExist]    = useState(null)
  const [chargPatient,    setChargPatient]    = useState(false)

  const charger = async () => {
    if (!user?.uid) return
    setChargement(true)
    setErreur(null)
    try {
      const data = await getRdvsByMedecin(user.uid)
      const rdvsActifs = data.filter((r) => {
        const d = toDate(r.date)
        return d && isToday(d) && r.statut !== 'annule'
      }).sort((a, b) => (a.heure || '').localeCompare(b.heure || ''))
      setRdvs(rdvsActifs)
    } catch (e) {
      setErreur('Impossible de charger les consultations.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [user])

  const ouvrirConsultation = async (rdv) => {
    setChargPatient(true)
    try {
      const [patient, consultations] = await Promise.all([
        getPatientById(rdv.patientId),
        getConsultationsByPatient(rdv.patientId),
      ])
      const existante = consultations.find((c) => c.rdvId === rdv.id) || null
      setPatientSelec(patient)
      setConsultExist(existante)
      setRdvSelec(rdv)
      // Passer le statut à en_consultation si arrivé
      if (rdv.statut === 'arrive') {
        await updateStatutRdv(rdv.id, 'en_consultation')
        await charger()
      }
    } catch (e) {
      setErreur('Impossible de charger le dossier patient.')
    } finally {
      setChargPatient(false)
    }
  }

  const handleSave = async (data, terminer) => {
    if (data.consultationId) {
      await updateConsultation(data.consultationId, data)
    } else {
      await createConsultation(data)
    }
    if (terminer) {
      await updateStatutRdv(data.rdvId, 'termine')
      // Créer facture automatiquement
      await createFacture({
        patientId:      data.patientId,
        patientNom:     data.patientNom,
        medecinId:      data.medecinId,
        medecinNom:     data.medecinNom,
        service:        `Consultation — ${rdvSelec?.motif || ''}`,
        montant:        25000,
        statut:         'impayee',
        dateCreation:   new Date(),
      })
    }
    await charger()
  }

  const STATUTS_CONFIG = {
    confirme:        { label: 'Confirmé',         classe: 'badge-info',    action: 'Démarrer'   },
    arrive:          { label: 'Arrivé',            classe: 'badge-warning', action: 'Démarrer'   },
    en_consultation: { label: 'En consultation',   classe: 'badge-accent',  action: 'Continuer'  },
    termine:         { label: 'Terminé',           classe: 'badge-success', action: null          },
    en_attente:      { label: 'En attente',        classe: 'badge-neutral', action: null          },
  }

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
        <h1 className="page-title">Consultations du jour</h1>
        <p className="page-subtitle">
          {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}
          {' · '}{rdvs.length} patient{rdvs.length > 1 ? 's' : ''}
        </p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {rdvs.length === 0 ? (
        <div className="empty-state">
          <Stethoscope className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucune consultation aujourd'hui</p>
          <p className="text-sm mt-1 text-neutral-muted">
            Les rendez-vous confirmés et arrivés apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvs.map((rdv) => {
            const config = STATUTS_CONFIG[rdv.statut] || STATUTS_CONFIG.en_attente

            return (
              <div key={rdv.id} className="card-hover flex items-center gap-4">

                {/* Heure */}
                <div className="w-14 text-center flex-shrink-0">
                  <p className="text-lg font-bold text-primary leading-none">{rdv.heure}</p>
                  <p className="text-2xs text-neutral-muted mt-0.5">
                    {rdv.type === 'teleconsultation' ? '📹' : '🏥'}
                  </p>
                </div>

                <div className="w-px self-stretch bg-neutral-border flex-shrink-0" />

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-text">{rdv.patientNom}</p>
                    <span className={config.classe + ' badge'}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-muted mt-0.5 truncate">{rdv.motif}</p>
                </div>

                {/* Action */}
                {config.action && (
                  <button
                    onClick={() => ouvrirConsultation(rdv)}
                    disabled={chargPatient}
                    className="btn-primary btn-sm flex-shrink-0 flex items-center gap-1.5"
                  >
                    {chargPatient
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Stethoscope className="w-3.5 h-3.5" />
                    }
                    {config.action}
                  </button>
                )}

                {rdv.statut === 'termine' && (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal consultation */}
      {rdvSelec && patientSelec && (
        <ModalConsultation
          rdv={rdvSelec}
          patient={patientSelec}
          consultationExistante={consultExist}
          onClose={() => {
            setRdvSelec(null)
            setPatientSelec(null)
            setConsultExist(null)
          }}
          onSave={handleSave}
          medecin={user}
        />
      )}
    </div>
  )
}

export default MedecinConsultation