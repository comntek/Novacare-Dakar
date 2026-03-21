import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users,
  CreditCard, MessageSquare, Activity,
  FileText, ClipboardList, Video,
  BarChart2, Settings, UserCheck,
  Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const MENUS = {
  secretaire: [
    { to: '/secretaire',            label: 'Accueil',  icon: LayoutDashboard },
    { to: '/secretaire/accueil',    label: 'File',     icon: Activity        },
    { to: '/secretaire/patients',   label: 'Patients', icon: Users           },
    { to: '/secretaire/agenda',     label: 'Agenda',   icon: Calendar        },
    { to: '/secretaire/caisse',     label: 'Caisse',   icon: CreditCard      },
  ],
  medecin: [
    { to: '/medecin',              label: 'Accueil',  icon: LayoutDashboard },
    { to: '/medecin/agenda',       label: 'Agenda',   icon: Calendar        },
    { to: '/medecin/consultation', label: 'Consult.', icon: Stethoscope     },
    { to: '/medecin/patients',     label: 'Patients', icon: Users           },
    { to: '/medecin/messagerie',   label: 'Messages', icon: MessageSquare   },
  ],
  patient: [
    { to: '/patient',             label: 'Accueil',    icon: LayoutDashboard },
    { to: '/patient/rdv',         label: 'Mes RDV',    icon: Calendar        },
    { to: '/patient/dossier',     label: 'Dossier',    icon: FileText        },
    { to: '/patient/ordonnances', label: 'Ordonnances',icon: ClipboardList   },
    { to: '/patient/factures',    label: 'Factures',   icon: CreditCard      },
    { to: '/patient/messagerie', label: 'Messages', icon: MessageSquare },
  ],
  admin: [
    { to: '/admin',              label: 'Accueil',  icon: LayoutDashboard },
    { to: '/admin/medecins',     label: 'Médecins', icon: UserCheck       },
    { to: '/admin/utilisateurs', label: 'Users',    icon: Users           },
    { to: '/admin/rapports',     label: 'Rapports', icon: BarChart2       },
    { to: '/admin/parametres',   label: 'Réglages', icon: Settings        },
  ],
}

export function BottomNav() {
  const { user } = useAuthStore()
  const role     = user?.role || 'patient'
  const liens    = MENUS[role] || []

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-border">
      <div className="flex items-center justify-around px-2 py-1.5">
        {liens.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${role}` || to === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-250
               ${isActive ? 'text-primary' : 'text-neutral-muted hover:text-neutral-text'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-250 ${isActive ? 'bg-primary-50' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-2xs font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav