import { useState, useEffect } from 'react'
import {
  FlaskConical, Image as ImageIcon, FileQuestion,
  Search, Loader2, CheckCircle2, Clock, Save, X,
} from 'lucide-react'
import { getExamensByMedecin, updateExamen } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const TYPE_ICONS = { analyse: FlaskConical, imagerie: ImageIcon, autre: FileQuestion }
const TYPE_LABELS = { analyse: 'Analyse', imagerie: 'Imagerie', autre: 'Autre' }

function ModalResultat({ examen, onClose, onSave }) {
  const [resultat, setResultat] = useState(examen.resultat || '')
  const [commentaire, setCommentaire] = useState(examen.commentaireMedecin || '')
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleSubmit = async (marquerDisponible) => {
    setSauvegarde(true)
    try {
      await updateExamen(examen.id, {
        resultat,
        commentaireMedecin: commentaire,
        statut: marquerDisponible ? 'resultat_disponible' : examen.statut,
      })
      onSave()
      onClose()
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-modal animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-neutral-text">{examen.designation}</h3>
            <p className="text-xs text-neutral-muted">{examen.patientNom} — {TYPE_LABELS[examen.type]}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-bg text-neutral-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {examen.instructions && (
          <p className="text-sm text-neutral-muted mb-4">Instructions : {examen.instructions}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="form-label">Résultat</label>
            <textarea
              className="form-input w-full"
              rows={5}
              value={resultat}
              onChange={(e) => setResultat(e.target.value)}
              placeholder="Saisir le résultat de l'examen..."
            />
          </div>
          <div>
            <label className="form-label">Commentaire</label>
            <textarea
              className="form-input w-full"
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Interprétation, recommandations..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={sauvegarde} className="btn-ghost flex-1">
            Fermer
          </button>
          <button onClick={() => handleSubmit(false)} disabled={sauvegarde} className="btn-outline flex-1">
            {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enregistrer'}
          </button>
          <button onClick={() => handleSubmit(true)} disabled={sauvegarde} className="btn-primary flex-1">
            <span className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Publier
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MedecinExamens() {
  const { user } = useAuthStore()
  const [examens, setExamens] = useState([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('en_attente')
  const [examenSelec, setExamenSelec] = useState(null)

  const charger = async () => {
    if (!user?.uid) return
    setChargement(true)
    try {
      setExamens(await getExamensByMedecin(user.uid))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [user?.uid])

  const filtres = examens.filter((ex) => {
    if (filtre === 'en_attente' && ex.statut !== 'prescrit') return false
    if (filtre === 'disponible' && ex.statut !== 'resultat_disponible') return false
    const search = recherche.toLowerCase()
    return !search
      || ex.patientNom?.toLowerCase().includes(search)
      || ex.designation.toLowerCase().includes(search)
  })

  if (chargement) return <PageLoader text="Chargement des examens..." />

  return (
    <div>
      <h1 className="page-title mb-6">Examens</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-muted" />
          <input
            className="form-input pl-9 w-full"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un patient ou un examen..."
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'en_attente', label: 'En attente' },
            { id: 'disponible', label: 'Résultats saisis' },
            { id: 'tous', label: 'Tous' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltre(f.id)}
              className={filtre === f.id ? 'sidebar-link-active' : 'sidebar-link'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtres.length === 0 ? (
        <EmptyState icon={FlaskConical} title="Aucun examen" description="Aucun examen ne correspond à ce filtre." />
      ) : (
        <div className="space-y-2">
          {filtres.map((ex) => {
            const Icone = TYPE_ICONS[ex.type] || FileQuestion
            return (
              <button
                key={ex.id}
                onClick={() => setExamenSelec(ex)}
                className="card-hover w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-text">{ex.designation}</p>
                  <p className="text-xs text-neutral-muted">
                    {ex.patientNom} · {format(toDate(ex.datePrescription), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                {ex.statut === 'resultat_disponible' ? (
                  <span className="badge-success flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Résultat saisi
                  </span>
                ) : (
                  <span className="badge-neutral flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> En attente
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {examenSelec && (
        <ModalResultat
          examen={examenSelec}
          onClose={() => setExamenSelec(null)}
          onSave={charger}
        />
      )}
    </div>
  )
}