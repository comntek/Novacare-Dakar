import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useClinicStore } from './store/clinicStore'
import { useAuth } from './hooks/useAuth'
import BlogPage    from './pages/public/BlogPage'
import PriseRdvPage from './pages/public/PriseRdvPage'

// ── Layout ────────────────────────────────────────────────
import DashboardLayout from './components/layout/DashboardLayout'

// ── Auth ──────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage'
import InscriptionPage from './pages/auth/InscriptionPage'

// ── Admin ─────────────────────────────────────────────────
import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminMedecins       from './pages/admin/AdminMedecins'
import AdminUtilisateurs   from './pages/admin/AdminUtilisateurs'
import AdminRapports       from './pages/admin/AdminRapports'
import AdminNotifications  from './pages/admin/AdminNotifications'
import AdminParametres     from './pages/admin/AdminParametres'
import AdminJournal        from './pages/admin/AdminJournal'
import AdminContenu        from './pages/admin/AdminContenu'
import AdminMessagerie     from './pages/admin/AdminMessagerie'

// ── Médecin ───────────────────────────────────────────────
import MedecinDashboard        from './pages/medecin/MedecinDashboard'
import MedecinAgenda           from './pages/medecin/MedecinAgenda'
import MedecinConsultation     from './pages/medecin/MedecinConsultation'
import MedecinPatients         from './pages/medecin/MedecinPatients'
import MedecinMessagerie       from './pages/medecin/MedecinMessagerie'
import MedecinTeleconsultation from './pages/medecin/MedecinTeleconsultation'
import MedecinDisponibilites   from './pages/medecin/MedecinDisponibilites'

// ── Secrétaire ────────────────────────────────────────────
import SecretaireDashboard  from './pages/secretaire/SecretaireDashboard'
import SecretaireAccueil    from './pages/secretaire/SecretaireAccueil'
import SecretairePatients   from './pages/secretaire/SecretairePatients'
import SecretaireCaisse     from './pages/secretaire/SecretaireCaisse'
import SecretaireAgenda     from './pages/secretaire/SecretaireAgenda'
import SecretaireMessagerie from './pages/secretaire/SecretaireMessagerie'

// ── Patient ───────────────────────────────────────────────
import PatientDashboard        from './pages/patient/PatientDashboard'
import PatientRDV              from './pages/patient/PatientRDV'
import PatientDossier          from './pages/patient/PatientDossier'
import PatientOrdonnances      from './pages/patient/PatientOrdonnances'
import PatientFactures         from './pages/patient/PatientFactures'
import PatientTeleconsultation from './pages/patient/PatientTeleconsultation'
import PatientProfil           from './pages/patient/PatientProfil'
import PatientMessagerie from './pages/patient/PatientMessagerie'

// ── Pages publiques ───────────────────────────────────────
import HomePage     from './pages/public/HomePage'
import ContactPage  from './pages/public/ContactPage'
import ServicesPage from './pages/public/ServicesPage'
import NotFoundPage from './pages/public/NotFoundPage'
import UrgencesPage from './pages/public/UrgencesPage'

// ── Spinner global ────────────────────────────────────────
function GlobalLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
      <div className="text-center">
        <div className="spinner mx-auto mb-3" />
        <p className="text-sm text-neutral-muted">Chargement...</p>
      </div>
    </div>
  )
}

// ── Guard ─────────────────────────────────────────────────
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuthStore()
  if (loading) return <GlobalLoader />
  if (!user)   return <Navigate to="/connexion" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/connexion" replace />
  return children
}

// ── Redirect après login selon rôle ──────────────────────
function RedirectByRole() {
  const { user, loading } = useAuthStore()
  if (loading) return <GlobalLoader />
  if (!user)   return <Navigate to="/connexion" replace />
  const routes = {
    admin:      '/admin',
    medecin:    '/medecin',
    secretaire: '/secretaire',
    patient:    '/patient',
  }
  return <Navigate to={routes[user.role] || '/connexion'} replace />
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  useAuth()

  const loadClinic = useClinicStore((s) => s.load)
  useEffect(() => { loadClinic() }, [loadClinic])

  return (
    <Routes>

      {/* ── Pages publiques ─────────────────────────────── */}
      <Route path="/"          element={<HomePage />}     />
      <Route path="/services"  element={<ServicesPage />} />
      <Route path="/contact"   element={<ContactPage />}  />
      <Route path="/connexion" element={<LoginPage />}    />
      <Route path="/inscription" element={<InscriptionPage />} />
      <Route path="/urgences" element={<UrgencesPage />} />
      <Route path="/blog"      element={<BlogPage />}     />
      <Route path="/prise-rdv" element={<PriseRdvPage />} />

      {/* ── Redirect racine connecté ─────────────────────── */}
      <Route path="/dashboard" element={<RedirectByRole />} />

      {/* ── Admin ───────────────────────────────────────── */}
      <Route path="/admin" element={
        <RequireAuth roles={['admin']}>
          <DashboardLayout />
        </RequireAuth>
      }>
        <Route index               element={<AdminDashboard />}     />
        <Route path="medecins"     element={<AdminMedecins />}      />
        <Route path="utilisateurs" element={<AdminUtilisateurs />}  />
        <Route path="rapports"     element={<AdminRapports />}      />
        <Route path="notifications"element={<AdminNotifications />} />
        <Route path="parametres"   element={<AdminParametres />}    />
        <Route path="journal"      element={<AdminJournal />}       />
        <Route path="contenu"      element={<AdminContenu />}       />
        <Route path="messagerie" element={<AdminMessagerie />} />
      </Route>

      {/* ── Médecin ─────────────────────────────────────── */}
      <Route path="/medecin" element={
        <RequireAuth roles={['medecin']}>
          <DashboardLayout />
        </RequireAuth>
      }>
        <Route index                   element={<MedecinDashboard />}        />
        <Route path="agenda"           element={<MedecinAgenda />}           />
        <Route path="consultation"     element={<MedecinConsultation />}     />
        <Route path="patients"         element={<MedecinPatients />}         />
        <Route path="messagerie"       element={<MedecinMessagerie />}       />
        <Route path="teleconsultation" element={<MedecinTeleconsultation />} />
        <Route path="disponibilites"   element={<MedecinDisponibilites />}   />
      </Route>

      {/* ── Secrétaire ──────────────────────────────────── */}
      <Route path="/secretaire" element={
        <RequireAuth roles={['secretaire']}>
          <DashboardLayout />
        </RequireAuth>
      }>
        <Route index             element={<SecretaireDashboard />}  />
        <Route path="accueil"    element={<SecretaireAccueil />}    />
        <Route path="patients"   element={<SecretairePatients />}   />
        <Route path="caisse"     element={<SecretaireCaisse />}     />
        <Route path="agenda"     element={<SecretaireAgenda />}     />
        <Route path="messagerie" element={<SecretaireMessagerie />} />
      </Route>

      {/* ── Patient ─────────────────────────────────────── */}
      <Route path="/patient" element={
        <RequireAuth roles={['patient']}>
          <DashboardLayout />
        </RequireAuth>
      }>
        <Route index                   element={<PatientDashboard />}        />
        <Route path="rdv"              element={<PatientRDV />}              />
        <Route path="dossier"          element={<PatientDossier />}          />
        <Route path="ordonnances"      element={<PatientOrdonnances />}      />
        <Route path="factures"         element={<PatientFactures />}         />
        <Route path="teleconsultation" element={<PatientTeleconsultation />} />
        <Route path="profil"           element={<PatientProfil />}           />
        <Route path="messagerie"       element={<PatientMessagerie />} />
      </Route>

      {/* ── 404 ─────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}