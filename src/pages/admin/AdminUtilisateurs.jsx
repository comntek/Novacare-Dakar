import { useState, useEffect } from 'react'
import {
  Users, Search, X, AlertCircle,
  ChevronRight, Phone, Mail, Shield,
} from 'lucide-react'
import { getUtilisateurs, updateUtilisateur } from '../../services/firestore'

const ROLES_CONFIG = {
  admin:      { label: 'Administrateur', classe: 'badge-danger'  },
  medecin:    { label: 'Médecin',        classe: 'badge-primary' },
  secretaire: { label: 'Secrétaire',     classe: 'badge-info'    },
  patient:    { label: 'Patient',        classe: 'badge-neutral' },
}

function ModalDetailUtilisateur({ utilisateur, onClose, onUpdate }) {
  const [actif,      setActif]      = useState(utilisateur.actif !== false)
  const [sauvegarde, setSauvegarde] = useState(false)
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

  const roleConfig = ROLES_CONFIG[utilisateur.role] || ROLES_CONFIG.patient

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

      <div>
        <h1 className="page-title">Utilisateurs</h1>
        <p className="page-subtitle">
          {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} enregistré{utilisateurs.length > 1 ? 's' : ''}
        </p>
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
    </div>
  )
}

export default AdminUtilisateurs