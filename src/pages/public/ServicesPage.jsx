import { useNavigate } from 'react-router-dom'
import {
  Stethoscope, Video, Calendar, Shield,
  Activity, Heart, ArrowRight, ArrowLeft,
  Clock, MapPin, Phone, CheckCircle,
  Users, Star, Zap, ChevronRight,
  Menu, X,
} from 'lucide-react'
import { useState } from 'react'

const SERVICES = [
  {
    icon:      Stethoscope,
    titre:     'Consultations médicales',
    desc:      'Consultez nos médecins spécialistes en présentiel au sein de notre clinique moderne équipée des dernières technologies médicales.',
    details:   ['Cardiologie', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'ORL', 'Neurologie'],
    gradient:  'from-emerald-500 to-teal-600',
    bg:        'bg-primary-50',
    text:      'text-primary',
    tarif:     'À partir de 15 000 FCFA',
    duree:     '30 à 45 min',
    cta:       'Prendre rendez-vous',
  },
  {
    icon:      Video,
    titre:     'Téléconsultations',
    desc:      'Bénéficiez d\'une consultation médicale depuis chez vous via notre système de vidéoconférence sécurisé. Disponible partout au Sénégal.',
    details:   ['Connexion sécurisée', 'Disponible 7j/7', 'Ordonnance par email', 'Suivi en ligne'],
    gradient:  'from-blue-500 to-indigo-600',
    bg:        'bg-info-50',
    text:      'text-info',
    tarif:     'À partir de 10 000 FCFA',
    duree:     '20 à 30 min',
    cta:       'Consulter en vidéo',
  },
  {
    icon:      Calendar,
    titre:     'Prise de rendez-vous',
    desc:      'Réservez votre consultation en ligne à tout moment. Confirmation immédiate et rappels automatiques par SMS avant votre rendez-vous.',
    details:   ['Réservation 24h/24', 'Confirmation instantanée', 'Rappels SMS', 'Annulation facile'],
    gradient:  'from-amber-500 to-orange-500',
    bg:        'bg-accent-50',
    text:      'text-accent',
    tarif:     'Service gratuit',
    duree:     'En 2 minutes',
    cta:       'Réserver maintenant',
  },
  {
    icon:      Shield,
    titre:     'Dossier médical numérique',
    desc:      'Accédez à votre historique médical complet depuis votre espace patient : consultations passées, ordonnances, résultats d\'analyses et factures.',
    details:   ['Données chiffrées', 'Accès sécurisé', 'Partageable', 'Toujours disponible'],
    gradient:  'from-purple-500 to-violet-600',
    bg:        'bg-purple-50',
    text:      'text-purple-600',
    tarif:     'Inclus avec votre compte',
    duree:     'Accès instantané',
    cta:       'Créer mon dossier',
  },
  {
    icon:      Heart,
    titre:     'Paiement mobile',
    desc:      'Payez vos consultations en toute simplicité avec Wave ou Orange Money. Facturation 100% transparente avec reçus électroniques instantanés.',
    details:   ['Wave', 'Orange Money', 'Espèces', 'Reçu électronique'],
    gradient:  'from-rose-500 to-pink-600',
    bg:        'bg-rose-50',
    text:      'text-rose-600',
    tarif:     'Sans frais supplémentaires',
    duree:     'Paiement en 1 clic',
    cta:       'Voir les tarifs',
  },
  {
    icon:      Activity,
    titre:     'Suivi personnalisé',
    desc:      'Votre médecin assure un suivi continu avec des plans de traitement sur mesure, des ordonnances numériques et des rappels intelligents.',
    details:   ['Ordonnances en ligne', 'Plans de traitement', 'Bilans réguliers', 'Alertes santé'],
    gradient:  'from-cyan-500 to-sky-600',
    bg:        'bg-cyan-50',
    text:      'text-cyan-600',
    tarif:     'Inclus dans chaque consultation',
    duree:     'Suivi continu',
    cta:       'Commencer le suivi',
  },
]

