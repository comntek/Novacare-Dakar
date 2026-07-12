import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, Stethoscope, Calendar } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_REDIRECT } from '../../constants/roles'
import { useClinicStore } from '../../store/clinicStore'

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/equipe', label: 'Notre Équipe' },
  { to: '/blog', label: 'Blog Santé' },
  { to: '/urgences', label: 'Urgences' },
  { to: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const clinique = useClinicStore((s) => s.data)
  const telephoneHref = (clinique.telephone || '').replace(/[^\d+]/g, '')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleDashboard = () => {
    if (role && ROLE_REDIRECT[role]) {
      navigate(ROLE_REDIRECT[role])
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
    >
      {/* Top bar */}
      <div className="bg-primary text-white text-xs py-1.5 px-4 hidden md:flex items-center justify-between">
        <span>Bienvenue à la Clinique {clinique.nomClinique || 'NovaCare Dakar'} — {clinique.slogan || 'Excellence et confiance'}</span>
        <div className="flex items-center gap-4">
          {clinique.telephone && (
            <a
              href={`tel:${telephoneHref}`}
              className="flex items-center gap-1.5 hover:text-primary-200 transition-colors"
            >
              <Phone className="w-3 h-3" />
              {clinique.telephone}
            </a>
          )}
          <span>Lun–Sam : {clinique.horaires?.lundi?.debut || '8h'}–{clinique.horaires?.lundi?.fin || '20h'}</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-neutral-text text-sm leading-tight">
                {clinique.nomClinique || 'NovaCare Dakar'}
              </p>
              <p className="text-xs text-neutral-muted leading-tight">
                Clinique digitale
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-50'
                      : 'text-neutral-subtle hover:text-neutral-text hover:bg-neutral-bg'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={handleDashboard}
                className="btn-primary text-sm"
              >
                Mon espace
              </button>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="hidden sm:flex btn-ghost text-sm"
                >
                  Connexion
                </Link>
                <Link
                  to="/prise-rdv"
                  className="btn-accent text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Prendre RDV</span>
                  <span className="sm:hidden">RDV</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-bg text-neutral-subtle"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-border px-4 py-3 space-y-1 shadow-lg">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-50'
                    : 'text-neutral-subtle hover:bg-neutral-bg'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {!user && (
            <Link
              to="/connexion"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-subtle hover:bg-neutral-bg"
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export default PublicHeader