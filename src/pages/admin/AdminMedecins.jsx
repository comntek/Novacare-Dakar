import { useState, useEffect } from 'react'
import {
  UserCheck, Search, X, AlertCircle,
  Loader2, Plus, Phone, Mail,
  ChevronRight, Star,
} from 'lucide-react'
import {
  getMedecins, updateUtilisateur,
} from '../../services/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

// ── Modal nouveau médecin ─────────────────────────────────
function ModalNouveauMedecin({ onClose, onSave }) {
  const [form, setForm] = useState({
    prenom:     '',
    nom:        '',
    email:      '',
    password:   '',
    specialite: '',
    telephone:  '',
    tarif:      '',
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.password || !form.specialite) {
      setErreur('Tous les champs obligatoires doivent être remplis.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      // Créer le compte Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      // Créer le document Firestore
      await setDoc(doc(db, 'utilisateurs', cred.user.uid), {
        uid:        cred.user.uid,
        prenom:     form.prenom.trim(),
        nom:        form.nom.trim(),
        email:      form.email.trim(),
        specialite: form.specialite.trim(),
        telephone:  form.telephone.trim(),
        tarif:      form.tarif ? parseInt(form.tarif) : 25000,
        role:       'medecin',
        actif:      true,
        dateCreation: serverTimestamp(),
      })
      onSave()
      onClose()
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setErreur('Cet email est déjà utilisé.')
      } else if (e.code === 'auth/weak-password') {
        setErreur('Le mot de passe doit contenir au moins 6 caractères.')
      } else {
        setErreur('Erreur lors de la création du compte.')
      }
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Nouveau médecin</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-4">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Prénom *</label>
              <input className="form-input" value={form.prenom}
                onChange={(e) => update('prenom', e.target.value)} placeholder="Moussa" />
            </div>
            <div>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.nom}
                onChange={(e) => update('nom', e.target.value)} placeholder="Koné" />
            </div>
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="medecin@novacare.sn" />
          </div>

          <div>
            <label className="form-label">Mot de passe *</label>
            <input type="password" className="form-input" value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Minimum 6 caractères" />
          </div>

          <div>
            <label className="form-label">Spécialité *</label>
            <input className="form-input" value={form.specialite}
              onChange={(e) => update('specialite', e.target.value)}
              placeholder="Cardiologie, Pédiatrie..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Téléphone</label>
              <input className="form-input" value={form.telephone}
                onChange={(e) => update('telephone', e.target.value)}
                placeholder="+221 77 000 00 00" />
            </div>
            <div>
              <label className="form-label">Tarif (FCFA)</label>
              <input type="number" className="form-input" value={form.tarif}
                onChange={(e) => update('tarif', e.target.value)}
                placeholder="25000" />
            </div>
          </div>
        </div>

        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary">
            {sauvegarde
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
              : <><Plus className="w-4 h-4" /> Créer le compte</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal détail médecin ──────────────────────────────────
function ModalDetailMedecin({ medecin, onClose, onUpdate }) {
  const [actif,      setActif]      = useState(medecin.actif)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const handleToggleActif = async () => {
    setSauvegarde(true)
    setErreur(null)
    try {
      await updateUtilisateur(medecin.id, { actif: !actif })
      setActif(!actif)
      onUpdate()
    } catch (e) {
      setErreur('Impossible de modifier le statut.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {medecin.prenom?.[0]}{medecin.nom?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-text">
                Dr. {medecin.prenom} {medecin.nom}
              </h2>
              <p className="text-xs text-neutral-muted">{medecin.specialite}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-4">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Spécialité', valeur: medecin.specialite || '—' },
              { label: 'Tarif',      valeur: medecin.tarif ? `${medecin.tarif.toLocaleString('fr-FR')} FCFA` : '—' },
            ].map(({ label, valeur }) => (
              <div key={label} className="bg-neutral-bg rounded-xl p-3">
                <p className="text-xs text-neutral-muted">{label}</p>
                <p className="text-sm font-semibold text-neutral-text mt-0.5">{valeur}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {medecin.telephone && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Phone className="w-4 h-4 text-neutral-muted" />
                {medecin.telephone}
              </div>
            )}
            {medecin.email && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Mail className="w-4 h-4 text-neutral-muted" />
                {medecin.email}
              </div>
            )}
          </div>

          {/* Toggle actif */}
          <div className="flex items-center justify-between p-4 bg-neutral-bg rounded-xl">
            <div>
              <p className="text-sm font-semibold text-neutral-text">Statut du compte</p>
              <p className="text-xs text-neutral-muted mt-0.5">
                {actif ? 'Ce médecin peut se connecter' : 'Compte désactivé'}
              </p>
            </div>
            <button
              onClick={handleToggleActif}
              disabled={sauvegarde}
              className={`
                w-12 h-6 rounded-full transition-all duration-250 relative
                ${actif ? 'bg-primary' : 'bg-neutral-border'}
                ${sauvegarde ? 'opacity-50' : ''}
              `}
            >
              <span className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-250
                ${actif ? 'left-6' : 'left-0.5'}
              `} />
            </button>
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
export function AdminMedecins() {
  const [medecins,      setMedecins]      = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)
  const [recherche,     setRecherche]     = useState('')
  const [modalNouveau,  setModalNouveau]  = useState(false)
  const [medecinSelec,  setMedecinSelec]  = useState(null)

  const charger = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const data = await getMedecins()
      setMedecins(data)
    } catch (e) {
      setErreur('Impossible de charger les médecins.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const medecinsFiltres = medecins.filter((m) => {
    const search = recherche.toLowerCase()
    return (
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search) ||
      m.specialite?.toLowerCase().includes(search) ||
      m.email?.toLowerCase().includes(search)
    )
  })

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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Médecins</h1>
          <p className="page-subtitle">
            {medecins.length} médecin{medecins.length > 1 ? 's' : ''} enregistré{medecins.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setModalNouveau(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouveau médecin
        </button>
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
          placeholder="Rechercher par nom, spécialité, email..."
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

      {medecinsFiltres.length === 0 ? (
        <div className="empty-state">
          <UserCheck className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">
            {recherche ? 'Aucun résultat' : 'Aucun médecin enregistré'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {medecinsFiltres.map((medecin) => (
            <div
              key={medecin.id}
              onClick={() => setMedecinSelec(medecin)}
              className="card-hover flex items-center gap-4"
            >
              <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {medecin.prenom?.[0]}{medecin.nom?.[0]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-neutral-text">
                    Dr. {medecin.prenom} {medecin.nom}
                  </p>
                  <span className={medecin.actif ? 'badge-success' : 'badge-danger'}>
                    {medecin.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="badge-primary text-2xs">{medecin.specialite || '—'}</span>
                  {medecin.telephone && (
                    <span className="text-xs text-neutral-muted flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {medecin.telephone}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="text-sm font-bold text-neutral-text">
                  {medecin.tarif?.toLocaleString('fr-FR') || '—'}
                </p>
                <p className="text-xs text-neutral-muted">FCFA / consultation</p>
              </div>

              <ChevronRight className="w-4 h-4 text-neutral-muted flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {modalNouveau && (
        <ModalNouveauMedecin
          onClose={() => setModalNouveau(false)}
          onSave={charger}
        />
      )}

      {medecinSelec && (
        <ModalDetailMedecin
          medecin={medecinSelec}
          onClose={() => setMedecinSelec(null)}
          onUpdate={charger}
        />
      )}
    </div>
  )
}

export default AdminMedecins