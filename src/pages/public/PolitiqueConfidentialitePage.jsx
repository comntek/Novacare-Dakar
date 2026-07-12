import { useNavigate } from 'react-router-dom'
import { Stethoscope, ArrowLeft, ShieldCheck } from 'lucide-react'

const SECTIONS = [
  {
    titre: '1. Responsable du traitement',
    contenu: `NovaCare Dakar, plateforme de gestion clinique, est responsable du traitement des
données personnelles collectées via le Service, pour le compte de la clinique qui l'exploite.`,
  },
  {
    titre: '2. Données collectées',
    contenu: `Selon votre utilisation du Service, nous collectons : des données d'identité
(nom, prénom, date de naissance, sexe), des données de contact (téléphone, email, adresse),
et, pour les patients, des données de santé (allergies, antécédents, diagnostics, ordonnances,
groupe sanguin). Les données de santé constituent une catégorie de données sensibles et
bénéficient d'une protection renforcée.`,
  },
  {
    titre: '3. Finalités du traitement',
    contenu: `Vos données sont utilisées pour : la gestion de vos rendez-vous et de votre dossier
médical, la coordination des soins entre professionnels de santé, la facturation, l'envoi de
communications liées au suivi médical, et l'amélioration du Service. Aucune donnée n'est
utilisée à des fins publicitaires ou revendue à des tiers.`,
  },
  {
    titre: '4. Base légale',
    contenu: `Le traitement de vos données repose sur votre consentement (création de compte,
prise de rendez-vous) et sur l'exécution de la relation de soin entre vous et la clinique.`,
  },
  {
    titre: '5. Qui a accès à vos données',
    contenu: `Seuls les professionnels de santé et le personnel administratif directement
impliqués dans votre parcours de soin (votre médecin référent, le secrétariat, l'administration
de la clinique) ont accès à votre dossier, selon des droits d'accès définis par votre rôle et
votre relation avec vous. NovaCare Dakar ne partage aucune donnée de santé avec des tiers à des
fins commerciales.`,
  },
  {
    titre: '6. Hébergement et sécurité',
    contenu: `Vos données sont hébergées chez Supabase, un prestataire d'infrastructure cloud
qui applique des mesures de sécurité techniques (chiffrement, contrôle d'accès par
autorisations) pour protéger les données stockées. L'accès à votre dossier est protégé par
authentification et des règles de sécurité au niveau de la base de données garantissant que
chaque utilisateur ne voit que les informations auxquelles il a droit.`,
  },
  {
    titre: '7. Durée de conservation',
    contenu: `Vos données sont conservées pendant la durée nécessaire à votre suivi médical et
aux obligations légales de conservation des dossiers médicaux applicables au Sénégal. Vous
pouvez demander la suppression de votre compte à tout moment, sous réserve des obligations de
conservation légale des données de santé.`,
  },
  {
    titre: '8. Vos droits',
    contenu: `Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la protection des données
à caractère personnel et aux textes applicables au Sénégal, vous disposez d'un droit d'accès,
de rectification, d'opposition et de suppression de vos données. Pour exercer ces droits,
contactez-nous à l'adresse indiquée ci-dessous.`,
  },
  {
    titre: '9. Cookies',
    contenu: `Le Service utilise uniquement des cookies techniques nécessaires au
fonctionnement de votre session (maintien de la connexion). Aucun cookie publicitaire ou de
traçage tiers n'est utilisé.`,
  },
  {
    titre: '10. Modification de cette politique',
    contenu: `Cette politique de confidentialité peut être mise à jour. Toute modification
substantielle vous sera communiquée. La date de dernière mise à jour figure en haut de cette
page.`,
  },
]

export default function PolitiqueConfidentialitePage() {
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
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Politique de confidentialité</h1>
          <p className="text-primary-200 text-sm">Dernière mise à jour : Juillet 2026</p>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="card bg-info-50 border border-info-100">
            <p className="text-sm text-neutral-text leading-relaxed">
              Vos données de santé sont sensibles. Nous les traitons avec la même rigueur que
              votre dossier médical papier : accès restreint aux seules personnes impliquées
              dans votre suivi, et jamais de partage à des fins commerciales.
            </p>
          </div>

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
              Pour exercer vos droits ou poser une question, contactez-nous à{' '}
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