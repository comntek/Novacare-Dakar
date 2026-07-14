import { useState, useEffect } from 'react'
import {
  ClipboardList, Plus, Trash2, Download, Loader2, Search, X, Pill, RefreshCw,
} from 'lucide-react'
import {
  getPatientsByMedecin, getConsultationsByMedecin, createConsultation,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { useClinicStore } from '../../store/clinicStore'
import { genererOrdonnancePdf } from '../../utils/genererOrdonnancePdf'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function ModalNouvelleOrdonnance({ patients, medecin, onClose, onSave }) {
  const [patientId, setPatientId] = useState('')
  const [age, setAge] = useState('')
  const [medicaments, setMedicaments] = useState([])
  const [nouveauMedicament, setNouveauMedicament] = useState({ medicament: '', duree: '' })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur, setErreur] = useState(null)

  const changerPatient = (id) => {
    setPatientId(id)
    const patient = patients.find((p) => p.id === id)
    if (patient?.dateNaissance) {
      const ageCalcule = Math.floor(
        (Date.now() - new Date(patient.dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
      setAge(String(ageCalcule))
    } else {
      setAge('')
    }
  }

  const updateMed = (k, v) => setNouveauMedicament((m) => ({ ...m, [k]: v }))

  const ajouterMedicament = () => {
    if (!nouveauMedicament.medicament.trim()) return
    setMedicaments((prev) => [...prev, nouveauMedicament])
    setNouveauMedicament({ medicament: '', duree: '' })
  }

  const supprimerMedicament = (i) =>
    setMedicaments((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient || medicaments.length === 0) {
      setErreur('Choisissez un patient et ajoutez au moins un médicament.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      await createConsultation({
        patientId: patient.id,
        patientNom: `${patient.prenom} ${patient.nom}`,
        patientAge: age ? parseInt(age) : null,
        medecinId: medecin.uid,
        medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
        date: new Date(),
        motif: "Ordonnance",
        diagnostic: "Ordonnance",
        ordonnances: medicaments,
        statut: 'termine',
      })
      onSave()
      onClose()
    } catch (e) {
      setErreur(e.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-modal animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-neutral-text">Nouvelle ordonnance</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-bg text-neutral-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {erreur && <div className="alert-error mb-4">{erreur}</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="form-label">Patient</label>
              <select className="form-input w-full" value={patientId} onChange={(e) => changerPatient(e.target.value)}>
                <option value="">Choisir...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Âge</label>
              <input
                type="number"
                className="form-input w-full"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ans"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Médicaments</label>
            <div className="space-y-2 mb-3">
              {medicaments.length === 0 ? (
                <p className="text-sm text-neutral-muted">Aucun médicament ajouté</p>
              ) : (
                medicaments.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-neutral-bg rounded-xl">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Pill className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-text">{m.medicament}</p>
                      {m.duree && <p className="text-xs text-neutral-muted">{m.duree}</p>}
                    </div>
                    <button
                      onClick={() => supprimerMedicament(i)}
                      className="btn-icon w-7 h-7 text-danger hover:bg-danger-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-neutral-muted mb-2">
              La posologie est indiquée par le pharmacien à la délivrance.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <input
                className="form-input col-span-2"
                value={nouveauMedicament.medicament}
                onChange={(e) => updateMed('medicament', e.target.value)}
                placeholder="Nom du médicament"
              />
              <input
                className="form-input"
                value={nouveauMedicament.duree}
                onChange={(e) => updateMed('duree', e.target.value)}
                placeholder="Durée"
              />
            </div>
            <button
              onClick={ajouterMedicament}
              disabled={!nouveauMedicament.medicament.trim()}
              className="btn-outline btn-sm mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={sauvegarde} className="btn-ghost flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary flex-1">
            {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MedecinOrdonnances() {
  const { user }    = useAuthStore()
  const { data: clinique } = useClinicStore()
  const [ordonnances, setOrdonnances] = useState([])
  const [patients,    setPatients]    = useState([])
  const [chargement,  setChargement]  = useState(true)
  const [recherche,   setRecherche]   = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)

  const charger = async () => {
    if (!user?.uid) return
    setChargement(true)
    try {
      const [consultations, pats] = await Promise.all([
        getConsultationsByMedecin(user.uid),
        getPatientsByMedecin(user.uid),
      ])
      setOrdonnances(
        consultations
          .filter((c) => c.ordonnances?.length > 0)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      )
      setPatients(pats)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [user?.uid])

  const handleRenouveler = async (consultation) => {
    await createConsultation({
      patientId: consultation.patientId,
      patientNom: consultation.patientNom,
      medecinId: user.uid,
      medecinNom: `Dr. ${user.prenom} ${user.nom}`,
      date: new Date(),
      motif: "Renouvellement d'ordonnance",
      diagnostic: "Renouvellement d'ordonnance",
      ordonnances: consultation.ordonnances,
      statut: 'termine',
    })
    charger()
  }

  const filtres = ordonnances.filter((o) => {
    const search = recherche.toLowerCase()
    return !search || o.patientNom?.toLowerCase().includes(search)
  })

  if (chargement) return <PageLoader text="Chargement des ordonnances..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Ordonnances</h1>
        <button onClick={() => setModalOuvert(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle ordonnance
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-muted" />
        <input
          className="form-input pl-9 w-full"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un patient..."
        />
      </div>

      {filtres.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Aucune ordonnance" description="Créez la première ordonnance." />
      ) : (
        <div className="space-y-3">
          {filtres.map((c) => (
            <div key={c.id} className="card space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-neutral-text">{c.patientNom}</p>
                  <p className="text-xs text-neutral-muted">
                    {c.date ? format(toDate(c.date), 'dd MMMM yyyy', { locale: fr }) : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRenouveler(c)}
                    className="btn-sm btn-ghost text-primary hover:bg-primary-50 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Renouveler
                  </button>
                  <button
                    onClick={() => genererOrdonnancePdf(c, patients.find((p) => p.id === c.patientId) || null, clinique)}
                    className="btn-icon"
                    title="Télécharger en PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {c.ordonnances.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-neutral-text">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {m.medicament}
                    {m.duree && <span className="text-neutral-muted">· {m.duree}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOuvert && (
        <ModalNouvelleOrdonnance
          patients={patients}
          medecin={user}
          onClose={() => setModalOuvert(false)}
          onSave={charger}
        />
      )}
    </div>
  )
}