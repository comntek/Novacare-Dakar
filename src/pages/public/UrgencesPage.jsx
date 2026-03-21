import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone, Clock, MapPin, AlertTriangle,
  ArrowLeft, Stethoscope, Zap, CheckCircle,
  ArrowRight, Shield, Calendar, Menu, X,
} from 'lucide-react'

const SYMPTOMES_URGENCE = [
  { emoji: '❤️', label: 'Douleur thoracique intense'          },
  { emoji: '🧠', label: 'Perte de connaissance soudaine'      },
  { emoji: '😮', label: 'Difficultés respiratoires sévères'   },
  { emoji: '🩸', label: 'Saignement abondant incontrôlable'   },
  { emoji: '⚡', label: 'Convulsions ou crise épileptique'    },
  { emoji: '🤕', label: 'Traumatisme crânien grave'           },
  { emoji: '🔥', label: 'Brûlures étendues'                   },
  { emoji: '💊', label: 'Intoxication ou empoisonnement'      },
  { emoji: '🤰', label: 'Complication grave en grossesse'     },
  { emoji: '👁️', label: 'Perte de vision soudaine'           },
]

const NIVEAUX_URGENCE = [
  {
    niveau:   'Urgence absolue',
    delai:    'Immédiat — 0 à 20 min',
    couleur:  'bg-danger-50 border-danger-100',
    dot:      'bg-danger',
    exemples: 'Arrêt cardiaque, AVC, détresse respiratoire sévère',
  },
  {
    niveau:   'Urgence relative',
    delai:    'Rapide — 20 à 60 min',
    couleur:  'bg-warning-50 border-warning-100',
    dot:      'bg-warning',
    exemples: 'Fracture, douleur intense, plaie profonde',
  },
  {
    niveau:   'Semi-urgence',
    delai:    'Sous 2 à 4 heures',
    couleur:  'bg-info-50 border-info-100',
    dot:      'bg-info',
    exemples: 'Fièvre élevée, vomissements persistants, infection',
  },
]

const ETAPES_URGENCE = [
  { num: '01', titre: 'Appelez le 15 ou le 115',   desc: 'Composez le numéro d\'urgence immédiatement. Ne raccrochez pas.'    },
  { num: '02', titre: 'Décrivez la situation',      desc: 'Donnez votre localisation exacte et les symptômes observés.'        },
  { num: '03', titre: 'Suivez les instructions',    desc: 'Le médecin régulateur vous guidera jusqu\'à l\'arrivée des secours.' },
  { num: '04', titre: 'Ne bougez pas le patient',  desc: 'Sauf en cas de danger immédiat (incendie, noyade).'                  },
]

