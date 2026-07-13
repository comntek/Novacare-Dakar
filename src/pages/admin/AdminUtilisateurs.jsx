import { useState, useEffect } from 'react'
import {
  Users, Search, X, AlertCircle, Plus,
  ChevronRight, Phone, Mail, Shield, Loader2, Save, CheckCircle,
} from 'lucide-react'
import { getUtilisateurs, updateUtilisateur } from '../../services/firestore'
import { supabase } from '../../services/supabase'

const ROLES_CONFIG = {
  admin:      { label: 'Administrateur', classe: 'badge-danger'  },
  medecin:    { label: 'Médecin',        classe: 'badge-primary' },
  secretaire: { label: 'Secrétaire',     classe: 'badge-info'    },
  patient:    { label: 'Patient',        classe: 'badge-neutral' },
}

// ── Modal nouveau compte staff (admin / secrétaire) ───────
// Les patients s'inscrivent eux-mêmes (/inscription) et les médecins se
// créent depuis Admin > Médecins > Nouveau médecin (spécialité, tarif...).
// Ce modal couvre le seul cas qui n'avait aucun chemin de création dans
// l'app : admin et secrétaire.
function ModalNouvelUtilisateur({ onClose, onSave }) {
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', password: '', telephone: '', role: 'secretaire',
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setErreur('Prénom, nom, email et mot de passe sont obligatoires.')
      return
    }
    if (form.password.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const { data, error } = await supabase.functions.invoke('create-utilisateur', {
        body: {
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim(),
          password: form.password,
          telephone: form.telephone.trim() || undefined,
          role: form.role,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      onSave()
      onClose()
    } catch (e) {
      setErreur(e.message || 'Erreur lors de la création du compte.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Nouvel utilisateur</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-4">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
            </div>
          )}

          <p className="text-xs text-neutral-muted -mt-1">
            Pour créer un médecin, utilisez Admin &gt; Médecins &gt; Nouveau médecin
            (champs spécialité/tarif dédiés). Les patients s'inscrivent eux-mêmes
            depuis le site public.
          </p>

          <div>
            <label className="form-label">Rôle *</label>
            <select className="form-input" value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="secretaire">Secrétaire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Prénom *</label>
              <input className="form-input" value={form.prenom}
                onChange={(e) => update('prenom', e.target.value)} placeholder="Aida" />
            </div>
            <div>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.nom}
                onChange={(e) => update('nom', e.target.value)} placeholder="Ndiaye" />
            </div>
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="aida.ndiaye@novacare.sn" />
          </div>

          <div>
            <label className="form-label">Mot de passe *</label>
            <input type="password" className="form-input" value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="6 caractères minimum" />
          </div>

          <div>
            <label className="form-label">Téléphone</label>
            <input className="form-input" value={form.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              placeholder="+221 77 000 00 00" />
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

function ModalDetailUtilisateur({ utilisateur, onClose, onUpdate }) {
  const [actif,      setActif]      = useState(utilisateur.actif !== false)
  const [role,        setRole]       = useState(utilisateur.role || 'patient')
  const [sauvegarde, setSauvegarde] = useState(false)
  const [succesRole, setSuccesRole] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const handleToggle = async () => {
    setSauvegarde(true)
    setErreur(null)
    try {
      await updateUtilisateur(utilisateur.id, { actif: !actif })
      setActif(!actif)
      onUpdate()
    } catch (e) {
      setErreur('Impossible de modifier le statut.')
    } finally {
      setSauvegarde(false)
    }
  }

  const handleSaveRole = async () => {
    setSauvegarde(true)
    setErreur(null)
    setSuccesRole(false)
    try {
      await updateUtilisateur(utilisateur.id, { role })
      setSuccesRole(true)
      onUpdate()
      setTimeout(() => setSuccesRole(false), 2000)
    } catch (e) {
      setErreur('Impossible de modifier le rôle.')
    } finally {
      setSauvegarde(false)
    }
  }

  const roleConfig = ROLES_CONFIG[utilisateur.role] || ROLES_CONFIG.patient
  const roleChange = role !== (utilisateur.role || 'patient')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-text">
                {utilisateur.role === 'medecin' ? 'Dr. ' : ''}
                {utilisateur.prenom} {utilisateur.nom}
              </h2>
              <span className={roleConfig.classe}>{roleConfig.label}</span>
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

          <div className="space-y-2">
            {utilisateur.email && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Mail className="w-4 h-4 text-neutral-muted" />
                {utilisateur.email}
              </div>
            )}
            {utilisateur.telephone && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Phone className="w-4 h-4 text-neutral-muted" />
                {utilisateur.telephone}
              </div>
            )}
            {utilisateur.specialite && (
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Shield className="w-4 h-4 text-neutral-muted" />
                {utilisateur.specialite}
              </div>
            )}
          </div>

          {/* Correction de rôle — utile pour les comptes créés hors app
              (ex: Supabase Dashboard) qui se retrouvent avec role='patient'
              par défaut faute de métadonnée. */}
          <div className="p-4 bg-neutral-bg rounded-xl space-y-3">
            <p className="text-sm font-semibold text-neutral-text">Rôle du compte</p>
            {succesRole && (
              <div className="alert-success">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p>Rôle mis à jour.</p>
              </div>
            )}
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="secretaire">Secrétaire</option>
              <option value="medecin">Médecin</option>
              <option value="admin">Administrateur</option>
            </select>
            {roleChange && (
              <button onClick={handleSaveRole} disabled={sauvegarde} className="btn-primary btn-sm w-full">
                {sauvegarde
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde...</>
                  : <><Save className="w-3.5 h-3.5" /> Enregistrer le rôle</>
                }
              </button>
            )}
          </div>

          {/* Toggle actif — pas pour les admins */}
          {utilisateur.role !== 'admin' && (
            <div className="flex items-center justify-between p-4 bg-neutral-bg rounded-xl">
              <div>
                <p className="text-sm font-semibold text-neutral-text">Statut du compte</p>
                <p className="text-xs text-neutral-muted mt-0.5">
                  {actif ? 'Compte actif' : 'Compte désactivé'}
                </p>
              </div>
              <button
                onClick={handleToggle}
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
          )}
        </div>

        <div className="modal-footer justify-end">
          <button onClick={onClose} className="btn-outline">Fermer</button>
        </div>
      </div>
    </div>
  )
}

