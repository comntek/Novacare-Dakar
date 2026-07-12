import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users, FileText,
  MessageSquare, Settings, LogOut, Activity,
  CreditCard, UserCheck, BarChart2, Bell,
  Stethoscope, ClipboardList, Video, X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../services/supabase'

const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch (_) {}
    logout()
    navigate('/connexion')
}

const MENUS = {
  secretaire: [
    { to: '/secretaire',            label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/secretaire/accueil',    label: 'Accueil & File',  icon: Activity        },
    { to: '/secretaire/patients',   label: 'Patients',        icon: Users           },
    { to: '/secretaire/agenda',     label: 'Agenda',          icon: Calendar        },
    { to: '/secretaire/caisse',     label: 'Caisse',          icon: CreditCard      },
    { to: '/secretaire/messagerie', label: 'Messagerie',      icon: MessageSquare   },
  ],
  medecin: [
    { to: '/medecin',                  label: 'Tableau de bord',  icon: LayoutDashboard },
    { to: '/medecin/agenda',           label: 'Agenda',           icon: Calendar        },
    { to: '/medecin/consultation',     label: 'Consultations',    icon: Stethoscope     },
    { to: '/medecin/patients',         label: 'Mes patients',     icon: Users           },
    { to: '/medecin/teleconsultation', label: 'Téléconsultation', icon: Video           },
    { to: '/medecin/messagerie',       label: 'Messagerie',       icon: MessageSquare   },
    { to: '/medecin/disponibilites',   label: 'Disponibilités',   icon: Settings        },
  ],
  patient: [
    { to: '/patient',                  label: 'Tableau de bord',  icon: LayoutDashboard },
    { to: '/patient/rdv',              label: 'Mes RDV',          icon: Calendar        },
    { to: '/patient/dossier',          label: 'Mon dossier',      icon: FileText        },
    { to: '/patient/ordonnances',      label: 'Ordonnances',      icon: ClipboardList   },
    { to: '/patient/factures',         label: 'Factures',         icon: CreditCard      },
    { to: '/patient/teleconsultation', label: 'Téléconsultation', icon: Video           },
    { to: '/patient/messagerie',       label: 'Messagerie',       icon: MessageSquare   },
    { to: '/patient/profil',           label: 'Mon profil',       icon: UserCheck       },
  ],
  admin: [
    { to: '/admin',               label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/medecins',      label: 'Médecins',        icon: UserCheck       },
    { to: '/admin/utilisateurs',  label: 'Utilisateurs',    icon: Users           },
    { to: '/admin/rapports',      label: 'Rapports',        icon: BarChart2       },
    { to: '/admin/notifications', label: 'Notifications',   icon: Bell            },
    { to: '/admin/messagerie',    label: 'Messagerie',      icon: MessageSquare   },
    { to: '/admin/journal',       label: 'Journal',         icon: Activity        },
    { to: '/admin/contenu',       label: 'Contenu',         icon: FileText        },
    { to: '/admin/parametres',    label: 'Paramètres',      icon: Settings        },
  ],
}

const ROLE_LABELS = {
  secretaire: 'Secrétaire',
  medecin:    'Médecin',
  patient:    'Patient',
  admin:      'Administrateur',
}

const ROLE_COLORS = {
  admin:      'from-primary to-primary-600',
  medecin:    'from-info to-info-600',
  secretaire: 'from-accent to-accent-600',
  patient:    'from-success to-success-600',
}

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const role             = user?.role || 'patient'
  const liens            = MENUS[role] || []

  const handleLogout = async () => {
    try { await signOut(auth) } catch (_) {}
    logout()
    navigate('/connexion')
  }

  const initiales = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'NC'

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-full w-64 flex flex-col
        transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
        style={{
          background: '#FFFFFF',
          boxShadow: '4px 0 24px rgba(163,177,198,0.2)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center"
              style={{ boxShadow: '0 4px 12px rgba(10,92,62,0.25)' }}>
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-black text-sm text-neutral-text leading-none">NovaCare</p>
              <p className="text-2xs text-primary font-semibold leading-none mt-0.5">Dakar</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden btn-icon w-7 h-7">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profil */}
        <div className="px-4 py-4 border-b border-neutral-border/40">
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(10,92,62,0.06), rgba(10,92,62,0.02))',
              boxShadow: 'inset 2px 2px 6px rgba(163,177,198,0.15), inset -1px -1px 4px rgba(255,255,255,0.6)',
            }}>
            <div className={`w-9 h-9 bg-gradient-to-br ${ROLE_COLORS[role] || ROLE_COLORS.patient}
                             rounded-xl flex items-center justify-center flex-shrink-0`}
              style={{ boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }}>
              <span className="text-white text-xs font-black">{initiales}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-text truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-2xs text-primary font-semibold">{ROLE_LABELS[role]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {liens.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${role}` || to === '/admin'}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-neutral-border/40">
          <button onClick={handleLogout}
            className="sidebar-link w-full text-danger hover:bg-danger-50 hover:text-danger">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar