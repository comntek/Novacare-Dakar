import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Stethoscope,
  Calendar,
  Video,
  Shield,
  ArrowRight,
  Phone,
  CheckCircle,
  Heart,
  Activity,
  Star,
  ChevronRight,
  Menu,
  X,
  Clock,
  MapPin,
  Users,
  Award,
} from "lucide-react";

const SERVICES = [
  {
    icon: Stethoscope,
    titre: "Consultations",
    desc: "Spécialistes qualifiés disponibles 6j/7 pour votre prise en charge complète.",
    couleur: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    icon: Video,
    titre: "Téléconsultations",
    desc: "Consultez depuis chez vous via vidéo sécurisée, partout au Sénégal.",
    couleur: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    icon: Calendar,
    titre: "Prise de RDV",
    desc: "Réservation en ligne 24h/24 avec confirmation immédiate par SMS.",
    couleur: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    icon: Shield,
    titre: "Dossier médical",
    desc: "Accès sécurisé à votre historique complet : ordonnances, bilans, résultats.",
    couleur: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    icon: Heart,
    titre: "Paiement mobile",
    desc: "Wave et Orange Money acceptés. Facturation transparente, reçus instantanés.",
    couleur: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    icon: Activity,
    titre: "Suivi personnalisé",
    desc: "Plans de traitement sur mesure et rappels automatiques pour votre santé.",
    couleur: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
];

const STATS = [
  { valeur: "2 000+", label: "Patients suivis", icon: Users },
  { valeur: "15+", label: "Spécialistes", icon: Award },
  { valeur: "98%", label: "Satisfaction", icon: Star },
  { valeur: "24/7", label: "Disponibilité", icon: Clock },
];

const SPECIALITES = [
  "Cardiologie",
  "Pédiatrie",
  "Gynécologie",
  "Dermatologie",
  "Ophtalmologie",
  "ORL",
  "Neurologie",
  "Médecine générale",
  "Diabétologie",
  "Rhumatologie",
];

const TEMOIGNAGES = [
  {
    nom: "Aminata Diallo",
    role: "Patiente depuis 2023",
    texte:
      "Service exceptionnel. Les médecins sont attentionnés et le système de RDV en ligne est très pratique.",
    note: 5,
  },
  {
    nom: "Moussa Koné",
    role: "Patient depuis 2024",
    texte:
      "La téléconsultation m'a sauvé la mise pendant mon déplacement à Ziguinchor. Très efficace !",
    note: 5,
  },
  {
    nom: "Fatou Seck",
    role: "Patiente depuis 2022",
    texte:
      "Dossier médical toujours à jour, paiement Wave simple. Je recommande vivement NovaCare.",
    note: 5,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#FAFAF8" }}>
      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
        } border-b border-neutral-border`}
      >
        {/* Barre supérieure */}
        <div className="hidden md:flex bg-primary text-white text-xs py-1.5 px-6 items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Clinique ouverte · Service disponible
          </span>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> +221 70 982 25 61
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Lun–Sam : 8h–20h
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Route de Lac Rose, Dakar
            </span>
          </div>
        </div>

        {/* Nav principale */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-btn">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-neutral-text text-base leading-none">
                Novacare
              </p>
              <p className="text-xs text-primary font-semibold leading-none mt-0.5">
                Dakar
              </p>
            </div>
          </button>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
  {[
    { label: 'Accueil',   to: '/'         },
    { label: 'Services',  to: '/services' },
    { label: 'Blog',      to: '/blog'     },
    { label: 'Urgences',  to: '/urgences' },
    { label: 'Contact',   to: '/contact'  },
  ].map(({ label, to }) => (
    <button
      key={to}
      onClick={() => navigate(to)}
      className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-subtle
                 hover:text-primary hover:bg-primary-50 transition-all duration-250"
    >
      {label}
    </button>
  ))}
</div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/connexion")}
              className="hidden sm:flex btn-outline btn-sm"
            >
              Connexion
            </button>
            <button
              onClick={() => navigate("/inscription")}
              className="btn-primary btn-sm"
            >
              Inscription
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-icon"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-border px-4 py-3 space-y-1 shadow-lg">
            {[
  { label: 'Accueil',    to: '/'            },
  { label: 'Services',   to: '/services'    },
  { label: 'Blog',       to: '/blog'        },
  { label: 'Urgences',   to: '/urgences'    },
  { label: 'Contact',    to: '/contact'     },
  { label: 'Connexion',  to: '/connexion'   },
  { label: 'Inscription',to: '/inscription' },
].map(({ label, to }) => (
  <button
    key={to}
    onClick={() => { navigate(to); setMenuOpen(false) }}
    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium
               text-neutral-subtle hover:bg-primary-50 hover:text-primary transition-all"
  >
    {label}
  </button>
))}
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-28 md:pt-36 pb-20 px-4 overflow-hidden bg-gradient-primary">
        {/* Cercles décoratifs */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full
                        -translate-y-1/3 translate-x-1/3 pointer-events-none"
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full
                        translate-y-1/2 -translate-x-1/4 pointer-events-none"
        />
        <div
          className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 rounded-full
                        pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div className="text-white space-y-6">
              <div
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm
                              px-4 py-2 rounded-full text-sm font-medium border border-white/20"
              >
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Clinique privée de référence à Dakar
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-tight tracking-tight">
                Votre santé,
                <br />
                <span className="text-accent">notre priorité</span>
              </h1>

              <p className="text-primary-200 text-lg leading-relaxed max-w-lg">
                Consultations médicales, téléconsultations et suivi
                personnalisé. Une équipe de spécialistes à votre service partout
                au Sénégal.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => navigate("/prise-rdv")}
                  className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-600
                             text-white font-bold px-8 py-4 rounded-2xl transition-all duration-250
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Calendar className="w-5 h-5" />
                  Prendre rendez-vous
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25
                             text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-250
                             border border-white/25 hover:border-white/40"
                >
                  <Video className="w-5 h-5" />
                  Nos services
                </button>
              </div>

              {/* Badges confiance */}
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  "Certifié ISO 9001",
                  "Urgences 24h/7j",
                  "98% satisfaction",
                ].map((b) => (
                  <span
                    key={b}
                    className="text-xs text-primary-200 bg-white/10 px-3 py-1.5 rounded-full
                               border border-white/15"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Image + cards flottantes */}
            <div className="relative hidden lg:block">
              {/* Image principale */}
              <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5
                                rounded-3xl border border-white/20 backdrop-blur-sm overflow-hidden"
                >
                  <img
                    src="https://i.pinimg.com/1200x/94/1d/83/941d832cb052d79777257f6f7f5e02db.jpg"
                    alt="Médecin NovaCare"
                    className="w-full h-full object-cover object-top mix-blend-luminosity opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                </div>

                {/* Card flottante haut */}
                <div
                  className="absolute -left-8 top-8 bg-white rounded-2xl shadow-modal p-4
                                flex items-center gap-3 animate-fade-in"
                >
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-text text-sm">
                      2000+
                    </p>
                    <p className="text-xs text-neutral-muted">
                      Patients suivis
                    </p>
                  </div>
                </div>

                {/* Card flottante bas */}
                <div
                  className="absolute -right-8 bottom-12 bg-white rounded-2xl shadow-modal p-4
                                flex items-center gap-3 animate-fade-in"
                >
                  <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-text text-sm">
                      Prochain créneau
                    </p>
                    <p className="text-xs text-success font-semibold">
                      Aujourd'hui disponible
                    </p>
                  </div>
                </div>

                {/* Card médecins */}
                <div
                  className="absolute -left-6 bottom-24 bg-white rounded-2xl shadow-modal px-4 py-3
                                animate-fade-in"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {["#0A5C3E", "#C9922A", "#2563EB"].map((c, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: c }}
                        >
                          {["M", "F", "D"][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-text">
                        15 spécialistes
                      </p>
                      <p className="text-2xs text-neutral-muted">en ligne</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b border-neutral-border py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ valeur, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div
                className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center
                              mx-auto mb-3 group-hover:bg-primary transition-all duration-250"
              >
                <Icon className="w-5 h-5 text-primary group-hover:text-white transition-all duration-250" />
              </div>
              <p className="text-3xl font-black text-primary">{valeur}</p>
              <p className="text-sm text-neutral-muted mt-0.5 font-medium">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block bg-primary-50 text-primary text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4"
            >
              Nos services
            </span>
            <h2 className="text-4xl font-black text-neutral-text">
              Une prise en charge <span className="text-primary">complète</span>
            </h2>
            <p className="text-neutral-muted mt-3 text-lg max-w-xl mx-auto">
              Tout ce dont vous avez besoin pour votre santé, en un seul
              endroit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, titre, desc, couleur, bg, text }) => (
              <div
                key={titre}
                onClick={() => navigate("/services")}
                className="group bg-white rounded-3xl p-6 border border-neutral-border/60
                           shadow-card hover:shadow-card-hover hover:-translate-y-1
                           transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Gradient décoratif */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${couleur}
                                 opacity-0 group-hover:opacity-5 rounded-full
                                 translate-x-8 -translate-y-8 transition-all duration-300`}
                />

                <div
                  className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4
                                 group-hover:scale-110 transition-all duration-250`}
                >
                  <Icon className={`w-6 h-6 ${text}`} />
                </div>

                <h3 className="font-bold text-neutral-text text-lg mb-2">
                  {titre}
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  {desc}
                </p>

                <div
                  className={`mt-4 flex items-center gap-1 ${text} text-xs font-semibold
                                 opacity-0 group-hover:opacity-100 transition-all duration-250
                                 -translate-x-2 group-hover:translate-x-0`}
                >
                  En savoir plus <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="text-center mb-10">
            <span
              className="inline-block bg-accent-50 text-accent text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4"
            >
              Spécialités médicales
            </span>
            <h2 className="text-3xl font-black text-neutral-text">
              Des experts dans chaque domaine
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {SPECIALITES.map((s) => (
              <button
                key={s}
                onClick={() => navigate("/connexion")}
                className="px-5 py-2.5 bg-neutral-bg hover:bg-primary text-neutral-subtle
                           hover:text-white rounded-xl text-sm font-semibold border border-neutral-border
                           hover:border-primary transition-all duration-250 hover:-translate-y-0.5"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          POURQUOI NOUS — SPLIT SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texte */}
          <div>
            <span
              className="inline-block bg-success-100 text-success text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-6"
            >
              Pourquoi nous choisir
            </span>
            <h2 className="text-4xl font-black text-neutral-text mb-6 leading-tight">
              La santé digitale,
              <br />
              <span className="text-primary">simple et accessible</span>
            </h2>
            <p className="text-neutral-muted text-base leading-relaxed mb-8">
              Novacare Dakar combine l'expertise médicale traditionnelle avec
              les outils numériques modernes pour vous offrir une expérience de
              santé sans friction.
            </p>
            <div className="space-y-3">
              {[
                "Médecins certifiés et expérimentés",
                "Résultats et ordonnances en ligne",
                "Paiement Wave & Orange Money",
                "Téléconsultation disponible 7j/7",
                "Dossier médical sécurisé et centralisé",
                "Rappels automatiques par SMS",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  </div>
                  <p className="text-sm font-medium text-neutral-text">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/inscription")}
              className="btn-primary mt-8 btn-lg"
            >
              Créer mon espace patient
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Cards grille */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                titre: "Prise de RDV",
                desc: "En moins de 2 minutes",
                emoji: "📅",
                bg: "bg-primary-50",
                border: "border-primary-100",
              },
              {
                titre: "Consultation",
                desc: "Présentiel ou vidéo",
                emoji: "🩺",
                bg: "bg-accent-50",
                border: "border-accent-100",
              },
              {
                titre: "Ordonnance",
                desc: "Reçue en ligne instant",
                emoji: "💊",
                bg: "bg-success-50",
                border: "border-success-100",
              },
              {
                titre: "Paiement sécurisé",
                desc: "Wave · Orange Money",
                emoji: "💳",
                bg: "bg-info-50",
                border: "border-info-100",
              },
              {
                titre: "Dossier médical",
                desc: "Accessible 24h/24",
                emoji: "📋",
                bg: "bg-purple-50",
                border: "border-purple-100",
              },
              {
                titre: "Suivi continu",
                desc: "Rappels intelligents",
                emoji: "🔔",
                bg: "bg-rose-50",
                border: "border-rose-100",
              },
            ].map(({ titre, desc, emoji, bg, border }) => (
              <div
                key={titre}
                className={`${bg} ${border} border rounded-2xl p-5 hover:shadow-card
                            transition-all duration-250 hover:-translate-y-0.5`}
              >
                <p className="text-3xl mb-3">{emoji}</p>
                <p className="font-bold text-neutral-text text-sm">{titre}</p>
                <p className="text-xs text-neutral-muted mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════ */}
      <section className="bg-gradient-primary py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block bg-white/20 text-white text-xs font-bold
                             px-4 py-2 rounded-full uppercase tracking-widest mb-4"
            >
              Témoignages
            </span>
            <h2 className="text-3xl font-black text-white">
              Ce que disent nos patients
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMOIGNAGES.map(({ nom, role, texte, note }) => (
              <div
                key={nom}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-6
                                        border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: note }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  "{texte}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {nom[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{nom}</p>
                    <p className="text-primary-200 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-neutral-bg">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center
                          mx-auto mb-6 shadow-btn"
          >
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black text-neutral-text mb-4">
            Prêt à prendre soin
            <br />
            de votre santé ?
          </h2>
          <p className="text-neutral-muted text-lg mb-8 max-w-xl mx-auto">
            Rejoignez les 2000+ patients qui nous font confiance à Dakar.
            Inscription gratuite, premier rendez-vous en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/prise-rdv')}
              className="btn-primary btn-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5
                         transition-all duration-250"
            >
              <Calendar className="w-5 h-5" />
              Prendre rendez-vous
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="btn-outline btn-lg"
            >
              <Phone className="w-5 h-5" />
              Nous contacter
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
  );
}
