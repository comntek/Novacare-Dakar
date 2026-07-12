import { useNavigate } from 'react-router-dom'
import { Stethoscope, ArrowLeft } from 'lucide-react'

const SECTIONS = [
  {
    titre: '1. Objet',
    contenu: `Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et
l'utilisation de la plateforme NovaCare Dakar (le « Service »), éditée pour le compte de
cliniques privées d'Afrique de l'Ouest francophone. Toute création de compte ou utilisation
du Service implique l'acceptation pleine et entière des présentes CGU.`,
  },
  {
    titre: '2. Description du service',
    contenu: `NovaCare Dakar permet la prise de rendez-vous médicaux, la gestion de dossiers
patients, le suivi de consultations, la délivrance d'ordonnances, la facturation, la
messagerie interne entre professionnels de santé et patients, ainsi que la téléconsultation.
Le Service est proposé « en l'état » et peut évoluer sans préavis.`,
  },
  {
    titre: '3. Comptes utilisateurs',
    contenu: `L'accès à certaines fonctionnalités nécessite la création d'un compte. Quatre types
de comptes existent : patient, médecin, secrétaire et administrateur. Chaque utilisateur est
responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis
son compte. Toute suspicion d'utilisation frauduleuse doit être signalée sans délai à la
clinique.`,
  },
  {
    titre: '4. Prise de rendez-vous',
    contenu: `Les rendez-vous pris via le site (avec ou sans création de compte) constituent une
demande, non une confirmation automatique. Un membre de l'équipe peut contacter le visiteur
ou le patient pour confirmer, modifier ou annuler le rendez-vous selon les disponibilités
réelles.`,
  },
  {
    titre: '5. Téléconsultation',
    contenu: `La téléconsultation est un outil de suivi médical à distance et ne remplace pas une
consultation physique lorsque celle-ci est nécessaire. Elle n'est pas adaptée aux urgences
médicales : en cas d'urgence, contactez immédiatement le SAMU (15) ou rendez-vous aux
urgences les plus proches.`,
  },
  {
    titre: '6. Paiement',
    contenu: `Les paiements peuvent être effectués via Wave, Orange Money, espèces ou carte
bancaire selon les modalités proposées par la clinique. Les tarifs affichés sont donnés à
titre indicatif et peuvent varier selon la nature de la consultation.`,
  },
  {
    titre: '7. Contenu et propriété intellectuelle',
    contenu: `L'ensemble des éléments du Service (interface, textes, logo, articles de blog) est
protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée est
interdite.`,
  },
  {
    titre: '8. Responsabilité',
    contenu: `Les informations de santé publiées sur le blog ou dans le Service ont une vocation
informative générale et ne sauraient se substituer à un avis médical personnalisé. NovaCare
Dakar ne saurait être tenu responsable d'une interruption temporaire du Service, d'une perte
de connexion, ou d'un usage non conforme aux présentes CGU.`,
  },
  {
    titre: '9. Résiliation',
    contenu: `Tout utilisateur peut demander la clôture de son compte à tout moment en contactant
la clinique. La clinique se réserve le droit de suspendre ou clôturer un compte en cas
d'usage abusif ou frauduleux du Service.`,
  },
  {
    titre: '10. Droit applicable',
    contenu: `Les présentes CGU sont soumises au droit sénégalais. Tout litige relatif à leur
interprétation ou leur exécution relève de la compétence des juridictions sénégalaises
compétentes.`,
  },
  {
    titre: '11. Modification des CGU',
    contenu: `Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront
informés de toute modification substantielle. La poursuite de l'utilisation du Service après
modification vaut acceptation des nouvelles CGU.`,
  },
]

export default function ConditionsUtilisationPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-bg font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-neutral-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-text">
              NovaCare <span className="text-primary">Dakar</span>
            </span>
          </button>
          <button onClick={() => navigate('/inscription')} className="btn-primary btn-sm">
            Créer un compte
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-primary text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Conditions générales d'utilisation</h1>
          <p className="text-primary-200 text-sm">Dernière mise à jour : Juillet 2026</p>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {SECTIONS.map(({ titre, contenu }) => (
            <div key={titre} className="card">
              <h2 className="text-lg font-bold text-neutral-text mb-3">{titre}</h2>
              <p className="text-sm text-neutral-muted leading-relaxed whitespace-pre-line">
                {contenu}
              </p>
            </div>
          ))}

          <div className="card bg-primary-50 border border-primary-100">
            <p className="text-sm text-neutral-text">
              Une question sur ces conditions ? Contactez-nous à{' '}
              <span className="font-semibold text-primary">contact@novacare.sn</span> ou via
              notre{' '}
              <button onClick={() => navigate('/contact')} className="font-semibold text-primary underline">
                page de contact
              </button>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}