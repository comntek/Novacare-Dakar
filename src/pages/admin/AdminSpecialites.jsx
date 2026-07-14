import { useState, useEffect } from 'react'
import { Stethoscope, Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react'
import {
  getSpecialites, createSpecialite, updateSpecialite, deleteSpecialite,
} from '../../services/firestore'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { PageLoader } from '../../components/shared/LoadingSpinner'

function ModalSpecialite({ specialite, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: specialite?.nom || '',
    description: specialite?.description || '',
    ordre: specialite?.ordre ?? 0,
    actif: specialite?.actif ?? true,
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
      if (specialite) {
        await updateSpecialite(specialite.id, form)
      } else {
        await createSpecialite(form)
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
            {specialite ? 'Modifier la spécialité' : 'Nouvelle spécialité'}
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
              placeholder="Ex: Cardiologie"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-text mb-1 block">Description</label>
            <textarea
              className="form-input w-full"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-text mb-1 block">Ordre d'affichage</label>
            <input
              type="number"
              className="form-input w-full"
              value={form.ordre}
              onChange={(e) => update('ordre', Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-text">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={(e) => update('actif', e.target.checked)}
            />
            Spécialité active
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

export default function AdminSpecialites() {
  const [specialites, setSpecialites] = useState([])
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [specialiteEdition, setSpecialiteEdition] = useState(null)
  const [aSupprimer, setASupprimer] = useState(null)

  const charger = async () => {
    setChargement(true)
    try {
      setSpecialites(await getSpecialites())
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const confirmerSuppression = async () => {
    await deleteSpecialite(aSupprimer.id)
    setASupprimer(null)
    charger()
  }

  if (chargement) return <PageLoader text="Chargement des spécialités..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Spécialités</h1>
        <button
          onClick={() => { setSpecialiteEdition(null); setModalOuvert(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouvelle spécialité
        </button>
      </div>

      {specialites.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Aucune spécialité"
          description="Ajoutez la première spécialité de la clinique."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-subtle border-b border-neutral-border">
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Ordre</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {specialites.map((s) => (
                <tr key={s.id} className="border-b border-neutral-border last:border-0">
                  <td className="py-3 px-4 font-medium text-neutral-text">{s.nom}</td>
                  <td className="py-3 px-4 text-neutral-subtle">{s.description}</td>
                  <td className="py-3 px-4">{s.ordre}</td>
                  <td className="py-3 px-4">
                    <span className={s.actif ? 'badge-success' : 'badge-neutral'}>
                      {s.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setSpecialiteEdition(s); setModalOuvert(true) }}
                        className="btn-icon"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setASupprimer(s)} className="btn-icon text-red-600">
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
        <ModalSpecialite
          specialite={specialiteEdition}
          onClose={() => setModalOuvert(false)}
          onSave={charger}
        />
      )}

      <ConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={confirmerSuppression}
        title="Supprimer la spécialité"
        message={`Supprimer "${aSupprimer?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  )
}