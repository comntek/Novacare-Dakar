import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stethoscope, BookOpen, Calendar, User,
  ArrowLeft, ArrowRight, Search, X,
  Menu, ChevronRight, Tag, Clock,
} from 'lucide-react'
import { getArticlesPublies } from '../../services/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export default function BlogPage() {
  const navigate = useNavigate()
  const [articles,    setArticles]    = useState([])
  const [chargement,  setChargement]  = useState(true)
  const [recherche,   setRecherche]   = useState('')
  const [categorie,   setCategorie]   = useState('tous')
  const [articleOuvert, setArticleOuvert] = useState(null)
  const [menuOpen,    setMenuOpen]    = useState(false)

  useEffect(() => {
    const charger = async () => {
      setChargement(true)
      try {
        const data = await getArticlesPublies()
        setArticles(data)
      } catch (e) {
        setArticles([])
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  // Catégories uniques depuis les articles
  const categories = ['tous', ...new Set(articles.map((a) => a.categorie).filter(Boolean))]

  const articlesFiltres = articles.filter((a) => {
    const matchRecherche = !recherche ||
      a.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
      a.resume?.toLowerCase().includes(recherche.toLowerCase())
    const matchCategorie = categorie === 'tous' || a.categorie === categorie
    return matchRecherche && matchCategorie
  })

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
              { label: 'Accueil',   to: '/'         },
              { label: 'Services',  to: '/services' },
              { label: 'Blog',      to: '/blog'     },
              { label: 'Urgences',  to: '/urgences' },
              { label: 'Contact',   to: '/contact'  },
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

      {/* ── Hero ────────────────────────────────────── */}
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
            <BookOpen className="w-4 h-4" />
            Blog santé NovaCare Dakar
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Conseils & Actualités santé
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Nos médecins partagent leurs conseils, actualités médicales
            et informations de santé pour vous accompagner au quotidien.
          </p>
        </div>
      </section>

      {/* ── Contenu principal ───────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Barre recherche + filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
              <input
                className="form-input pl-10"
                placeholder="Rechercher un article..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
              {recherche && (
                <button onClick={() => setRecherche('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat}
                  onClick={() => setCategorie(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-250 capitalize
                    ${categorie === cat
                      ? 'bg-primary text-white shadow-btn'
                      : 'bg-white border border-neutral-border text-neutral-subtle hover:border-primary hover:text-primary'
                    }`}>
                  {cat === 'tous' ? `Tous (${articles.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loader */}
          {chargement && (
            <div className="page-loader">
              <div className="text-center">
                <div className="spinner mx-auto mb-3" />
                <p className="text-sm text-neutral-muted">Chargement des articles...</p>
              </div>
            </div>
          )}

          {/* Vide */}
          {!chargement && articlesFiltres.length === 0 && (
            <div className="empty-state py-20">
              <BookOpen className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-semibold text-lg">
                {recherche ? 'Aucun article trouvé' : 'Aucun article publié pour le moment'}
              </p>
              <p className="text-sm mt-2 text-neutral-muted">
                {recherche
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Revenez bientôt, nos médecins préparent du contenu'
                }
              </p>
            </div>
          )}

          {/* Grille articles */}
          {!chargement && articlesFiltres.length > 0 && (
            <>
              {/* Article vedette — le premier */}
              {categorie === 'tous' && !recherche && articlesFiltres[0] && (
                <div
                  onClick={() => setArticleOuvert(articlesFiltres[0])}
                  className="group bg-white rounded-3xl border border-neutral-border/60
                             shadow-card hover:shadow-card-hover hover:-translate-y-1
                             transition-all duration-300 cursor-pointer mb-8 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-2/5 bg-gradient-primary p-10 flex flex-col
                                    justify-center text-white">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5
                                      rounded-full text-xs font-semibold mb-4 w-fit">
                        <Tag className="w-3 h-3" />
                        {articlesFiltres[0].categorie || 'Santé'}
                      </div>
                      <h2 className="text-2xl font-black leading-tight mb-3">
                        {articlesFiltres[0].titre}
                      </h2>
                      <p className="text-primary-200 text-sm leading-relaxed line-clamp-3">
                        {articlesFiltres[0].resume}
                      </p>
                      <div className="flex items-center gap-4 mt-6 text-primary-200 text-xs">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {articlesFiltres[0].auteur || 'NovaCare Dakar'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {articlesFiltres[0].datePublication
                            ? format(toDate(articlesFiltres[0].datePublication), 'dd MMM yyyy', { locale: fr })
                            : '—'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <span className="inline-block bg-primary-50 text-primary text-xs font-bold
                                         px-3 py-1 rounded-full mb-4">Article vedette</span>
                        <p className="text-neutral-muted leading-relaxed line-clamp-6">
                          {articlesFiltres[0].contenu}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-6 text-primary font-semibold text-sm
                                      group-hover:gap-3 transition-all">
                        Lire l'article complet <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Autres articles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(categorie === 'tous' && !recherche
                  ? articlesFiltres.slice(1)
                  : articlesFiltres
                ).map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setArticleOuvert(article)}
                    className="group bg-white rounded-3xl border border-neutral-border/60
                               shadow-card hover:shadow-card-hover hover:-translate-y-1
                               transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Header coloré */}
                    <div className="h-32 bg-gradient-primary flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/5" />
                      <BookOpen className="w-12 h-12 text-white/40" />
                      {article.categorie && (
                        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm
                                        text-white text-xs font-bold px-3 py-1 rounded-full
                                        flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {article.categorie}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-neutral-text text-base leading-snug
                                     group-hover:text-primary transition-colors line-clamp-2">
                        {article.titre}
                      </h3>
                      <p className="text-sm text-neutral-muted leading-relaxed line-clamp-3">
                        {article.resume || article.contenu?.slice(0, 120)}...
                      </p>
                      <div className="flex items-center justify-between pt-3
                                      border-t border-neutral-border text-xs text-neutral-muted">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {article.auteur || 'NovaCare'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.datePublication
                            ? format(toDate(article.datePublication), 'dd MMM', { locale: fr })
                            : '—'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-xs font-semibold
                                      opacity-0 group-hover:opacity-100 transition-all">
                        Lire l'article <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="bg-gradient-primary py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Besoin d'une consultation ?
          </h2>
          <p className="text-primary-200 mb-6">
            Nos médecins sont disponibles pour vous répondre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/prise-rdv')}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-600
                         text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" />
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/inscription')}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30
                         text-white font-semibold px-8 py-4 rounded-2xl transition-all
                         border border-white/25">
              Créer mon compte
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="bg-neutral-text text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">NovaCare Dakar</span>
          </div>
          <p className="text-xs text-white/40">© 2025 NovaCare Dakar · Tous droits réservés</p>
        </div>
      </footer>

      {/* ── Modal article ouvert ─────────────────────── */}
      {articleOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setArticleOuvert(null)}>
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl
                          max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-primary text-white p-8 rounded-t-3xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {articleOuvert.categorie && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white
                                     text-xs font-bold px-3 py-1 rounded-full mb-3">
                      <Tag className="w-3 h-3" />
                      {articleOuvert.categorie}
                    </span>
                  )}
                  <h2 className="text-2xl font-black leading-tight">{articleOuvert.titre}</h2>
                  <div className="flex items-center gap-4 mt-4 text-primary-200 text-sm">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {articleOuvert.auteur || 'NovaCare Dakar'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {articleOuvert.datePublication
                        ? format(toDate(articleOuvert.datePublication), 'dd MMMM yyyy', { locale: fr })
                        : '—'
                      }
                    </span>
                  </div>
                </div>
                <button onClick={() => setArticleOuvert(null)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center
                             justify-center flex-shrink-0 transition-all">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Corps */}
            <div className="p-8 space-y-4">
              {articleOuvert.resume && (
                <p className="text-base font-semibold text-neutral-text leading-relaxed
                               border-l-4 border-primary pl-4 italic">
                  {articleOuvert.resume}
                </p>
              )}
              <div className="text-neutral-muted leading-relaxed whitespace-pre-line text-sm">
                {articleOuvert.contenu}
              </div>
            </div>

            {/* Footer modal */}
            <div className="p-6 border-t border-neutral-border flex gap-3 justify-between">
              <button onClick={() => setArticleOuvert(null)} className="btn-outline">
                Fermer
              </button>
              <button onClick={() => { setArticleOuvert(null); navigate('/prise-rdv') }}
                className="btn-primary">
                <Calendar className="w-4 h-4" />
                Prendre rendez-vous
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}