const SPECIALITES = [
  { nom: 'Cardiologie',        emoji: '❤️' },
  { nom: 'Pédiatrie',          emoji: '👶' },
  { nom: 'Gynécologie',        emoji: '🌸' },
  { nom: 'Dermatologie',       emoji: '🔬' },
  { nom: 'Ophtalmologie',      emoji: '👁️' },
  { nom: 'ORL',                emoji: '👂' },
  { nom: 'Neurologie',         emoji: '🧠' },
  { nom: 'Médecine générale',  emoji: '🩺' },
  { nom: 'Diabétologie',       emoji: '💉' },
  { nom: 'Rhumatologie',       emoji: '🦴' },
  { nom: 'Pneumologie',        emoji: '🫁' },
  { nom: 'Gastro-entérologie', emoji: '🏥' },
]

const PROCESSUS = [
  { num: '01', titre: 'Créez votre compte',    desc: 'Inscription gratuite en 2 minutes. Email et mot de passe suffisent.',    icon: Users    },
  { num: '02', titre: 'Choisissez un médecin', desc: 'Filtrez par spécialité et disponibilité. Consultez les profils.',         icon: Star     },
  { num: '03', titre: 'Réservez votre RDV',    desc: 'Choisissez votre créneau. Confirmation immédiate par SMS.',               icon: Calendar },
  { num: '04', titre: 'Consultez et payez',    desc: 'En présentiel ou en vidéo. Paiement Wave ou Orange Money.',               icon: Zap      },
]

