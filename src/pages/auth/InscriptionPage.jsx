import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Eye, EyeOff, Mail, Lock, User,
  ArrowLeft, AlertCircle, Phone, CheckCircle,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function InscriptionPage() {
  const navigate = useNavigate()
  const { createUserProfile } = useAuth()

  const [form, setForm] = useState({
    prenom:    '',
    nom:       '',
    email:     '',
    telephone: '',
    password:  '',
    confirm:   '',
  })
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [erreur,   setErreur]   = useState(null)
  const [succes,   setSucces]   = useState(false)
  const [confirmationRequise, setConfirmationRequise] = useState(false)

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErreur(null) }

  const valider = () => {
    if (!form.prenom || !form.nom)       return 'Prénom et nom obligatoires.'
    if (!form.email)                     return 'Email obligatoire.'
    if (form.password.length < 6)        return 'Mot de passe minimum 6 caractères.'
    if (form.password !== form.confirm)  return 'Les mots de passe ne correspondent pas.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = valider()
    if (err) { setErreur(err); return }
    setLoading(true)
    setErreur(null)
    try {
      const result = await createUserProfile({
        prenom:    form.prenom.trim(),
        nom:       form.nom.trim(),
        email:     form.email.trim(),
        password:  form.password,
        telephone: form.telephone.trim(),
      })

      if (result.requiresEmailConfirmation) {
        // Compte créé mais session inactive tant que l'email n'est pas confirmé
        // (comportement par défaut de Supabase Auth)
        setConfirmationRequise(true)
        setSucces(true)
        return
      }

      setSucces(true)
      setTimeout(() => navigate('/patient'), 1500)
    } catch (e) {
      setErreur(e.message || 'Erreur lors de la création du compte. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-bg flex">

      {/* ── Panneau gauche branding ───────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-accent/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              NovaCare <span className="text-accent font-light">Dakar</span>
            </span>
          </div>
          <p className="text-primary-200 text-sm">Votre santé, notre priorité</p>
        </div>

        {/* Avantages */}
        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Rejoignez<br />
            <span className="text-accent">2 000+ patients</span>
          </h1>
          <p className="text-primary-200 text-base leading-relaxed max-w-sm">
            Créez votre espace patient gratuit et accédez à tous nos services médicaux en ligne.
          </p>
          <div className="space-y-3 pt-2">
            {[
              'Prise de RDV en ligne 24h/24',
              'Dossier médical sécurisé',
              'Ordonnances numériques',
              'Paiement Wave & Orange Money',
              'Téléconsultation disponible',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <p className="text-primary-200 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-primary-300 text-xs">© 2025 NovaCare Dakar · Inscription gratuite</p>
        </div>
      </div>

      {/* ── Panneau droit formulaire ──────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto">

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-muted
                       hover:text-primary transition-colors duration-250"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg text-neutral-text">
              NovaCare <span className="text-primary font-light">Dakar</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-text">Créer mon compte 🏥</h2>
            <p className="text-neutral-muted mt-2">
              Inscription gratuite · Accès immédiat
            </p>
          </div>

          {/* Succès */}
          {succes && (
            <div className="alert-success mb-6 animate-fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p>
                {confirmationRequise
                  ? 'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.'
                  : 'Compte créé avec succès ! Redirection en cours...'}
              </p>
            </div>
          )}

          {/* Erreur */}
          {erreur && (
            <div className="alert-error mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{erreur}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Prénom *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => update('prenom', e.target.value)}
                    className="form-input pl-10"
                    placeholder="Moussa"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Nom *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => update('nom', e.target.value)}
                    className="form-input pl-10"
                    placeholder="Diallo"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Adresse email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="form-input pl-10"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="form-label">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => update('telephone', e.target.value)}
                  className="form-input pl-10"
                  placeholder="+221 77 000 00 00"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="form-label">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="Minimum 6 caractères"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-neutral-muted hover:text-neutral-text transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label className="form-label">Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => update('confirm', e.target.value)}
                  className={`form-input pl-10 ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-danger focus:border-danger'
                      : form.confirm && form.confirm === form.password
                      ? 'border-success focus:border-success'
                      : ''
                  }`}
                  placeholder="Répétez le mot de passe"
                  required
                />
                {form.confirm && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {form.confirm === form.password
                      ? <CheckCircle className="w-4 h-4 text-success" />
                      : <AlertCircle className="w-4 h-4 text-danger" />
                    }
                  </div>
                )}
              </div>
            </div>

            {/* CGU */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="cgu"
                required
                className="w-4 h-4 accent-primary mt-0.5 flex-shrink-0"
              />
              <label htmlFor="cgu" className="text-xs text-neutral-muted leading-relaxed">
                J'accepte les{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">
                  conditions d'utilisation
                </span>{' '}
                et la{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">
                  politique de confidentialité
                </span>{' '}
                de NovaCare Dakar.
              </label>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || succes}
              className="btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                <><div className="spinner w-5 h-5" /> Création du compte...</>
              ) : (
                'Créer mon compte patient'
              )}
            </button>
          </form>

          {/* Déjà un compte */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-neutral-border" />
            <span className="text-xs text-neutral-muted">Déjà inscrit ?</span>
            <div className="flex-1 h-px bg-neutral-border" />
          </div>

          <Link
            to="/connexion"
            className="btn-outline w-full flex items-center justify-center gap-2"
          >
            Se connecter à mon compte
          </Link>

          <p className="text-center text-xs text-neutral-muted mt-6">
            Inscription gratuite · Données médicales protégées · Sénégal
          </p>
        </div>
      </div>
    </div>
  )
}

export default InscriptionPage