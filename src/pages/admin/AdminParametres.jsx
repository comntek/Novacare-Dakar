import { useState, useEffect } from 'react'
import {
  Building, Bell, Shield, CreditCard,
  Save, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react'
import { getUtilisateurById, updateUtilisateur } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'

const TABS = [
  { id: 'general',       label: 'Général',        icon: Building  },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'securite',      label: 'Sécurité',       icon: Shield    },
  { id: 'facturation',   label: 'Facturation',    icon: CreditCard},
]

const CLINIQUE_DEFAUT = {
  nomClinique:  'NovaCare Dakar',
  adresse:      'Route de la Corniche, Plateau, Dakar',
  telephone:    '+221 33 800 12 34',
  email:        'contact@novacare.sn',
  siteWeb:      'www.novacare.sn',
}

export function AdminParametres() {
  const { user }       = useAuthStore()
  const [onglet,       setOnglet]       = useState('general')
  const [form,         setForm]         = useState(CLINIQUE_DEFAUT)
  const [sauvegarde,   setSauvegarde]   = useState(false)
  const [succes,       setSucces]       = useState(false)
  const [erreur,       setErreur]       = useState(null)

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSucces(false)
  }

  const handleSave = async () => {
    setSauvegarde(true)
    setErreur(null)
    setSucces(false)
    try {
      // Simuler une sauvegarde — à connecter à Firestore collection 'clinique'
      await new Promise((r) => setTimeout(r, 800))
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (e) {
      setErreur('Impossible de sauvegarder les paramètres.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Configuration de NovaCare Dakar</p>
      </div>

      <div className="flex gap-6 flex-col sm:flex-row">

        {/* Sidebar onglets */}
        <div className="sm:w-48 flex-shrink-0 flex sm:flex-col gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className={`${onglet === id ? 'sidebar-link-active' : 'sidebar-link'} flex-shrink-0`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 card space-y-5">

          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          {succes && (
            <div className="alert-success">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p>Paramètres enregistrés avec succès.</p>
            </div>
          )}

          {onglet === 'general' && (
            <>
              <h2 className="section-title">Informations de la clinique</h2>
              {[
                { label: 'Nom de la clinique', key: 'nomClinique' },
                { label: 'Adresse',            key: 'adresse'     },
                { label: 'Téléphone',          key: 'telephone'   },
                { label: 'Email',              key: 'email'       },
                { label: 'Site web',           key: 'siteWeb'     },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </div>
              ))}
            </>
          )}

          {onglet === 'notifications' && (
            <>
              <h2 className="section-title">Préférences de notifications</h2>
              {[
                { label: 'Nouveaux rendez-vous', desc: 'Recevoir une alerte pour chaque nouveau RDV' },
                { label: 'Annulations',           desc: 'Recevoir une alerte en cas d\'annulation'    },
                { label: 'Factures impayées',     desc: 'Rappel quotidien des factures en attente'    },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-neutral-text">{label}</p>
                    <p className="text-xs text-neutral-muted">{desc}</p>
                  </div>
                  <div className="w-10 h-5 bg-primary rounded-full relative flex-shrink-0">
                    <span className="absolute top-0.5 left-5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              ))}
            </>
          )}

          {onglet === 'securite' && (
            <>
              <h2 className="section-title">Sécurité</h2>
              <div className="space-y-3">
                {[
                  { label: 'Authentification à deux facteurs', desc: 'Ajouter une couche de sécurité supplémentaire', actif: false },
                  { label: 'Déconnexion automatique',          desc: 'Déconnecter après 30 minutes d\'inactivité',   actif: true  },
                ].map(({ label, desc, actif }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-neutral-text">{label}</p>
                      <p className="text-xs text-neutral-muted">{desc}</p>
                    </div>
                    <div className={`w-10 h-5 ${actif ? 'bg-primary' : 'bg-neutral-border'} rounded-full relative flex-shrink-0`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow ${actif ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {onglet === 'facturation' && (
            <>
              <h2 className="section-title">Paramètres de facturation</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Devise</label>
                  <select className="form-input">
                    <option>FCFA (XOF)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Modes de paiement acceptés</label>
                  <div className="space-y-2 mt-2">
                    {['Wave', 'Orange Money', 'Espèces', 'Chèque', 'Carte bancaire'].map((m) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                        <span className="text-sm text-neutral-text">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-neutral-border">
            <button onClick={handleSave} disabled={sauvegarde} className="btn-primary">
              {sauvegarde
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                : <><Save className="w-4 h-4" /> Enregistrer</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminParametres