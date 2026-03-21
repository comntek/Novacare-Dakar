import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { getUtilisateurById } from "../../services/firestore";
import { useAuthStore } from "../../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    setErreur(null);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      const data = await getUtilisateurById(cred.user.uid);
      if (!data) throw new Error("Utilisateur introuvable");
      setUser({ ...data, uid: cred.user.uid });
      const routes = {
        admin: "/admin",
        medecin: "/medecin",
        secretaire: "/secretaire",
        patient: "/patient",
      };
      navigate(routes[data.role] || "/");
    } catch (e) {
      setErreur("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex">
      {/* ── Panneau gauche branding ───────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-accent/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              NovaCare <span className="text-accent font-light">Dakar</span>
            </span>
          </div>
          <p className="text-primary-200 text-sm">
            Votre santé, notre priorité
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            La santé digitale
            <br />
            <span className="text-accent">au service de tous</span>
          </h1>
          <p className="text-primary-200 text-base leading-relaxed max-w-sm">
            Gérez vos rendez-vous, consultations et dossiers médicaux depuis une
            seule plateforme sécurisée.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: "2000+", label: "Patients" },
              { value: "12", label: "Médecins" },
              { value: "98%", label: "Satisfaction" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/10 rounded-2xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-primary-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-primary-300 text-xs">
            © 2025 NovaCare Dakar · Tous droits réservés
          </p>
        </div>
      </div>

      {/* ── Panneau droit formulaire ──────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="mb-8">
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
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg text-neutral-text">
              NovaCare <span className="text-primary font-light">Dakar</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-text">
              Bon retour 👋
            </h2>
            <p className="text-neutral-muted mt-2">
              Connectez-vous à votre espace NovaCare
            </p>
          </div>

          {erreur && (
            <div className="alert-error mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{erreur}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="form-input pl-10"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Mot de passe</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-neutral-muted hover:text-neutral-text transition-colors"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5" /> Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-neutral-border" />
            <span className="text-xs text-neutral-muted">NovaCare Dakar</span>
            <div className="flex-1 h-px bg-neutral-border" />
          </div>

          {/* Pas encore de compte */}
          <p className="text-center text-sm text-neutral-muted">
            Pas encore de compte ?{" "}
            <Link
              to="/inscription"
              className="text-primary font-semibold hover:underline"
            >
              S'inscrire gratuitement
            </Link>
          </p>

          <p className="text-center text-xs text-neutral-muted mt-8">
            Plateforme sécurisée · Données médicales protégées
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