export default function UrgencesPage() {
  const navigate             = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen font-sans bg-neutral-bg">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="bg-white border-b border-neutral-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center
                            justify-center shadow-btn">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-neutral-text text-base leading-none">Novacare</p>
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
              className="hidden sm:flex btn-outline btn-sm">
              Connexion
            </button>
            <button onClick={() => navigate('/inscription')}
              className="btn-primary btn-sm">
              Inscription
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-icon">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-border px-4 py-3 space-y-1">
            {[
              { label: 'Accueil',    to: '/'            },
              { label: 'Services',   to: '/services'    },
              { label: 'Blog',       to: '/blog'        },
              { label: 'Urgences',   to: '/urgences'    },
              { label: 'Contact',    to: '/contact'     },
              { label: 'Connexion',  to: '/connexion'   },
              { label: 'Inscription',to: '/inscription' },
            ].map(({ label, to }) => (
              <button key={to}
                onClick={() => { navigate(to); setMenuOpen(false) }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium
                           text-neutral-subtle hover:bg-primary-50 hover:text-primary transition-all">
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Header urgences ──────────────────────────── */}
      <section className="relative bg-danger py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-danger to-danger-600" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full
                        -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full
                        translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <button onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white
                       mb-8 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </button>

          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center
                          mx-auto mb-6 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Service des urgences
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Disponible 24h/24 et 7j/7. En cas de danger immédiat,
            appelez le <strong>15</strong> sans attendre.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+221709822561"
              className="flex items-center justify-center gap-3 bg-white text-danger
                         font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all
                         shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Phone className="w-5 h-5" />
              +221 70 982 25 61
            </a>
            <a href="tel:15"
              className="flex items-center justify-center gap-3 bg-white/20 text-white
                         font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-all
                         border border-white/30">
              <Phone className="w-5 h-5" />
              SAMU — Composer le 15
            </a>
          </div>
        </div>
      </section>

      {/* ── Alerte bande ─────────────────────────────── */}
      <div className="bg-danger-50 border-y border-danger-100 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 animate-pulse" />
          <p className="text-sm font-semibold text-danger text-center">
            En cas d'urgence vitale, appelez le <strong>15 (SAMU)</strong> ou
            le <strong>18 (Pompiers)</strong> immédiatement.
            Ne prenez pas le volant vous-même.
          </p>
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 animate-pulse" />
        </div>
      </div>

      {/* ── Symptômes urgence ────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-danger-50 text-danger text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Reconnaître une urgence
            </span>
            <h2 className="text-3xl font-black text-neutral-text">
              Symptômes nécessitant une{' '}
              <span className="text-danger">intervention immédiate</span>
            </h2>
            <p className="text-neutral-muted mt-3">
              Si vous observez l'un de ces signes, appelez les secours sans attendre.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYMPTOMES_URGENCE.map(({ emoji, label }) => (
              <div key={label}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border
                           border-neutral-border hover:border-danger-100 hover:bg-danger-50/30
                           transition-all duration-250">
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <p className="text-sm font-semibold text-neutral-text">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niveaux d'urgence ────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-text">Niveaux de priorité</h2>
            <p className="text-neutral-muted mt-2">
              Nos équipes traitent chaque patient selon la gravité de son état.
            </p>
          </div>
          <div className="space-y-4">
            {NIVEAUX_URGENCE.map(({ niveau, delai, couleur, dot, exemples }) => (
              <div key={niveau}
                className={`flex items-start gap-5 p-5 rounded-2xl border ${couleur}`}>
                <div className={`w-4 h-4 ${dot} rounded-full flex-shrink-0 mt-0.5 animate-pulse`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-bold text-neutral-text">{niveau}</p>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/60">
                      ⏱ {delai}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-muted mt-1">{exemples}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Étapes à suivre ──────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-info-50 text-info text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Que faire en cas d'urgence
            </span>
            <h2 className="text-3xl font-black text-neutral-text">
              Les bons gestes qui sauvent
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ETAPES_URGENCE.map(({ num, titre, desc }) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center
                                justify-center mx-auto mb-4 shadow-btn">
                  <span className="text-white font-black text-lg">{num}</span>
                </div>
                <h3 className="font-bold text-neutral-text mb-2">{titre}</h3>
                <p className="text-sm text-neutral-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Infos pratiques ──────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-text">Informations pratiques</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center
                              justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-neutral-text mb-2">Disponibilité</h3>
              <p className="text-sm text-neutral-muted">
                Urgences accessibles <strong>24h/24</strong> et <strong>7j/7</strong>,
                même les jours fériés.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-danger-50 rounded-2xl flex items-center
                              justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-bold text-neutral-text mb-2">Localisation</h3>
              <p className="text-sm text-neutral-muted">
                Route de Lac Rose<br />
                <strong>Dakar, Sénégal</strong><br />
                Entrée urgences côté Nord
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-success-50 rounded-2xl flex items-center
                              justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-bold text-neutral-text mb-2">Équipement</h3>
              <p className="text-sm text-neutral-muted">
                Bloc opératoire, réanimation, scanner et IRM disponibles sur place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Pas une urgence ?
          </h2>
          <p className="text-primary-200 mb-8 text-lg">
            Prenez rendez-vous en ligne pour une consultation classique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/prise-rdv')}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-600
                         text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" />
              Prendre un rendez-vous
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30
                         text-white font-semibold px-8 py-4 rounded-2xl transition-all
                         border border-white/30">
              <Phone className="w-5 h-5" />
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
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