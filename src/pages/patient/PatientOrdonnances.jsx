import { useState, useEffect } from 'react'
import {
  ClipboardList, AlertCircle, Loader2,
  Calendar, Pill,
} from 'lucide-react'
import { getConsultationsByPatient } from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function PatientOrdonnances() {
  const { user }        = useAuthStore()
  const [consultations, setConsultations] = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const data = await getConsultationsByPatient(user.uid)
        setConsultations(data.filter((c) => c.ordonnances?.length > 0))
      } catch (e) {
        setErreur('Impossible de charger vos ordonnances.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

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
        <h1 className="page-title">Mes ordonnances</h1>
        <p className="page-subtitle">
          {consultations.length} ordonnance{consultations.length > 1 ? 's' : ''}
        </p>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {consultations.length === 0 ? (
        <div className="empty-state">
          <ClipboardList className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucune ordonnance</p>
          <p className="text-sm mt-1">Vos ordonnances apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <div key={c.id} className="card space-y-4">

              {/* Header ordonnance */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-border">
                <div>
                  <p className="font-bold text-neutral-text">
                    Ordonnance du{' '}
                    {c.date
                      ? format(toDate(c.date), 'dd MMMM yyyy', { locale: fr })
                      : '—'
                    }
                  </p>
                  <p className="text-sm text-neutral-muted mt-0.5">{c.medecinNom}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-muted">Diagnostic</p>
                  <p className="text-sm font-medium text-neutral-text">{c.diagnostic}</p>
                </div>
              </div>

              {/* Médicaments */}
              <div className="space-y-2">
                {c.ordonnances.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-primary-50 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pill className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-text">{o.medicament}</p>
                      <p className="text-sm text-neutral-muted mt-0.5">
                        {o.posologie}
                        {o.duree ? ` · ${o.duree}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientOrdonnances