import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stethoscope, Phone, Mail, MapPin,
  ArrowLeft, Send, Clock, CheckCircle,
} from 'lucide-react'

export default function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ nom: '', email: '', telephone: '', message: '' })
  const [envoye, setEnvoye]   = useState(false)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.nom || !form.message) return
    setEnvoye(true)
  }

  return (
    <div className="min-h-screen bg-neutral-bg font-sans">

      {/* Navbar */}
      <nav className="bg-white border-b border-neutral-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-text">NovaCare <span className="text-primary">Dakar</span></span>
          </button>
          <button onClick={() => navigate('/connexion')} className="btn-primary btn-sm">
            Espace patient
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-primary-200 text-lg">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Infos contact */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-text">Nos coordonnées</h2>

            {[
              { icon: MapPin, titre: 'Adresse',  info: 'Route de la Corniche, Plateau\nDakar, Sénégal' },
              { icon: Phone,  titre: 'Téléphone',info: '+221 33 800 12 34\n+221 77 000 12 34'           },
              { icon: Mail,   titre: 'Email',    info: 'contact@novacare.sn\nurgences@novacare.sn'      },
            ].map(({ icon: Icon, titre, info }) => (
              <div key={titre} className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-text">{titre}</p>
                  {info.split('\n').map((l) => (
                    <p key={l} className="text-sm text-neutral-muted">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Horaires */}
            <div className="card bg-primary-50 border-primary-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <p className="font-semibold text-primary">Horaires d'ouverture</p>
              </div>
              <div className="space-y-1 text-sm text-neutral-text">
                <p>Lundi — Vendredi : 08h00 — 20h00</p>
                <p>Samedi : 09h00 — 18h00</p>
                <p className="text-neutral-muted">Dimanche : Urgences uniquement</p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-neutral-text">Envoyer un message</h2>

            {envoye ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <p className="font-bold text-neutral-text text-lg">Message envoyé !</p>
                <p className="text-sm text-neutral-muted mt-2">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
                <button
                  onClick={() => { setEnvoye(false); setForm({ nom: '', email: '', telephone: '', message: '' }) }}
                  className="btn-outline mt-6"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="form-label">Nom complet *</label>
                  <input className="form-input" value={form.nom}
                    onChange={(e) => update('nom', e.target.value)}
                    placeholder="Moussa Diallo" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={form.telephone}
                    onChange={(e) => update('telephone', e.target.value)}
                    placeholder="+221 77 000 00 00" />
                </div>
                <div>
                  <label className="form-label">Message *</label>
                  <textarea className="form-input resize-none" rows={5}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="Comment pouvons-nous vous aider ?" />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!form.nom || !form.message}
                  className="btn-primary w-full"
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer minimal */}
            <footer className="bg-neutral-text text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white leading-none">Novacare</p>
                  <p className="text-xs text-white/50 leading-none mt-0.5">
                    Dakar
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Clinique médicale privée au service de votre santé depuis 2020.
              </p>
            </div>

            {/* Liens */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Navigation</p>
              <div className="space-y-2">
                {[
                  { label: "Accueil", to: "/" },
                  { label: "Services", to: "/services" },
                  { label: "Contact", to: "/contact" },
                  { label: "Connexion", to: "/connexion" },
                ].map(({ label, to }) => (
                  <button
                    key={to}
                    onClick={() => navigate(to)}
                    className="block text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Services</p>
              <div className="space-y-2">
                {[
                  "Consultations",
                  "Téléconsultation",
                  "Prise de RDV",
                  "Dossier médical",
                ].map((s) => (
                  <p key={s} className="text-sm text-white/60">
                    {s}
                  </p>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Contact</p>
              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Route de Lac Rose, Dakar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+221 70 982 25 61</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Lun–Sam : 8h–20h</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border-t border-white/10 pt-8 flex flex-col sm:flex-row
                          items-center justify-between gap-4"
          >
            <p className="text-xs text-white/40">
              © 2025 Novacare Dakar. Tous droits réservés.
            </p>
            <p className="text-xs text-white/40">
              Plateforme sécurisée · Données médicales protégées
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}