import { useState, useEffect } from 'react'
import {
  FileText, AlertCircle, Stethoscope,
  User, Activity, Shield, Syringe, FlaskConical, Clock, CheckCircle2,
  FileSignature, Download, FileDown,
} from 'lucide-react'
import {
  getPatientById, getConsultationsByPatient, getExamensByPatient, getDocumentsByPatient,
} from '../../services/firestore'
import { useClinicStore } from '../../store/clinicStore'
import { genererDocumentPdf } from '../../utils/genererDocumentPdf'
import { genererDossierCompletPdf } from '../../utils/genererDossierCompletPdf'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function PatientDossier() {
  const { user }        = useAuthStore()
  const { data: clinique } = useClinicStore()
  const [patient,       setPatient]       = useState(null)
  const [consultations, setConsultations] = useState([])
  const [examens,       setExamens]       = useState([])
  const [documents,     setDocuments]     = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)
  const [onglet,        setOnglet]        = useState('infos')

  useEffect(() => {
    const charger = async () => {
      if (!user?.uid) return
      setChargement(true)
      setErreur(null)
      try {
        const [p, c, ex, docs] = await Promise.all([
          getPatientById(user.uid),
          getConsultationsByPatient(user.uid),
          getExamensByPatient(user.uid),
          getDocumentsByPatient(user.uid),
        ])
        setPatient(p)
        setConsultations(c)
        setExamens(ex)
        setDocuments(docs)
      } catch (e) {
        setErreur('Impossible de charger votre dossier.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [user])

  const age = patient?.dateNaissance
    ? Math.floor(
        (Date.now() - toDate(patient.dateNaissance).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
      )
    : null

  if (chargement) {
    return (
      <div className="page-loader">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-neutral-muted">Chargement de votre dossier...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="empty-state">
        <FileText className="w-14 h-14 mb-4 opacity-20" />
        <p className="font-medium">Dossier non trouvé</p>
        <p className="text-sm mt-1">Votre dossier médical n'est pas encore créé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mon dossier médical</h1>
          <p className="page-subtitle">{patient.numeroDossier}</p>
        </div>
        <button
          onClick={() => genererDossierCompletPdf({ patient, consultations, examens, documents, clinique })}
          className="btn-outline flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Télécharger le dossier complet
        </button>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {/* Carte identité */}
      <div className="card bg-gradient-primary text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">
              {patient.prenom?.[0]}{patient.nom?.[0]}
            </span>
          </div>
          <div>
            <p className="text-xl font-bold">{patient.prenom} {patient.nom}</p>
            <div className="flex gap-3 mt-1 text-primary-200 text-sm flex-wrap">
              {age && <span>{age} ans</span>}
              {patient.sexe && <span>· {patient.sexe}</span>}
              {patient.groupeSanguin && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold text-white">
                  {patient.groupeSanguin}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-neutral-border gap-1 overflow-x-auto scrollbar-hide">
        {[
          { id: 'infos',        label: 'Informations',  icon: User        },
          { id: 'antecedents',  label: 'Antécédents',   icon: Activity    },
          { id: 'consultations',label: 'Consultations', icon: Stethoscope },
          { id: 'examens',      label: 'Examens',       icon: FlaskConical },
          { id: 'documents',    label: 'Documents',     icon: FileSignature },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setOnglet(id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
              transition-all whitespace-nowrap
              ${onglet === id
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-muted hover:text-neutral-text'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Infos */}
      {onglet === 'infos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Téléphone',     valeur: patient.telephone || '—'      },
              { label: 'Email',         valeur: patient.email || '—'          },
              { label: 'Adresse',       valeur: patient.adresse || '—'        },
              { label: 'Assurance',     valeur: patient.assurance || 'Aucune' },
              { label: 'Médecin réf.', valeur: patient.medecinReferent || '—' },
            ].map(({ label, valeur }) => (
              <div key={label} className="card col-span-2 sm:col-span-1">
                <p className="text-xs text-neutral-muted">{label}</p>
                <p className="text-sm font-semibold text-neutral-text mt-0.5">{valeur}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Antécédents */}
      {onglet === 'antecedents' && (
        <div className="space-y-4">
          {patient.allergies?.length > 0 && (
            <div className="card">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-danger" />
                Allergies
              </h2>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <span key={a} className="badge-danger">{a}</span>
                ))}
              </div>
            </div>
          )}

          {patient.antecedents?.length > 0 && (
            <div className="card">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Antécédents médicaux
              </h2>
              <div className="space-y-2">
                {patient.antecedents.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-3 bg-neutral-bg rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm text-neutral-text">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {patient.vaccins?.length > 0 && (
            <div className="card">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Syringe className="w-4 h-4 text-info" />
                Vaccins
              </h2>
              <div className="space-y-2">
                {patient.vaccins.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl">
                    <p className="text-sm text-neutral-text">{v.nom}</p>
                    <p className="text-xs text-neutral-muted">
                      {v.date ? format(toDate(v.date), 'dd MMMM yyyy', { locale: fr }) : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!patient.allergies?.length && !patient.antecedents?.length && !patient.vaccins?.length && (
            <div className="empty-state">
              <Activity className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Aucun antécédent enregistré</p>
            </div>
          )}
        </div>
      )}

      {/* Consultations */}
      {onglet === 'consultations' && (
        <div className="space-y-3">
          {consultations.length === 0 ? (
            <div className="empty-state">
              <Stethoscope className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Aucune consultation enregistrée</p>
            </div>
          ) : (
            consultations.map((c) => (
              <div key={c.id} className="card space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-neutral-text">
                    {c.date
                      ? format(toDate(c.date), 'dd MMMM yyyy', { locale: fr })
                      : '—'
                    }
                  </p>
                  <span className="badge-success">Terminée</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-neutral-muted">Médecin</p>
                    <p className="text-sm text-neutral-text">{c.medecinNom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-muted">Diagnostic</p>
                    <p className="text-sm text-neutral-text">{c.diagnostic}</p>
                  </div>
                  {c.planTraitement && (
                    <div>
                      <p className="text-xs text-neutral-muted">Traitement</p>
                      <p className="text-sm text-neutral-text">{c.planTraitement}</p>
                    </div>
                  )}
                  {c.constantes && Object.values(c.constantes).some(Boolean) && (
                    <div>
                      <p className="text-xs text-neutral-muted mb-1">Constantes</p>
                      <div className="flex flex-wrap gap-2">
                        {c.constantes.poids && <span className="badge-neutral">Poids : {c.constantes.poids} kg</span>}
                        {c.constantes.taille && <span className="badge-neutral">Taille : {c.constantes.taille} cm</span>}
                        {c.constantes.tension && <span className="badge-neutral">Tension : {c.constantes.tension}</span>}
                        {c.constantes.temperature && <span className="badge-neutral">Temp. : {c.constantes.temperature} °C</span>}
                        {c.constantes.pouls && <span className="badge-neutral">Pouls : {c.constantes.pouls} bpm</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {onglet === 'examens' && (
        <div className="space-y-3">
          {examens.length === 0 ? (
            <div className="empty-state">
              <FlaskConical className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Aucun examen prescrit</p>
            </div>
          ) : (
            examens.map((ex) => (
              <div key={ex.id} className="card space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-neutral-text">{ex.designation}</p>
                    <p className="text-xs text-neutral-muted">
                      {ex.medecinNom} · {ex.datePrescription
                        ? format(toDate(ex.datePrescription), 'dd MMMM yyyy', { locale: fr })
                        : '—'}
                    </p>
                  </div>
                  {ex.statut === 'resultat_disponible' ? (
                    <span className="badge-success flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Résultat disponible
                    </span>
                  ) : (
                    <span className="badge-neutral flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> En attente
                    </span>
                  )}
                </div>
                {ex.resultat && (
                  <div>
                    <p className="text-xs text-neutral-muted">Résultat</p>
                    <p className="text-sm text-neutral-text whitespace-pre-line">{ex.resultat}</p>
                  </div>
                )}
                {ex.commentaireMedecin && (
                  <div>
                    <p className="text-xs text-neutral-muted">Commentaire du médecin</p>
                    <p className="text-sm text-neutral-text whitespace-pre-line">{ex.commentaireMedecin}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {onglet === 'documents' && (
        <div className="space-y-2">
          {documents.length === 0 ? (
            <div className="empty-state">
              <FileSignature className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Aucun document disponible</p>
            </div>
          ) : (
            documents.map((d) => (
              <div key={d.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-text">{d.titre}</p>
                  <p className="text-xs text-neutral-muted">
                    {d.medecinNom} · {d.dateCreation
                      ? format(toDate(d.dateCreation), 'dd MMMM yyyy', { locale: fr })
                      : '—'}
                  </p>
                </div>
                <button
                  onClick={() => genererDocumentPdf(d, clinique)}
                  className="btn-icon"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default PatientDossier