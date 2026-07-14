import { useState, useEffect } from 'react'
import {
  User, Save, Loader2, AlertCircle, CheckCircle,
  Phone, Mail, MapPin, Heart, Shield, Clock,
  Plus, X, Cigarette, Wine, ClipboardList, Pill, Activity,
} from 'lucide-react'
import { getPatientById, proposerModificationsPatient } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function ListeEditable({ icone: Icone, titre, valeurs, onChange, placeholder }) {
  const [saisie, setSaisie] = useState('')

  const ajouter = () => {
    if (!saisie.trim()) return
    onChange([...valeurs, saisie.trim()])
    setSaisie('')
  }

  const supprimer = (i) => onChange(valeurs.filter((_, idx) => idx !== i))

  return (
    <div>
      <label className="form-label flex items-center gap-2">
        <Icone className="w-3.5 h-3.5" /> {titre}
      </label>
      {valeurs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {valeurs.map((v, i) => (
            <span key={i} className="badge-neutral flex items-center gap-1.5">
              {v}
              <button onClick={() => supprimer(i)} className="hover:text-danger">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="form-input flex-1"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter() } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={ajouter} className="btn-outline">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function PatientProfil() {
  const { user }     = useAuthStore()
  const [patient,    setPatient]    = useState(null)
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
          setPatient(data)
          // Si une proposition est en attente, on repart de celle-ci pour
          // que le patient puisse continuer à l'ajuster ; sinon on repart
          // du dossier officiel.
          const source = data.donneesEnAttente?.champs || data
          setForm({
            prenom:        source.prenom        || '',
            nom:           source.nom           || '',
            telephone:     source.telephone     || '',
            email:         source.email         || '',
            adresse:       source.adresse       || '',
            sexe:          source.sexe          || '',
            groupeSanguin: source.groupeSanguin || '',
            dateNaissance: source.dateNaissance
              ? toDate(source.dateNaissance)?.toISOString().split('T')[0]
              : '',
            allergies:            source.allergies            || [],
            antecedents:          source.antecedents           || [],
            maladiesChroniques:   source.maladiesChroniques    || [],
            traitementsHabituels: source.traitementsHabituels  || [],
            habitudesVie: {
              tabac:   source.habitudesVie?.tabac   || 'non',
              alcool:  source.habitudesVie?.alcool  || 'non',
              autres:  source.habitudesVie?.autres  || '',
            },
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

  const updateHabitude = (k, v) => {
    setForm((f) => ({ ...f, habitudesVie: { ...f.habitudesVie, [k]: v } }))
    setSucces(false)
  }

  const handleSave = async () => {
    if (!user?.uid || !form) return
    setSauvegarde(true)
    setErreur(null)
    setSucces(false)
    try {
      await proposerModificationsPatient(user.uid, {
        prenom:        form.prenom.trim(),
        nom:           form.nom.trim(),
        telephone:     form.telephone.trim(),
        email:         form.email.trim(),
        adresse:       form.adresse.trim(),
        sexe:          form.sexe,
        groupeSanguin: form.groupeSanguin,
        dateNaissance: form.dateNaissance ? new Date(form.dateNaissance) : null,
        allergies:            form.allergies,
        antecedents:          form.antecedents,
        maladiesChroniques:   form.maladiesChroniques,
        traitementsHabituels: form.traitementsHabituels,
        habitudesVie:         form.habitudesVie,
      })
      setPatient((p) => ({ ...p, statutDossier: 'en_attente_validation' }))
      setSucces(true)
      setTimeout(() => setSucces(false), 4000)
    } catch (e) {
      setErreur("Impossible d'envoyer vos modifications.")
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

  const age = form.dateNaissance
    ? Math.floor((Date.now() - new Date(form.dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const enAttente = patient?.statutDossier === 'en_attente_validation'

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mon profil</h1>
          <p className="page-subtitle">
            Vos informations et votre questionnaire santé — soumis à validation de votre médecin référent
          </p>
        </div>
        <button onClick={handleSave} disabled={sauvegarde} className="btn-primary">
          {sauvegarde
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
            : <><Save className="w-4 h-4" /> Envoyer pour validation</>
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
          <p>Vos modifications ont été envoyées à votre médecin référent pour validation.</p>
        </div>
      )}

      {enAttente && !succes && (
        <div className="alert-warning flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <p>
            Des modifications sont en attente de validation par votre médecin référent
            {patient?.medecinReferentNom ? ` (${patient.medecinReferentNom})` : ''}.
            Le dossier officiel n'est pas encore mis à jour.
          </p>
        </div>
      )}

      {!patient?.medecinReferentId && (
        <div className="alert-info flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>Aucun médecin référent ne vous est encore assigné — contactez la clinique pour la validation de vos informations.</p>
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

      {/* Groupe sanguin */}
      <div className="card space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Heart className="w-4 h-4 text-danger" />
          Groupe sanguin
        </h2>

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

      {/* Questionnaire santé */}
      <div className="card space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          Questionnaire santé
        </h2>

        <ListeEditable
          icone={Shield}
          titre="Allergies"
          valeurs={form.allergies}
          onChange={(v) => update('allergies', v)}
          placeholder="Ex: Pénicilline, arachides..."
        />

        <ListeEditable
          icone={Activity}
          titre="Antécédents médicaux et chirurgicaux"
          valeurs={form.antecedents}
          onChange={(v) => update('antecedents', v)}
          placeholder="Ex: Appendicectomie 2015..."
        />

        <ListeEditable
          icone={Heart}
          titre="Maladies chroniques déjà connues"
          valeurs={form.maladiesChroniques}
          onChange={(v) => update('maladiesChroniques', v)}
          placeholder="Ex: Diabète type 2, hypertension..."
        />

        <ListeEditable
          icone={Pill}
          titre="Traitements habituels"
          valeurs={form.traitementsHabituels}
          onChange={(v) => update('traitementsHabituels', v)}
          placeholder="Ex: Metformine 500mg/jour..."
        />

        <div>
          <label className="form-label">Habitudes de vie</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-neutral-muted mb-1.5 flex items-center gap-1.5">
                <Cigarette className="w-3.5 h-3.5" /> Tabac
              </p>
              <select
                className="form-input w-full"
                value={form.habitudesVie.tabac}
                onChange={(e) => updateHabitude('tabac', e.target.value)}
              >
                <option value="non">Non-fumeur</option>
                <option value="occasionnel">Occasionnel</option>
                <option value="quotidien">Quotidien</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-neutral-muted mb-1.5 flex items-center gap-1.5">
                <Wine className="w-3.5 h-3.5" /> Alcool
              </p>
              <select
                className="form-input w-full"
                value={form.habitudesVie.alcool}
                onChange={(e) => updateHabitude('alcool', e.target.value)}
              >
                <option value="non">Non</option>
                <option value="occasionnel">Occasionnel</option>
                <option value="regulier">Régulier</option>
              </select>
            </div>
          </div>
          <textarea
            className="form-input w-full"
            rows={2}
            value={form.habitudesVie.autres}
            onChange={(e) => updateHabitude('autres', e.target.value)}
            placeholder="Autres habitudes (activité physique, alimentation...)"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={sauvegarde} className="btn-primary btn-lg">
          {sauvegarde
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</>
            : <><Save className="w-5 h-5" /> Envoyer pour validation</>
          }
        </button>
      </div>
    </div>
  )
}

export default PatientProfil