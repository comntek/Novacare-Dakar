import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react'
import {
  getCabinets, createCabinet, updateCabinet, deleteCabinet,
} from '../../services/firestore'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { PageLoader } from '../../components/shared/LoadingSpinner'

function ModalCabinet({ cabinet, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: cabinet?.nom || '',
    description: cabinet?.description || '',
    actif: cabinet?.actif ?? true,
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur, setErreur] = useState(null)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      setErreur('Le nom est obligatoire.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      if (cabinet) {
        await updateCabinet(cabinet.id, form)
      } else {
        await createCabinet(form)
      }
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
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-modal animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-neutral-text">
            {cabinet ? 'Modifier le cabinet' : 'Nouveau cabinet'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-bg text-neutral-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {erreur && <div className="alert-error mb-4">{erreur}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-text mb-1 block">Nom</label>
            <input
              className="form-input w-full"
              value={form.nom}
              onChange={(e) => update('nom', e.target.value)}
              placeholder="Ex: Cabinet 1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-text mb-1 block">Description</label>
            <textarea
              className="form-input w-full"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Ex: Rez-de-chaussée, aile pédiatrie"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-text">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={(e) => update('actif', e.target.checked)}
            />
            Cabinet actif
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={sauvegarde} className="btn-ghost flex-1">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary flex-1">
            {sauvegarde ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Enregistrer
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCabinets() {
  const [cabinets, setCabinets] = useState([])
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [cabinetEdition, setCabinetEdition] = useState(null)
  const [aSupprimer, setASupprimer] = useState(null)

  const charger = async () => {
    setChargement(true)
    try {
      setCabinets(await getCabinets())
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const confirmerSuppression = async () => {
    await deleteCabinet(aSupprimer.id)
    setASupprimer(null)
    charger()
  }

  if (chargement) return <PageLoader text="Chargement des cabinets..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Cabinets</h1>
        <button
          onClick={() => { setCabinetEdition(null); setModalOuvert(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouveau cabinet
        </button>
      </div>

      {cabinets.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun cabinet"
          description="Ajoutez la première salle de consultation de la clinique."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-subtle border-b border-neutral-border">
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {cabinets.map((c) => (
                <tr key={c.id} className="border-b border-neutral-border last:border-0">
                  <td className="py-3 px-4 font-medium text-neutral-text">{c.nom}</td>
                  <td className="py-3 px-4 text-neutral-subtle">{c.description}</td>
                  <td className="py-3 px-4">
                    <span className={c.actif ? 'badge-success' : 'badge-neutral'}>
                      {c.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setCabinetEdition(c); setModalOuvert(true) }}
                        className="btn-icon"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setASupprimer(c)} className="btn-icon text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOuvert && (
        <ModalCabinet
          cabinet={cabinetEdition}
          onClose={() => setModalOuvert(false)}
          onSave={charger}
        />
      )}

      <ConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={confirmerSuppression}
        title="Supprimer le cabinet"
        message={`Supprimer "${aSupprimer?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  )
}