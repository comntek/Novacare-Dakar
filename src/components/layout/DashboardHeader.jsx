import { Menu, Bell, Search } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useClinicStore } from '../../store/clinicStore'

const TITRES = {
  secretaire: 'Espace Secrétaire',
  medecin:    'Espace Médecin',
  patient:    'Espace Patient',
  admin:      'Administration',
}

const ROLE_COLORS = {
  admin:      'from-primary to-primary-600',
  medecin:    'from-info to-info-600',
  secretaire: 'from-accent to-accent-600',
  patient:    'from-success to-success-600',
}

export function DashboardHeader({ onMenuOpen }) {
  const { user } = useAuthStore()
  const role     = user?.role || 'patient'
  const nomClinique = useClinicStore((s) => s.data.nomClinique)

  const initiales = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'NC'

  return (
    <header className="h-16 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0"
      style={{
        background: '#F0F4F8',
        borderBottom: '1px solid rgba(163,177,198,0.2)',
      }}>

      {/* Burger mobile */}
      <button onClick={onMenuOpen} className="btn-icon lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      {/* Titre */}
      <div className="hidden sm:block">
        <p className="text-sm font-black text-neutral-text">{TITRES[role]}</p>
        <p className="text-2xs text-neutral-muted">{nomClinique || 'NovaCare Dakar'}</p>
      </div>

      {/* Recherche */}
      <div className="flex-1 max-w-sm mx-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 text-sm text-neutral-text rounded-xl
                       border-0 placeholder:text-neutral-muted transition-all duration-250
                       focus:outline-none focus:ring-2 focus:ring-primary-100"
            style={{
              background: '#F0F4F8',
              boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.3), inset -2px -2px 6px rgba(255,255,255,0.8)',
            }}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center
                           text-neutral-subtle hover:text-primary transition-all duration-250"
          style={{ boxShadow: '3px 3px 8px rgba(163,177,198,0.25), -2px -2px 6px rgba(255,255,255,0.8)' }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full
                           border-2 border-white" />
        </button>

        {/* Séparateur */}
        <div className="w-px h-6 bg-neutral-border/60 hidden sm:block" />

        {/* Avatar + nom */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-neutral-text leading-none">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-2xs text-neutral-muted mt-0.5 capitalize">{role}</p>
          </div>
          <div className={`w-9 h-9 bg-gradient-to-br ${ROLE_COLORS[role] || ROLE_COLORS.patient}
                           rounded-xl flex items-center justify-center`}
            style={{ boxShadow: '3px 3px 8px rgba(163,177,198,0.3), -1px -1px 4px rgba(255,255,255,0.6)' }}>
            <span className="text-white text-xs font-black">{initiales}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader