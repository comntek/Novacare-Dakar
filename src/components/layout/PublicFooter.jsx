import { Link } from 'react-router-dom'
import {
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react'

const LINKS = {
  services: [
    { label: 'Cardiologie', to: '/services' },
    { label: 'Pédiatrie', to: '/services' },
    { label: 'Gynécologie', to: '/services' },
    { label: 'Médecine Générale', to: '/services' },
    { label: 'Téléconsultation', to: '/services' },
  ],
  pratique: [
    { label: 'Prendre RDV', to: '/prise-rdv' },
    { label: 'Notre équipe', to: '/equipe' },
    { label: 'Blog santé', to: '/blog' },
    { label: 'Urgences', to: '/urgences' },
    { label: 'Contact', to: '/contact' },
  ],
}

export function PublicFooter() {
  return (
    <footer className="bg-neutral-text text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">MediSync Pro</p>
                <p className="text-xs text-gray-400">Clinique digitale</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Excellence médicale et innovation digitale au service de votre santé en Afrique de l'Ouest.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">
              Nos Services
            </h3>
            <ul className="space-y-2">
              {LINKS.services.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pratique */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">
              Infos pratiques
            </h3>
            <ul className="space-y-2">
              {LINKS.pratique.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                Route de la Corniche, Plateau, Dakar, Sénégal
              </li>
              <li>
                <a
                  href="tel:+221338001234"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  +221 33 800 12 34
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@medisync.sn"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  contact@medisync.sn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MediSync Pro. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-white transition-colors">
              CGU
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter