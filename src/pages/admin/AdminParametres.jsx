import { useState, useEffect } from 'react'
import {
  Building, Clock, Palette, Share2, Shield, CreditCard,
  Save, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react'
import { updateClinique } from '../../services/firestore'
import { useClinicStore } from '../../store/clinicStore'

const TABS = [
  { id: 'general',     label: 'Général',          icon: Building },
  { id: 'horaires',    label: 'Horaires',          icon: Clock    },
  { id: 'apparence',   label: 'Apparence',         icon: Palette  },
  { id: 'reseaux',     label: 'Réseaux sociaux',   icon: Share2   },
  { id: 'securite',    label: 'Sécurité',          icon: Shield   },
  { id: 'facturation', label: 'Facturation',       icon: CreditCard },
]

const JOURS = [
  { key: 'lundi',    label: 'Lundi'    },
  { key: 'mardi',    label: 'Mardi'    },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi',    label: 'Jeudi'    },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi',   label: 'Samedi'   },
  { key: 'dimanche', label: 'Dimanche' },
]

const JOUR_DEFAUT = { actif: false, debut: '08:00', fin: '18:00' }

export function AdminParametres() {
  const clinique     = useClinicStore((s) => s.data)
  const cliniqueChargee = useClinicStore((s) => s.loaded)
  const rechargerClinique = useClinicStore((s) => s.load)

  const [onglet,     setOnglet]     = useState('general')
  const [form,       setForm]       = useState(clinique)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [succes,     setSucces]     = useState(false)
  const [erreur,     setErreur]     = useState(null)

  // Une fois les données réelles chargées depuis Supabase, on les copie
  // dans le formulaire local (évite d'écraser la saisie en cours si le
  // store se recharge pendant que l'admin tape).
  useEffect(() => {
    if (cliniqueChargee) setForm(clinique)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliniqueChargee])

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSucces(false)
  }

  const updateHoraire = (jour, champ, valeur) => {
    setForm((f) => ({
      ...f,
      horaires: {
        ...f.horaires,
        [jour]: { ...(f.horaires?.[jour] || JOUR_DEFAUT), [champ]: valeur },
      },
    }))
    setSucces(false)
  }

  const handleSave = async () => {
    setSauvegarde(true)
    setErreur(null)
    setSucces(false)
    try {
      await updateClinique(form)
      await rechargerClinique() // propage immédiatement au header/footer publics
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (e) {
      console.error(e)
      setErreur("Impossible de sauvegarder les paramètres. Vérifiez votre connexion.")
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Configuration de {clinique.nomClinique || 'la clinique'}</p>
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
              <p>Paramètres enregistrés — visibles immédiatement sur le site public.</p>
            </div>
          )}

          {!cliniqueChargee && (
            <div className="flex items-center gap-2 text-sm text-neutral-muted">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement des paramètres...
            </div>
          )}

          {onglet === 'general' && (
            <>
              <h2 className="section-title">Informations de la clinique</h2>
              {[
                { label: 'Nom de la clinique', key: 'nomClinique' },
                { label: 'Slogan',              key: 'slogan'     },
                { label: 'Adresse',             key: 'adresse'    },
                { label: 'Téléphone',           key: 'telephone'  },
                { label: 'Téléphone secondaire',key: 'telephone2' },
                { label: 'Email',               key: 'email'      },
                { label: 'Site web',            key: 'siteWeb'    },
                { label: 'NINEA',               key: 'ninea'      },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    value={form[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </div>
              ))}
            </>
          )}

          {onglet === 'horaires' && (
            <>
              <h2 className="section-title">Horaires d'ouverture</h2>
              <p className="text-xs text-neutral-muted -mt-3">
                Affichés sur la page Contact et le pied de page du site public.
              </p>
              <div className="space-y-2">
                {JOURS.map(({ key, label }) => {
                  const j = form.horaires?.[key] || JOUR_DEFAUT
                  return (
                    <div key={key} className="flex items-center gap-3 p-3 bg-neutral-bg rounded-xl flex-wrap">
                      <button
                        type="button"
                        onClick={() => updateHoraire(key, 'actif', !j.actif)}
                        className={`w-10 h-5 ${j.actif ? 'bg-primary' : 'bg-neutral-border'} rounded-full relative flex-shrink-0`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${j.actif ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <p className="text-sm font-semibold text-neutral-text w-24">{label}</p>
                      {j.actif ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            className="form-input py-1.5 text-sm w-28"
                            value={j.debut}
                            onChange={(e) => updateHoraire(key, 'debut', e.target.value)}
                          />
                          <span className="text-neutral-muted text-sm">—</span>
                          <input
                            type="time"
                            className="form-input py-1.5 text-sm w-28"
                            value={j.fin}
                            onChange={(e) => updateHoraire(key, 'fin', e.target.value)}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-muted italic">Fermé</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {onglet === 'apparence' && (
            <>
              <h2 className="section-title">Apparence</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Couleur primaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-11 h-11 rounded-lg border border-neutral-border cursor-pointer flex-shrink-0"
                      value={form.couleurPrimaire || '#0A5C3E'}
                      onChange={(e) => update('couleurPrimaire', e.target.value)}
                    />
                    <input
                      className="form-input"
                      value={form.couleurPrimaire || ''}
                      onChange={(e) => update('couleurPrimaire', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Couleur secondaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-11 h-11 rounded-lg border border-neutral-border cursor-pointer flex-shrink-0"
                      value={form.couleurSecondaire || '#C9922A'}
                      onChange={(e) => update('couleurSecondaire', e.target.value)}
                    />
                    <input
                      className="form-input"
                      value={form.couleurSecondaire || ''}
                      onChange={(e) => update('couleurSecondaire', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">URL du logo</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={form.logoUrl || ''}
                  onChange={(e) => update('logoUrl', e.target.value)}
                />
                <p className="text-xs text-neutral-muted mt-1">
                  Le logo texte (icône + nom) reste utilisé tant qu'aucune URL n'est renseignée.
                </p>
              </div>
            </>
          )}

          {onglet === 'reseaux' && (
            <>
              <h2 className="section-title">Réseaux sociaux</h2>
              {[
                { label: 'Facebook',  key: 'facebook',  placeholder: 'https://facebook.com/...' },
                { label: 'Instagram', key: 'instagram', placeholder: 'https://instagram.com/...' },
                { label: 'WhatsApp',  key: 'whatsapp',  placeholder: '+221 77 000 00 00' },
                { label: 'LinkedIn',  key: 'linkedin',  placeholder: 'https://linkedin.com/...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    placeholder={placeholder}
                    value={form[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </div>
              ))}
              <p className="text-xs text-neutral-muted">
                Laisser vide pour masquer l'icône correspondante dans le pied de page public.
              </p>
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
                <p className="text-xs text-neutral-muted italic">
                  Ces options ne sont pas encore connectées à la base de données (hors périmètre de cette révision).
                </p>
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
                <p className="text-xs text-neutral-muted italic">
                  Ces options ne sont pas encore connectées à la base de données (hors périmètre de cette révision).
                </p>
              </div>
            </>
          )}

          {['general', 'horaires', 'apparence', 'reseaux'].includes(onglet) && (
            <div className="pt-2 border-t border-neutral-border">
              <button onClick={handleSave} disabled={sauvegarde} className="btn-primary">
                {sauvegarde
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                  : <><Save className="w-4 h-4" /> Enregistrer</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminParametres