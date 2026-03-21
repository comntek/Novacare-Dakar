import { useState, useEffect } from 'react'
import {
  FileText, Plus, X, AlertCircle,
  Loader2, Trash2, Eye, EyeOff,
  Edit,
} from 'lucide-react'
import {
  getArticles, createArticle, updateArticle, deleteArticle,
} from '../../services/firestore'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

// ── Modal article ─────────────────────────────────────────
function ModalArticle({ article, onClose, onSave }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    titre:    article?.titre    || '',
    categorie:article?.categorie|| '',
    resume:   article?.resume   || '',
    contenu:  article?.contenu  || '',
    publie:   article?.publie   !== undefined ? article.publie : true,
  })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur,     setErreur]     = useState(null)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.titre || !form.contenu) {
      setErreur('Le titre et le contenu sont obligatoires.')
      return
    }
    setSauvegarde(true)
    setErreur(null)
    try {
      const data = {
        titre:     form.titre.trim(),
        categorie: form.categorie.trim(),
        resume:    form.resume.trim(),
        contenu:   form.contenu.trim(),
        publie:    form.publie,
        auteur:    `Dr. ${user?.prenom} ${user?.nom}`,
        auteurId:  user?.uid,
      }
      await onSave(data, article?.id)
      onClose()
    } catch (e) {
      setErreur('Erreur lors de la sauvegarde.')
    } finally {
      setSauvegarde(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">
            {article ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="modal-body space-y-4">
          {erreur && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{erreur}</p>
            </div>
          )}

          <div>
            <label className="form-label">Titre *</label>
            <input className="form-input" value={form.titre}
              onChange={(e) => update('titre', e.target.value)}
              placeholder="Titre de l'article..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Catégorie</label>
              <input className="form-input" value={form.categorie}
                onChange={(e) => update('categorie', e.target.value)}
                placeholder="Cardiologie, Conseils..." />
            </div>
            <div>
              <label className="form-label">Statut</label>
              <div className="flex gap-2 mt-1">
                {[
                  { val: true,  label: '✅ Publié'   },
                  { val: false, label: '🔒 Brouillon' },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    onClick={() => update('publie', val)}
                    className={`
                      flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                      ${form.publie === val
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-neutral-subtle border-neutral-border hover:border-primary'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Résumé</label>
            <textarea className="form-input resize-none" rows={2}
              value={form.resume}
              onChange={(e) => update('resume', e.target.value)}
              placeholder="Bref résumé de l'article..." />
          </div>

          <div>
            <label className="form-label">Contenu *</label>
            <textarea className="form-input resize-none" rows={8}
              value={form.contenu}
              onChange={(e) => update('contenu', e.target.value)}
              placeholder="Contenu complet de l'article..." />
          </div>
        </div>

        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handleSubmit} disabled={sauvegarde} className="btn-primary">
            {sauvegarde
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
              : <><FileText className="w-4 h-4" /> {article ? 'Modifier' : 'Publier'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export function AdminContenu() {
  const [articles,      setArticles]      = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [erreur,        setErreur]        = useState(null)
  const [modalNouv,     setModalNouv]     = useState(false)
  const [articleSelec,  setArticleSelec]  = useState(null)
  const [suppression,   setSuppression]   = useState(null)

  const charger = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const data = await getArticles()
      setArticles(data)
    } catch (e) {
      setErreur('Impossible de charger les articles.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const handleSave = async (data, id) => {
    if (id) {
      await updateArticle(id, data)
    } else {
      await createArticle(data)
    }
    await charger()
  }

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id)
      setSuppression(null)
      await charger()
    } catch (e) {
      setErreur('Impossible de supprimer l\'article.')
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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Contenu & Blog</h1>
          <p className="page-subtitle">
            {articles.length} article{articles.length > 1 ? 's' : ''} ·{' '}
            {articles.filter((a) => a.publie).length} publié{articles.filter((a) => a.publie).length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setModalNouv(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      {erreur && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{erreur}</p>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="empty-state">
          <FileText className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-medium">Aucun article</p>
          <button onClick={() => setModalNouv(true)} className="btn-outline mt-4">
            <Plus className="w-4 h-4" />
            Créer le premier article
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="card-hover flex items-start gap-4">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${article.publie ? 'bg-success-50 text-success' : 'bg-neutral-bg text-neutral-muted'}
              `}>
                {article.publie
                  ? <Eye className="w-4 h-4" />
                  : <EyeOff className="w-4 h-4" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-neutral-text">{article.titre}</p>
                  <span className={article.publie ? 'badge-success' : 'badge-neutral'}>
                    {article.publie ? 'Publié' : 'Brouillon'}
                  </span>
                  {article.categorie && (
                    <span className="badge-primary">{article.categorie}</span>
                  )}
                </div>
                <p className="text-sm text-neutral-muted mt-0.5 truncate">
                  {article.resume || article.contenu?.slice(0, 80)}...
                </p>
                <p className="text-xs text-neutral-muted mt-1">
                  {article.auteur} · {article.datePublication
                    ? format(toDate(article.datePublication), 'dd MMM yyyy', { locale: fr })
                    : '—'
                  }
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setArticleSelec(article)}
                  className="btn-icon"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSuppression(article.id)}
                  className="btn-icon text-danger hover:bg-danger-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation suppression */}
      {suppression && (
        <div className="modal-overlay" onClick={() => setSuppression(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body text-center">
              <div className="w-12 h-12 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-danger" />
              </div>
              <h2 className="text-lg font-bold text-neutral-text mb-2">Supprimer l'article ?</h2>
              <p className="text-sm text-neutral-muted">Cette action est irréversible.</p>
            </div>
            <div className="modal-footer justify-center gap-3">
              <button onClick={() => setSuppression(null)} className="btn-outline">Annuler</button>
              <button onClick={() => handleDelete(suppression)} className="btn-danger">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {modalNouv && (
        <ModalArticle
          onClose={() => setModalNouv(false)}
          onSave={handleSave}
        />
      )}

      {articleSelec && (
        <ModalArticle
          article={articleSelec}
          onClose={() => setArticleSelec(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default AdminContenu