export function AdminUtilisateurs() {
  const [utilisateurs,  setUtilisateurs]  = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)
  const [recherche,     setRecherche]     = useState('')
  const [filtreRole,    setFiltreRole]    = useState('tous')
  const [userSelec,     setUserSelec]     = useState(null)
  const [modalNouveau,  setModalNouveau]  = useState(false)

  const charger = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const data = await getUtilisateurs()
      setUtilisateurs(data)
    } catch (e) {
      setErreur('Impossible de charger les utilisateurs.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const utilisateursFiltres = utilisateurs.filter((u) => {
    const search = recherche.toLowerCase()
    const matchSearch =
      `${u.prenom} ${u.nom}`.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    const matchRole = filtreRole === 'tous' || u.role === filtreRole
    return matchSearch && matchRole
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
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} enregistré{utilisateurs.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setModalNouveau(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nouvel utilisateur
        </button>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
          <input
            className="form-input pl-10"
            placeholder="Rechercher par nom, email..."
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
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'tous',       label: 'Tous'           },
            { id: 'medecin',    label: 'Médecins'       },
            { id: 'secretaire', label: 'Secrétaires'    },
            { id: 'patient',    label: 'Patients'       },
            { id: 'admin',      label: 'Admins'         },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFiltreRole(id)}
              className={`
                px-3 py-2 rounded-xl text-sm font-medium transition-all duration-250
                ${filtreRole === id
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-white border border-neutral-border text-neutral-subtle hover:border-primary hover:text-primary'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {utilisateursFiltres.length === 0 ? (
        <div className="empty-state">
          <Users className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {utilisateursFiltres.map((u) => {
            const roleConfig = ROLES_CONFIG[u.role] || ROLES_CONFIG.patient
            return (
              <div
                key={u.id}
                onClick={() => setUserSelec(u)}
                className="card-hover flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {u.prenom?.[0]}{u.nom?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-text">
                      {u.role === 'medecin' ? 'Dr. ' : ''}{u.prenom} {u.nom}
                    </p>
                    <span className={roleConfig.classe}>{roleConfig.label}</span>
                    {u.actif === false && <span className="badge-danger">Inactif</span>}
                  </div>
                  <p className="text-xs text-neutral-muted mt-0.5">{u.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-muted flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {userSelec && (
        <ModalDetailUtilisateur
          utilisateur={userSelec}
          onClose={() => setUserSelec(null)}
          onUpdate={charger}
        />
      )}

      {modalNouveau && (
        <ModalNouvelUtilisateur
          onClose={() => setModalNouveau(false)}
          onSave={charger}
        />
      )}
    </div>
  )
}

export default AdminUtilisateurs
