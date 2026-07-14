import { useState, useEffect } from 'react'
import {
  FileSignature, FileText, Plus, Trash2, Download,
  Loader2, PenLine, Search, X,
} from 'lucide-react'
import {
  getPatientsByMedecin, getDocumentsByMedecin, createDocument, deleteDocument,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { useClinicStore } from '../../store/clinicStore'
import { genererDocumentPdf } from '../../utils/genererDocumentPdf'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const TEMPLATES = {
  certificat: (patientNom) =>
    `Je soussigné(e), docteur en médecine, certifie avoir examiné ce jour ${patientNom}.\n\n` +
    `[Motif / constat à préciser]\n\n` +
    `Ce certificat est délivré à la demande de l'intéressé(e) et remis en main propre pour faire valoir ce que de droit.`,
  compte_rendu: (patientNom) =>
    `Compte rendu de consultation de ${patientNom}.\n\n` +
    `Motif :\n\nExamen clinique :\n\nConclusion :\n`,
  autre: () => '',
}

function ModalNouveauDocument({ patients, medecin, onClose, onSave }) {
  const [patientId, setPatientId] = useState('')
  const [type, setType] = useState('certificat')
  const [titre, setTitre] = useState('Certificat médical')
  const [contenu, setContenu] = useState(TEMPLATES.certificat(''))
  const [signer, setSigner] = useState(true)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur, setErreur] = useState(null)

  const changerType = (t) => {
    setType(t)
    const patient = patients.find((p) => p.id === patientId)
    setTitre(t === 'certificat' ? 'Certificat médical' : t === 'compte_rendu' ? 'Compte rendu de consultation' : '')
    setContenu(TEMPLATES[t](patient ? `${patient.prenom} ${patient.nom}` : ''))
  }

  const changerPatient = (id) => {
    setPatientId(id)
    const patient = patients.find((p) => p.id === id)
    if (patient) setContenu(TEMPLATES[type](`${patient.prenom} ${patient.nom}`))
  }

  const handleSubmit = async () => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient || !titre.trim() || !contenu.trim()) {
      setErreur('Patient, titre et contenu sont obligatoires.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      await createDocument({
        patientId: patient.id,
        patientNom: `${patient.prenom} ${patient.nom}`,
        medecinId: medecin.uid,
        medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
        type,
        titre: titre.trim(),
        contenu: contenu.trim(),
        signePar: signer ? `Dr. ${medecin.prenom} ${medecin.nom}` : null,
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
          <h3 className="font-bold text-neutral-text">Nouveau document</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-bg text-neutral-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {erreur && <div className="alert-error mb-4">{erreur}</div>}

        <div className="space-y-4">
          <div>
            <label className="form-label">Patient</label>
            <select className="form-input w-full" value={patientId} onChange={(e) => changerPatient(e.target.value)}>
              <option value="">Choisir...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Type de document</label>
            <div className="flex gap-2">
              {[
                { id: 'certificat', label: 'Certificat médical' },
                { id: 'compte_rendu', label: 'Compte rendu' },
                { id: 'autre', label: 'Autre' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => changerType(t.id)}
                  className={type === t.id ? 'sidebar-link-active' : 'sidebar-link'}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Titre</label>
            <input className="form-input w-full" value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Contenu</label>
            <textarea
              className="form-input w-full"
              rows={10}
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-text">
            <input type="checkbox" checked={signer} onChange={(e) => setSigner(e.target.checked)} />
            Signer électroniquement à l'enregistrement
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={sauvegarde} className="btn-ghost flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary flex-1">
            {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
              <span className="flex items-center justify-center gap-2">
                <PenLine className="w-4 h-4" /> Enregistrer
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MedecinDocuments() {
  const { user }    = useAuthStore()
  const { data: clinique } = useClinicStore()
  const [documents, setDocuments] = useState([])
  const [patients,  setPatients]  = useState([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [aSupprimer, setASupprimer] = useState(null)

  const charger = async () => {
    if (!user?.uid) return
    setChargement(true)
    try {
      const [docs, pats] = await Promise.all([
        getDocumentsByMedecin(user.uid),
        getPatientsByMedecin(user.uid),
      ])
      setDocuments(docs)
      setPatients(pats)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [user?.uid])

  const confirmerSuppression = async () => {
    await deleteDocument(aSupprimer.id)
    setASupprimer(null)
    charger()
  }

  const filtres = documents.filter((d) => {
    const search = recherche.toLowerCase()
    return !search || d.patientNom?.toLowerCase().includes(search) || d.titre.toLowerCase().includes(search)
  })

  if (chargement) return <PageLoader text="Chargement des documents..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Documents</h1>
        <button onClick={() => setModalOuvert(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau document
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-muted" />
        <input
          className="form-input pl-9 w-full"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un patient ou un document..."
        />
      </div>

      {filtres.length === 0 ? (
        <EmptyState icon={FileSignature} title="Aucun document" description="Créez un certificat ou un compte rendu." />
      ) : (
        <div className="space-y-2">
          {filtres.map((d) => (
            <div key={d.id} className="card-hover flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-text">{d.titre}</p>
                <p className="text-xs text-neutral-muted">
                  {d.patientNom} · {format(toDate(d.dateCreation), 'dd MMM yyyy', { locale: fr })}
                  {d.signePar && ' · Signé'}
                </p>
              </div>
              <button onClick={() => genererDocumentPdf(d, clinique)} className="btn-icon">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => setASupprimer(d)} className="btn-icon text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOuvert && (
        <ModalNouveauDocument
          patients={patients}
          medecin={user}
          onClose={() => setModalOuvert(false)}
          onSave={charger}
        />
      )}

      <ConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={confirmerSuppression}
        title="Supprimer le document"
        message={`Supprimer "${aSupprimer?.titre}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  )
}