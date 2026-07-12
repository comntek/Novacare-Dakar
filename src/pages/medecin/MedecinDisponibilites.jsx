import { useState, useEffect } from 'react'
import {
  Clock, Save, Loader2, AlertCircle, CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { updateUtilisateur, getUtilisateurById } from '../../services/firestore'

const JOURS = [
  { id: 'lundi',    label: 'Lundi'    },
  { id: 'mardi',    label: 'Mardi'    },
  { id: 'mercredi', label: 'Mercredi' },
  { id: 'jeudi',    label: 'Jeudi'    },
  { id: 'vendredi', label: 'Vendredi' },
  { id: 'samedi',   label: 'Samedi'   },
  { id: 'dimanche', label: 'Dimanche' },
]

const HEURES = [
  '06:00','06:30','07:00','07:30','08:00','08:30',
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00',
]

const DISPONIBILITES_DEFAUT = {
  lundi:    { actif: true,  debut: '08:00', fin: '17:00', pauseDejeuner: true },
  mardi:    { actif: true,  debut: '08:00', fin: '17:00', pauseDejeuner: true },
  mercredi: { actif: true,  debut: '08:00', fin: '17:00', pauseDejeuner: true },
  jeudi:    { actif: true,  debut: '08:00', fin: '17:00', pauseDejeuner: true },
  vendredi: { actif: true,  debut: '08:00', fin: '17:00', pauseDejeuner: true },
  samedi:   { actif: false, debut: '09:00', fin: '13:00', pauseDejeuner: false },
  dimanche: { actif: false, debut: '09:00', fin: '13:00', pauseDejeuner: false },
}

export function MedecinDisponibilites() {
  const { user }          = useAuthStore()
  const [dispos,          setDispos]          = useState(DISPONIBILITES_DEFAUT)
  const [dureeConsult,    setDureeConsult]    = useState(30)
  const [chargement,      setChargement]      = useState(true)
  const [sauvegarde,      setSauvegarde]      = useState(false)
  const [succes,          setSucces]          = useState(false)
  const [erreur,          setErreur]          = useState(null)

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      try {
        const data = await getUtilisateurById(user.uid)
        const saved = data?.disponibilites || {}
        const { dureeConsultation, ...jours } = saved
        setDispos({ ...DISPONIBILITES_DEFAUT, ...jours })
        if (dureeConsultation) setDureeConsult(dureeConsultation)
      } catch (e) {
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const updateJour = (jour, champ, valeur) => {
    setDispos((prev) => ({
      ...prev,
      [jour]: { ...prev[jour], [champ]: valeur },
    }))
    setSucces(false)
  }

  const handleSave = async () => {
    if (!user?.uid) return
    setSauvegarde(true)
    setErreur(null)
    setSucces(false)
    try {
      await updateUtilisateur(user.uid, {
        disponibilites: { ...dispos, dureeConsultation: dureeConsult },
      })
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (e) {
      setErreur('Impossible de sauvegarder les disponibilités.')
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

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mes disponibilités</h1>
          <p className="page-subtitle">Définissez vos horaires de consultation</p>
        </div>
        <button
          onClick={handleSave}
          disabled={sauvegarde}
          className="btn-primary"
        >
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
          <p>Disponibilités enregistrées avec succès.</p>
        </div>
      )}

      {/* Durée consultation */}
      <div className="card">
        <h2 className="section-title mb-4">Durée d'une consultation</h2>
        <div className="flex gap-3 flex-wrap">
          {[15, 20, 30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDureeConsult(d)}
              className={`
                px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-250
                ${dureeConsult === d
                  ? 'bg-primary text-white border-primary shadow-btn'
                  : 'bg-white text-neutral-subtle border-neutral-border hover:border-primary hover:text-primary'
                }
              `}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Horaires par jour */}
      <div className="card space-y-4">
        <h2 className="section-title">Horaires hebdomadaires</h2>

        <div className="space-y-3">
          {JOURS.map(({ id, label }) => {
            const jour = dispos[id] || DISPONIBILITES_DEFAUT[id]
            return (
              <div
                key={id}
                className={`
                  p-4 rounded-xl border transition-all duration-250
                  ${jour.actif
                    ? 'bg-white border-neutral-border'
                    : 'bg-neutral-bg border-neutral-border/50 opacity-60'
                  }
                `}
              >
                <div className="flex items-center gap-4 flex-wrap">

                  {/* Toggle actif */}
                  <div className="flex items-center gap-3 w-32 flex-shrink-0">
                    <button
                      onClick={() => updateJour(id, 'actif', !jour.actif)}
                      className={`
                        w-10 h-5 rounded-full transition-all duration-250 relative flex-shrink-0
                        ${jour.actif ? 'bg-primary' : 'bg-neutral-border'}
                      `}
                    >
                      <span className={`
                        absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-250
                        ${jour.actif ? 'left-5' : 'left-0.5'}
                      `} />
                    </button>
                    <span className={`text-sm font-semibold ${jour.actif ? 'text-neutral-text' : 'text-neutral-muted'}`}>
                      {label}
                    </span>
                  </div>

                  {/* Horaires */}
                  {jour.actif && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-muted flex-shrink-0" />
                        <select
                          className="form-input py-1.5 text-sm w-24"
                          value={jour.debut}
                          onChange={(e) => updateJour(id, 'debut', e.target.value)}
                        >
                          {HEURES.map((h) => (
                            <option key={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-neutral-muted text-sm">→</span>
                        <select
                          className="form-input py-1.5 text-sm w-24"
                          value={jour.fin}
                          onChange={(e) => updateJour(id, 'fin', e.target.value)}
                        >
                          {HEURES.map((h) => (
                            <option key={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      {/* Pause déjeuner */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jour.pauseDejeuner}
                          onChange={(e) => updateJour(id, 'pauseDejeuner', e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-neutral-subtle">Pause déjeuner 12h-14h</span>
                      </label>
                    </>
                  )}

                  {!jour.actif && (
                    <span className="text-sm text-neutral-muted">Repos</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bouton sauvegarder en bas */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={sauvegarde}
          className="btn-primary btn-lg"
        >
          {sauvegarde
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Sauvegarde en cours...</>
            : <><Save className="w-5 h-5" /> Enregistrer les disponibilités</>
          }
        </button>
      </div>

    </div>
  )
}

export default MedecinDisponibilites