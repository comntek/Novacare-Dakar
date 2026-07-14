import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function formaterDate(val, motif = '—') {
  const d = toDate(val)
  return d ? format(d, 'dd MMMM yyyy', { locale: fr }) : motif
}

function calculerAge(dateNaissance) {
  if (!dateNaissance) return null
  return Math.floor(
    (Date.now() - toDate(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
}

const LABELS_HABITUDE = { non: 'Non', occasionnel: 'Occasionnel', quotidien: 'Quotidien', regulier: 'Régulier' }

/**
 * Génère le dossier médical complet d'un patient en PDF :
 * identité, questionnaire santé, vaccins, historique de consultations
 * (avec constantes et ordonnances), examens, documents.
 */
export function genererDossierCompletPdf({ patient, consultations = [], examens = [], documents = [], clinique = {} }) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const largeur = 595
  const hauteur = 842
  const marge = 50
  let y = marge

  const sautDePage = (seuil = 780) => {
    if (y > seuil) { pdf.addPage(); y = marge; return true }
    return false
  }

  const titreSection = (texte) => {
    sautDePage(770)
    y += 10
    pdf.setDrawColor(10, 92, 62)
    pdf.setLineWidth(1)
    pdf.line(marge, y, largeur - marge, y)
    y += 18
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(10, 92, 62)
    pdf.text(texte, marge, y)
    pdf.setTextColor(0)
    y += 16
  }

  const ligneChampValeur = (champs) => {
    pdf.setFontSize(9.5)
    champs.forEach(([label, valeur]) => {
      if (!valeur) return
      sautDePage()
      pdf.setFont(undefined, 'bold')
      pdf.text(`${label} :`, marge, y)
      pdf.setFont(undefined, 'normal')
      pdf.text(String(valeur), marge + 110, y)
      y += 14
    })
  }

  const puces = (items) => {
    pdf.setFontSize(9.5)
    pdf.setFont(undefined, 'normal')
    items.forEach((item) => {
      sautDePage()
      const lignes = pdf.splitTextToSize(`•  ${item}`, largeur - marge * 2 - 10)
      lignes.forEach((l) => { pdf.text(l, marge + 4, y); y += 13 })
    })
  }

  const paragraphe = (texte, taille = 9.5) => {
    pdf.setFontSize(taille)
    pdf.setFont(undefined, 'normal')
    const lignes = pdf.splitTextToSize(texte, largeur - marge * 2)
    lignes.forEach((l) => {
      sautDePage()
      pdf.text(l, marge, y)
      y += 13
    })
  }

  // ── En-tête clinique ───────────────────────────────────
  pdf.setFontSize(15)
  pdf.setFont(undefined, 'bold')
  pdf.setTextColor(10, 92, 62)
  pdf.text(clinique.nomClinique || 'NovaCare Dakar', marge, y)
  pdf.setTextColor(0)
  y += 16
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'normal')
  const infosClinique = [clinique.adresse, clinique.telephone, clinique.email].filter(Boolean)
  infosClinique.forEach((l) => { pdf.text(l, marge, y); y += 12 })

  y += 16
  pdf.setFontSize(17)
  pdf.setFont(undefined, 'bold')
  pdf.text('DOSSIER MÉDICAL COMPLET', largeur / 2, y, { align: 'center' })
  y += 14
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'normal')
  pdf.setTextColor(120)
  pdf.text(`Édité le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, largeur / 2, y, { align: 'center' })
  pdf.setTextColor(0)
  y += 10

  // ── Identité ────────────────────────────────────────────
  titreSection('Identité et informations administratives')
  const age = calculerAge(patient.dateNaissance)
  ligneChampValeur([
    ['Nom complet', `${patient.prenom || ''} ${patient.nom || ''}`.trim()],
    ['N° de dossier', patient.numeroDossier],
    ['Date de naissance', patient.dateNaissance ? formaterDate(patient.dateNaissance) : null],
    ['Âge', age ? `${age} ans` : null],
    ['Sexe', patient.sexe],
    ['Groupe sanguin', patient.groupeSanguin],
    ['Téléphone', patient.telephone],
    ['Email', patient.email],
    ['Adresse', patient.adresse],
    ['Assurance', patient.assurance],
    ['Médecin référent', patient.medecinReferentNom],
  ])
  if (patient.statutDossier === 'en_attente_validation') {
    y += 4
    pdf.setFont(undefined, 'italic')
    pdf.setFontSize(9)
    pdf.setTextColor(180, 100, 0)
    paragraphe("⚠ Des modifications proposées par le patient sont en attente de validation par le médecin référent — non reflétées ci-dessus.", 9)
    pdf.setTextColor(0)
  }

  // ── Questionnaire santé ─────────────────────────────────
  titreSection('Questionnaire santé')

  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  sautDePage()
  pdf.text('Allergies', marge, y)
  y += 14
  patient.allergies?.length > 0 ? puces(patient.allergies) : paragraphe('Aucune allergie connue.')
  y += 6

  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  sautDePage()
  pdf.text('Antécédents médicaux et chirurgicaux', marge, y)
  y += 14
  patient.antecedents?.length > 0 ? puces(patient.antecedents) : paragraphe('Aucun antécédent renseigné.')
  y += 6

  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  sautDePage()
  pdf.text('Maladies chroniques déjà connues', marge, y)
  y += 14
  patient.maladiesChroniques?.length > 0 ? puces(patient.maladiesChroniques) : paragraphe('Aucune maladie chronique renseignée.')
  y += 6

  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  sautDePage()
  pdf.text('Traitements habituels', marge, y)
  y += 14
  patient.traitementsHabituels?.length > 0 ? puces(patient.traitementsHabituels) : paragraphe('Aucun traitement habituel renseigné.')
  y += 6

  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  sautDePage()
  pdf.text('Habitudes de vie', marge, y)
  y += 14
  ligneChampValeur([
    ['Tabac', LABELS_HABITUDE[patient.habitudesVie?.tabac] || null],
    ['Alcool', LABELS_HABITUDE[patient.habitudesVie?.alcool] || null],
  ])
  if (patient.habitudesVie?.autres) paragraphe(patient.habitudesVie.autres)

  // ── Vaccins ─────────────────────────────────────────────
  titreSection('Vaccins')
  if (patient.vaccins?.length > 0) {
    puces(patient.vaccins.map((v) => `${v.nom} — ${v.date ? formaterDate(v.date) : 'date inconnue'}`))
  } else {
    paragraphe('Aucun vaccin enregistré.')
  }

  // ── Historique des consultations ───────────────────────
  titreSection('Historique des consultations')
  const consultationsTriees = [...consultations].sort((a, b) => new Date(b.date) - new Date(a.date))
  if (consultationsTriees.length === 0) {
    paragraphe('Aucune consultation enregistrée.')
  } else {
    consultationsTriees.forEach((c) => {
      sautDePage(740)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(10)
      pdf.text(`${formaterDate(c.date)} — ${c.medecinNom || ''}`, marge, y)
      y += 14
      ligneChampValeur([
        ['Motif', c.motif],
        ['Diagnostic', c.diagnostic],
        ['Traitement', c.planTraitement],
      ])
      if (c.constantes && Object.values(c.constantes).some(Boolean)) {
        const cst = c.constantes
        const detail = [
          cst.poids && `Poids ${cst.poids} kg`,
          cst.taille && `Taille ${cst.taille} cm`,
          cst.tension && `Tension ${cst.tension}`,
          cst.temperature && `Temp. ${cst.temperature} °C`,
          cst.pouls && `Pouls ${cst.pouls} bpm`,
        ].filter(Boolean).join(' · ')
        if (detail) { paragraphe(`Constantes : ${detail}`) }
      }
      if (c.ordonnances?.length > 0) {
        pdf.setFont(undefined, 'italic')
        pdf.setFontSize(9)
        sautDePage()
        pdf.text('Ordonnance :', marge, y)
        y += 13
        puces(c.ordonnances.map((o) => [o.medicament, o.duree].filter(Boolean).join(' — ')))
      }
      y += 12
    })
  }

  // ── Examens ─────────────────────────────────────────────
  titreSection('Examens')
  if (examens.length === 0) {
    paragraphe('Aucun examen prescrit.')
  } else {
    examens.forEach((ex) => {
      sautDePage(750)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(10)
      pdf.text(`${ex.designation} (${ex.type})`, marge, y)
      y += 13
      ligneChampValeur([
        ['Prescrit le', formaterDate(ex.datePrescription)],
        ['Statut', ex.statut === 'resultat_disponible' ? 'Résultat disponible' : 'En attente'],
      ])
      if (ex.resultat) paragraphe(`Résultat : ${ex.resultat}`)
      if (ex.commentaireMedecin) paragraphe(`Commentaire : ${ex.commentaireMedecin}`)
      y += 8
    })
  }

  // ── Documents ───────────────────────────────────────────
  titreSection('Documents (certificats, comptes rendus)')
  if (documents.length === 0) {
    paragraphe('Aucun document.')
  } else {
    documents.forEach((d) => {
      sautDePage(730)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(10)
      pdf.text(d.titre, marge, y)
      y += 13
      ligneChampValeur([
        ['Date', formaterDate(d.dateCreation)],
        ['Signé par', d.signePar],
      ])
      paragraphe(d.contenu)
      y += 8
    })
  }

  // ── Numérotation des pages ──────────────────────────────
  const total = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(150)
    pdf.text(`Page ${i}/${total}`, largeur - marge, hauteur - 24, { align: 'right' })
    pdf.text('Document confidentiel — usage médical', marge, hauteur - 24)
  }

  pdf.save(`dossier_complet_${`${patient.prenom}_${patient.nom}`.replace(/\s+/g, '_')}.pdf`)
}