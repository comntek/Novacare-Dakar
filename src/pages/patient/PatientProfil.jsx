import { useState, useEffect } from 'react'
import {
  User, Save, Loader2, AlertCircle, CheckCircle,
  Phone, Mail, MapPin, Heart, Shield,
} from 'lucide-react'
import { getPatientById, updatePatient } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function PatientProfil() {
  const { user }     = useAuthStore()
  const [form,       setForm]      = useState(null)
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [succes,     setSucces]    = useState(false)
  const [erreur,     setErreur]    = useState(null)

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      try {
        const data = await getPatientById(user.uid)
        if (data) {
          setForm({
            prenom:        data.prenom        || '',
            nom:           data.nom           || '',
            telephone:     data.telephone     || '',
            email:         data.email         || '',
            adresse:       data.adresse       || '',
            sexe:          data.sexe          || '',
            groupeSanguin: data.groupeSanguin || '',
            dateNaissance: data.dateNaissance
              ? toDate(data.dateNaissance)?.toISOString().split('T')[0]
              : '',
          })
        }
      } catch (e) {
        setErreur('Impossible de charger votre profil.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSucces(false)
  }

  const handleSave = async () => {
    if (!user?.uid || !form) return
    setSauvegarde(true)
    setErreur(null)
    setSucces(false)
    try {
      await updatePatient(user.uid, {
        prenom:        form.prenom.trim(),
        nom:           form.nom.trim(),
        telephone:     form.telephone.trim(),
        email:         form.email.trim(),
        adresse:       form.adresse.trim(),
        sexe:          form.sexe,
        groupeSanguin: form.groupeSanguin,
        dateNaissance: form.dateNaissance ? new Date(form.dateNaissance) : null,
      })
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (e) {
      setErreur('Impossible de sauvegarder les modifications.')
    } finally {
      setSauvegarde(false)
    }
  }

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

  if (!form) {
    return (
      <div className="empty-state">
        <User className="w-14 h-14 mb-4 opacity-20" />
        <p className="font-medium">Profil non trouvé</p>
      </div>
    )
  }

  // Calcul âge
  const age = form.dateNaissance
    ? Math.floor((Date.now() - new Date(form.dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mon profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>
        <button onClick={handleSave} disabled={sauvegarde} className="btn-primary">
          {sauvegarde
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
            : <><Save className="w-4 h-4" /> Enregistrer</>
          }
        </button>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {succes && (
        <div className="alert-success">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <p>Profil mis à jour avec succès.</p>
        </div>
      )}

      {/* Avatar carte */}
      <div className="card bg-gradient-primary text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center
                          justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {form.prenom?.[0]}{form.nom?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-xl">
              {form.prenom} {form.nom}
            </p>
            <p className="text-primary-200 text-sm mt-0.5">Patient NovaCare Dakar</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              {age && (
                <span className="bg-white/20 text-white text-xs font-semibold
                                 px-2.5 py-1 rounded-full">
                  {age} ans
                </span>
              )}
              {form.sexe && (
                <span className="bg-white/20 text-white text-xs font-semibold
                                 px-2.5 py-1 rounded-full capitalize">
                  {form.sexe}
                </span>
              )}
              {form.groupeSanguin && (
                <span className="bg-accent text-white text-xs font-bold
                                 px-2.5 py-1 rounded-full">
                  🩸 {form.groupeSanguin}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="card space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Informations personnelles
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Prénom</label>
            <input className="form-input" value={form.prenom}
              onChange={(e) => update('prenom', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Nom</label>
            <input className="form-input" value={form.nom}
              onChange={(e) => update('nom', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="form-label">Date de naissance</label>
          <input type="date" className="form-input" value={form.dateNaissance}
            onChange={(e) => update('dateNaissance', e.target.value)} />
        </div>

        {/* Sexe */}
        <div>
          <label className="form-label">Sexe</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'masculin',  label: 'Homme'  },
              { val: 'feminin',   label: 'Femme'   },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => update('sexe', val)}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-250
                  ${form.sexe === val
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-neutral-border bg-white text-neutral-subtle hover:border-primary-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> Téléphone
          </label>
          <input className="form-input" value={form.telephone}
            onChange={(e) => update('telephone', e.target.value)}
            placeholder="+221 77 000 00 00" />
        </div>

        <div>
          <label className="form-label flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <input type="email" className="form-input" value={form.email}
            onChange={(e) => update('email', e.target.value)} />
        </div>

        <div>
          <label className="form-label flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Adresse
          </label>
          <input className="form-input" value={form.adresse}
            onChange={(e) => update('adresse', e.target.value)}
            placeholder="Quartier, Ville" />
        </div>
      </div>

      {/* Informations médicales */}
      <div className="card space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Heart className="w-4 h-4 text-danger" />
          Informations médicales
        </h2>

        {/* Groupe sanguin */}
        <div>
          <label className="form-label flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Groupe sanguin
          </label>
          <div className="grid grid-cols-4 gap-2">
            {GROUPES_SANGUINS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update('groupeSanguin', g)}
                className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-250
                  ${form.groupeSanguin === g
                    ? 'border-danger bg-danger-50 text-danger'
                    : 'border-neutral-border bg-white text-neutral-subtle hover:border-danger/30'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
          {form.groupeSanguin && (
            <p className="text-xs text-neutral-muted mt-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              Groupe sanguin sélectionné : <strong>{form.groupeSanguin}</strong>
            </p>
          )}
        </div>

        <div className="p-4 bg-info-50 border border-info-100 rounded-2xl">
          <p className="text-xs text-info font-semibold mb-1">
            ℹ️ Pourquoi renseigner ces informations ?
          </p>
          <p className="text-xs text-neutral-muted">
            Votre groupe sanguin et votre sexe permettent à nos médecins
            de vous fournir des soins adaptés et sécurisés en cas d'urgence.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={sauvegarde} className="btn-primary btn-lg">
          {sauvegarde
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Sauvegarde...</>
            : <><Save className="w-5 h-5" /> Enregistrer les modifications</>
          }
        </button>
      </div>
    </div>
  )
}

export default PatientProfil