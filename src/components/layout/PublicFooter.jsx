import { Link } from 'react-router-dom'
import {
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
} from 'lucide-react'
import { useClinicStore } from '../../store/clinicStore'

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
  const clinique = useClinicStore((s) => s.data)
  const telephoneHref = (clinique.telephone || '').replace(/[^\d+]/g, '')
  const whatsappHref = (clinique.whatsapp || '').replace(/[^\d]/g, '')

  const RESEAUX = [
    { Icon: Facebook,      url: clinique.facebook  },
    { Icon: Instagram,     url: clinique.instagram },
    { Icon: MessageCircle, url: whatsappHref ? `https://wa.me/${whatsappHref}` : '' },
    { Icon: Linkedin,      url: clinique.linkedin  },
  ].filter((r) => r.url)

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
                <p className="font-bold text-sm">{clinique.nomClinique || 'NovaCare Dakar'}</p>
                <p className="text-xs text-gray-400">Clinique digitale</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {clinique.slogan || "Excellence médicale et innovation digitale au service de votre santé en Afrique de l'Ouest."}
            </p>
            {RESEAUX.length > 0 && (
              <div className="flex gap-3">
                {RESEAUX.map(({ Icon, url }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
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
              {clinique.adresse && (
                <li className="flex items-start gap-2.5 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {clinique.adresse}
                </li>
              )}
              {clinique.telephone && (
                <li>
                  <a
                    href={`tel:${telephoneHref}`}
                    className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                    {clinique.telephone}
                  </a>
                </li>
              )}
              {clinique.email && (
                <li>
                  <a
                    href={`mailto:${clinique.email}`}
                    className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    {clinique.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {clinique.nomClinique || 'NovaCare Dakar'}. Tous droits réservés.</p>
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