export default function ServicesPage() {
  const navigate    = useNavigate()
  const [menuOpen,  setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-bg font-sans">

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav className="bg-white border-b border-neutral-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center
                            justify-center shadow-btn">
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

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative bg-gradient-primary text-white py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full
                        -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full
                        translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white
                       mb-8 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2
                          rounded-full text-sm font-medium border border-white/20 mb-6">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            6 services · 12 spécialités · Dakar
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Tous nos services médicaux
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto mb-8">
            Une prise en charge médicale complète et moderne au cœur de Dakar.
            Consultations, télémédecine, dossier numérique et paiement mobile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/prise-rdv')}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-600
                         text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" />
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30
                         text-white font-semibold px-8 py-4 rounded-2xl transition-all
                         border border-white/25">
              <Phone className="w-5 h-5" />
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES DÉTAILLÉS
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="inline-block bg-primary-50 text-primary text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Nos services
            </span>
            <h2 className="text-4xl font-black text-neutral-text">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-neutral-muted mt-3 text-lg max-w-xl mx-auto">
              Chaque service est conçu pour simplifier votre parcours de soin.
            </p>
          </div>

          <div className="space-y-6">
            {SERVICES.map(({ icon: Icon, titre, desc, details, bg, text, tarif, duree, cta, gradient }, i) => (
              <div key={titre}
                className="bg-white rounded-3xl border border-neutral-border/60 shadow-card
                           overflow-hidden hover:shadow-card-hover transition-all duration-300">
                <div className="flex flex-col lg:flex-row">

                  {/* Icône colorée */}
                  <div className={`lg:w-64 xl:w-80 flex-shrink-0 bg-gradient-to-br ${gradient}
                                   p-10 flex flex-col items-center justify-center text-white
                                   ${i % 2 !== 0 ? 'lg:order-last' : ''}`}>
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center
                                    justify-center mb-4">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <p className="font-black text-xl text-center">{titre}</p>
                    <div className="mt-4 space-y-2 text-center">
                      <p className="text-white/80 text-sm font-semibold">{tarif}</p>
                      <p className="text-white/60 text-xs">{duree}</p>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-8 flex flex-col justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-neutral-text mb-3">{titre}</h3>
                      <p className="text-neutral-muted leading-relaxed">{desc}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {details.map((d) => (
                        <span key={d}
                          className={`${bg} ${text} text-xs font-semibold
                                     px-3 py-1.5 rounded-xl border border-current/10`}>
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* CTA individuel → /prise-rdv */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center
                                    justify-between gap-4 pt-4 border-t border-neutral-border">
                      <div className="flex items-center gap-4 text-sm text-neutral-muted">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {duree}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> Dakar ou en ligne
                        </span>
                      </div>
                      <button
                        onClick={() => navigate('/prise-rdv')}
                        className="btn-primary flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                        {cta}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SPÉCIALITÉS
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-accent-50 text-accent text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Spécialités
            </span>
            <h2 className="text-3xl font-black text-neutral-text">
              12 spécialités médicales
            </h2>
            <p className="text-neutral-muted mt-2">
              Des experts dans chaque domaine pour une prise en charge optimale
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SPECIALITES.map(({ nom, emoji }) => (
              <button key={nom}
                onClick={() => navigate('/prise-rdv')}
                className="flex items-center gap-3 p-4 bg-neutral-bg hover:bg-primary-50
                           rounded-2xl border border-neutral-border hover:border-primary-200
                           transition-all duration-250 hover:-translate-y-0.5 group text-left">
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-text group-hover:text-primary
                                transition-colors">
                    {nom}
                  </p>
                  <p className="text-xs text-neutral-muted flex items-center gap-1 mt-0.5">
                    RDV disponible <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESSUS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-success-100 text-success text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Comment ça marche
            </span>
            <h2 className="text-3xl font-black text-neutral-text">
              Un rendez-vous en 4 étapes simples
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESSUS.map(({ num, titre, desc, icon: Icon }, i) => (
              <div key={num} className="relative text-center">
                {i < PROCESSUS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)]
                                  w-[calc(100%-5rem)] h-px bg-neutral-border z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center
                                  justify-center mx-auto mb-4 shadow-btn">
                    <span className="text-white font-black text-xl">{num}</span>
                  </div>
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center
                                  justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-neutral-text mb-2">{titre}</h3>
                  <p className="text-sm text-neutral-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/prise-rdv')}
              className="btn-primary btn-lg shadow-btn hover:shadow-card-hover
                         hover:-translate-y-0.5 transition-all">
              <Calendar className="w-5 h-5" />
              Prendre rendez-vous maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HORAIRES
      ══════════════════════════════════════════ */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-text">Horaires d'ouverture</h2>
          </div>
          <div className="space-y-3">
            {[
              { jour: 'Lundi — Vendredi', heure: '08h00 — 20h00',       ouvert: true  },
              { jour: 'Samedi',           heure: '09h00 — 18h00',       ouvert: true  },
              { jour: 'Dimanche',         heure: 'Urgences uniquement', ouvert: false },
            ].map(({ jour, heure, ouvert }) => (
              <div key={jour}
                className="flex items-center justify-between p-5 rounded-2xl border
                           border-neutral-border bg-neutral-bg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${ouvert ? 'bg-success' : 'bg-neutral-border'}`} />
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-neutral-text">{jour}</span>
                  </div>
                </div>
                <span className={`text-sm font-medium ${ouvert ? 'text-neutral-text' : 'text-neutral-muted'}`}>
                  {heure}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-danger-50 border border-danger-100 rounded-2xl
                          flex items-center gap-4">
            <div className="w-10 h-10 bg-danger-100 rounded-xl flex items-center
                            justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="font-bold text-danger">Urgences 24h/24</p>
              <p className="text-sm text-neutral-muted mt-0.5">
                Composez le <strong>15</strong> ou appelez le{' '}
                <a href="tel:+221338001234" className="text-danger font-semibold hover:underline">
                  +221 70 982 25 61
                </a>
              </p>
            </div>
            <button
              onClick={() => navigate('/urgences')}
              className="ml-auto btn-sm flex items-center gap-1.5 bg-danger text-white
                         hover:bg-danger-600 rounded-xl px-4 py-2 text-xs font-bold
                         transition-all flex-shrink-0">
              Urgences <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="bg-gradient-primary py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Prêt à consulter ?</h2>
          <p className="text-primary-200 text-lg mb-8">
            Sans compte requis · Premier RDV en quelques clics · Paiement mobile
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/prise-rdv')}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-600
                         text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" />
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/inscription')}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30
                         text-white font-semibold px-8 py-4 rounded-2xl transition-all
                         border border-white/25">
              Créer mon compte
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
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