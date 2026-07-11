import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stethoscope, Calendar, Clock, User,
  Phone, Mail, ArrowLeft, CheckCircle,
  AlertCircle, Video, Menu, X, ChevronDown, MapPin,
} from 'lucide-react'
import { getMedecins, createRdv } from '../../services/firestore'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

const HORAIRES = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','14:00','14:30','15:00',
  '15:30','16:00','16:30','17:00','17:30','18:00',
]

const MOTIFS = [
  'Consultation générale',
  'Suivi médical',
  'Bilan de santé',
  'Renouvellement ordonnance',
  'Avis spécialisé',
  'Autre',
]

export default function PriseRdvPage() {
  const navigate   = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [etape,    setEtape]    = useState(1) // 1=infos perso, 2=RDV, 3=confirmation
  const [medecins, setMedecins] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [succes,   setSucces]   = useState(false)
  const [erreur,   setErreur]   = useState(null)

  const [form, setForm] = useState({
    // Infos visiteur
    prenom:    '',
    nom:       '',
    telephone: '',
    email:     '',
    // RDV
    medecinId:   '',
    medecinNom:  '',
    date:        '',
    heure:       '',
    motif:       '',
    type:        'presentiel',
    notes:       '',
  })

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await getMedecins()
        setMedecins(data)
      } catch (e) {
        setMedecins([])
      }
    }
    charger()
  }, [])

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErreur(null)
  }

  const validerEtape1 = () => {
    if (!form.prenom || !form.nom)   return 'Prénom et nom obligatoires.'
    if (!form.telephone && !form.email) return 'Téléphone ou email obligatoire.'
    return null
  }

  const validerEtape2 = () => {
    if (!form.medecinId) return 'Veuillez choisir un médecin.'
    if (!form.date)      return 'Veuillez choisir une date.'
    if (!form.heure)     return 'Veuillez choisir un horaire.'
    if (!form.motif)     return 'Veuillez indiquer le motif.'
    return null
  }

  const handleEtape1 = () => {
    const err = validerEtape1()
    if (err) { setErreur(err); return }
    setEtape(2)
  }

  const handleSubmit = async () => {
    const err = validerEtape2()
    if (err) { setErreur(err); return }
    setLoading(true)
    setErreur(null)
    try {
      await createRdv({
        // Visiteur non inscrit
        patientId:           null,
        patientNom:          `${form.prenom} ${form.nom}`,
        patientPrenom:       form.prenom,
        patientNomFamille:   form.nom,
        patientTelephone:    form.telephone,
        patientEmail:        form.email,
        patientNonInscrit:   true,
        // RDV
        medecinId:           form.medecinId,
        medecinNom:          form.medecinNom,
        date:                new Date(form.date),
        heure:               form.heure,
        motif:               form.motif,
        type:                form.type,
        notes:               form.notes,
        statut:              'en_attente',
        source:              'site_web', 
      })
      setSucces(true)
      setEtape(3)
    } catch (e) {
      setErreur('Erreur lors de l\'envoi. Veuillez réessayer ou nous appeler.')
    } finally {
      setLoading(false)
    }
  }

  // Dates disponibles — 30 prochains jours
  const datesDisponibles = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), i + 1)
    // Exclure dimanches
    if (d.getDay() === 0) return null
    return d
  }).filter(Boolean)

  return (
    <div className="min-h-screen bg-neutral-bg font-sans">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="bg-white border-b border-neutral-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-btn">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-neutral-text text-base leading-none">NovaCare</p>
              <p className="text-xs text-primary font-semibold leading-none mt-0.5">Dakar</p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Accueil',  to: '/'         },
              { label: 'Services', to: '/services' },
              { label: 'Blog',     to: '/blog'     },
              { label: 'Urgences', to: '/urgences' },
              { label: 'Contact',  to: '/contact'  },
            ].map(({ label, to }) => (
              <button key={to} onClick={() => navigate(to)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-subtle
                           hover:text-primary hover:bg-primary-50 transition-all duration-250">
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/connexion')}
              className="hidden sm:flex btn-outline btn-sm">Connexion</button>
            <button onClick={() => navigate('/inscription')}
              className="btn-primary btn-sm">Inscription</button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-icon">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="bg-gradient-primary text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <button onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white
                       mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-4xl font-black mb-3">Prendre rendez-vous</h1>
          <p className="text-primary-200 text-lg">
            Sans créer de compte · Réponse sous 2h · Paiement le jour J
          </p>

          {/* Étapes */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {[
              { num: 1, label: 'Vos infos'     },
              { num: 2, label: 'Le rendez-vous' },
              { num: 3, label: 'Confirmation'   },
            ].map(({ num, label }, i) => (
              <div key={num} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                   font-bold text-sm transition-all
                    ${etape > num
                      ? 'bg-success text-white'
                      : etape === num
                      ? 'bg-white text-primary'
                      : 'bg-white/20 text-white/50'
                    }`}>
                    {etape > num ? <CheckCircle className="w-5 h-5" /> : num}
                  </div>
                  <span className={`text-xs transition-all
                    ${etape === num ? 'text-white font-semibold' : 'text-primary-200'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`h-px w-12 mb-4 transition-all
                    ${etape > num ? 'bg-success' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formulaire ──────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {erreur && (
            <div className="alert-error mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          {/* ── ÉTAPE 1 — Infos personnelles ── */}
          {etape === 1 && (
            <div className="card space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-neutral-text">Vos informations</h2>
                <p className="text-sm text-neutral-muted mt-1">
                  Ces informations permettront à notre équipe de vous contacter.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                    <input className="form-input pl-10" placeholder="Moussa"
                      value={form.prenom} onChange={(e) => update('prenom', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Nom *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                    <input className="form-input pl-10" placeholder="Diallo"
                      value={form.nom} onChange={(e) => update('nom', e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                  <input className="form-input pl-10" placeholder="+221 77 000 00 00"
                    value={form.telephone} onChange={(e) => update('telephone', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                  <input type="email" className="form-input pl-10" placeholder="votre@email.com"
                    value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
              </div>

              {/* Info compte */}
              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                <p className="text-sm text-primary font-semibold mb-1">
                  💡 Vous avez déjà un compte ?
                </p>
                <p className="text-xs text-neutral-muted">
                  Connectez-vous pour un suivi complet de vos RDV, dossier médical et ordonnances.
                </p>
                <button onClick={() => navigate('/connexion')}
                  className="btn-primary btn-sm mt-3">
                  Se connecter
                </button>
              </div>

              <button onClick={handleEtape1} className="btn-primary btn-lg w-full">
                Continuer
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </button>
            </div>
          )}

          {/* ── ÉTAPE 2 — Choix RDV ── */}
          {etape === 2 && (
            <div className="card space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <button onClick={() => setEtape(1)}
                  className="btn-icon w-8 h-8">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-neutral-text">Votre rendez-vous</h2>
                  <p className="text-sm text-neutral-muted">Pour {form.prenom} {form.nom}</p>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="form-label">Type de consultation</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'presentiel',     label: '🏥 Présentiel',      desc: 'À la clinique'          },
                    { val: 'teleconsultation',label: '📹 Téléconsultation', desc: 'Depuis chez vous'      },
                  ].map(({ val, label, desc }) => (
                    <button key={val}
                      onClick={() => update('type', val)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all
                        ${form.type === val
                          ? 'border-primary bg-primary-50'
                          : 'border-neutral-border hover:border-primary-200'
                        }`}>
                      <p className="font-semibold text-sm text-neutral-text">{label}</p>
                      <p className="text-xs text-neutral-muted mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Médecin */}
              <div>
                <label className="form-label">Médecin</label>
                <select
                  className="form-input"
                  value={form.medecinId}
                  onChange={(e) => {
                    const m = medecins.find((m) => m.id === e.target.value)
                    update('medecinId', e.target.value)
                    update('medecinNom', m ? `Dr. ${m.prenom} ${m.nom}` : '')
                  }}
                >
                  <option value="">Choisir un médecin...</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.prenom} {m.nom} — {m.specialite || 'Généraliste'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motif */}
              <div>
                <label className="form-label">Motif de consultation *</label>
                <select className="form-input" value={form.motif}
                  onChange={(e) => update('motif', e.target.value)}>
                  <option value="">Sélectionner un motif...</option>
                  {MOTIFS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="form-label">Date souhaitée *</label>
                <select className="form-input" value={form.date}
                  onChange={(e) => update('date', e.target.value)}>
                  <option value="">Choisir une date...</option>
                  {datesDisponibles.map((d) => (
                    <option key={d.toISOString()} value={format(d, 'yyyy-MM-dd')}>
                      {format(d, 'EEEE dd MMMM yyyy', { locale: fr })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Heure */}
              <div>
                <label className="form-label">Horaire souhaité *</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {HORAIRES.map((h) => (
                    <button key={h}
                      onClick={() => update('heure', h)}
                      className={`py-2 rounded-xl text-sm font-medium border transition-all
                        ${form.heure === h
                          ? 'bg-primary text-white border-primary shadow-btn'
                          : 'bg-white text-neutral-text border-neutral-border hover:border-primary hover:text-primary'
                        }`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="form-label">Notes ou symptômes (optionnel)</label>
                <textarea className="form-input resize-none" rows={3}
                  placeholder="Décrivez brièvement vos symptômes ou précisions..."
                  value={form.notes} onChange={(e) => update('notes', e.target.value)} />
              </div>

              <button onClick={handleSubmit} disabled={loading}
                className="btn-primary btn-lg w-full">
                {loading
                  ? <><div className="spinner w-5 h-5" /> Envoi en cours...</>
                  : <><Calendar className="w-5 h-5" /> Confirmer ma demande</>
                }
              </button>
            </div>
          )}

          {/* ── ÉTAPE 3 — Confirmation ── */}
          {etape === 3 && (
            <div className="card text-center space-y-6 animate-fade-in py-10">
              <div className="w-20 h-20 bg-success-50 rounded-3xl flex items-center
                              justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-neutral-text">
                  Demande envoyée ! 🎉
                </h2>
                <p className="text-neutral-muted mt-2">
                  Votre demande de rendez-vous a bien été reçue.
                </p>
              </div>

              {/* Récap */}
              <div className="bg-neutral-bg rounded-2xl p-5 text-left space-y-3">
                <p className="font-bold text-neutral-text text-sm">Récapitulatif</p>
                {[
                  { label: 'Patient',   value: `${form.prenom} ${form.nom}`                    },
                  { label: 'Médecin',   value: form.medecinNom || 'À définir'                  },
                  { label: 'Date',      value: form.date ? format(new Date(form.date), 'EEEE dd MMMM yyyy', { locale: fr }) : '—' },
                  { label: 'Heure',     value: form.heure                                      },
                  { label: 'Motif',     value: form.motif                                      },
                  { label: 'Type',      value: form.type === 'teleconsultation' ? '📹 Téléconsultation' : '🏥 Présentiel' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-neutral-muted">{label}</span>
                    <span className="font-semibold text-neutral-text">{value}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-info-50 border border-info-100 rounded-2xl text-left">
                <p className="text-sm font-semibold text-info mb-1">📞 Prochaine étape</p>
                <p className="text-xs text-neutral-muted">
                  Notre secrétariat vous contactera dans les <strong>2 heures</strong> pour
                  confirmer votre rendez-vous au <strong>+221 33 800 12 34</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/')} className="btn-outline flex-1">
                  Retour à l'accueil
                </button>
                <button onClick={() => navigate('/inscription')} className="btn-primary flex-1">
                  Créer mon compte
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
            <footer className="bg-neutral-text text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white leading-none">Novacare</p>
                  <p className="text-xs text-white/50 leading-none mt-0.5">
                    Dakar
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Clinique médicale privée au service de votre santé depuis 2020.
              </p>
            </div>

            {/* Liens */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Navigation</p>
              <div className="space-y-2">
                {[
                  { label: "Accueil", to: "/" },
                  { label: "Services", to: "/services" },
                  { label: "Contact", to: "/contact" },
                  { label: "Connexion", to: "/connexion" },
                ].map(({ label, to }) => (
                  <button
                    key={to}
                    onClick={() => navigate(to)}
                    className="block text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Services</p>
              <div className="space-y-2">
                {[
                  "Consultations",
                  "Téléconsultation",
                  "Prise de RDV",
                  "Dossier médical",
                ].map((s) => (
                  <p key={s} className="text-sm text-white/60">
                    {s}
                  </p>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Contact</p>
              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Route de Lac Rose, Dakar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+221 70 982 25 61</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Lun–Sam : 8h–20h</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border-t border-white/10 pt-8 flex flex-col sm:flex-row
                          items-center justify-between gap-4"
          >
            <p className="text-xs text-white/40">
              © 2025 Novacare Dakar. Tous droits réservés.
            </p>
            <p className="text-xs text-white/40">
              Plateforme sécurisée · Données médicales protégées
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}