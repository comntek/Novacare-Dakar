import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function calculerAge(dateNaissance) {
  if (!dateNaissance) return null
  return Math.floor(
    (Date.now() - toDate(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
}

/**
 * Génère un PDF d'ordonnance à partir d'une consultation (qui contient le
 * tableau `ordonnances`), des infos patient et des infos clinique.
 * Présentable directement à un pharmacien.
 */
export function genererOrdonnancePdf(consultation, patient, clinique) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const largeur = 595
  const marge = 56
  let y = marge

  // ── En-tête clinique ──────────────────────────────────
  pdf.setFontSize(15)
  pdf.setFont(undefined, 'bold')
  pdf.setTextColor(10, 92, 62) // vert médical NovaCare
  pdf.text(clinique.nomClinique || 'NovaCare Dakar', marge, y)
  pdf.setTextColor(0)
  y += 16

  pdf.setFontSize(9)
  pdf.setFont(undefined, 'normal')
  const infosClinique = [clinique.adresse, clinique.telephone, clinique.email].filter(Boolean)
  infosClinique.forEach((ligne) => { pdf.text(ligne, marge, y); y += 12 })

  y += 14
  pdf.setDrawColor(10, 92, 62)
  pdf.setLineWidth(1.2)
  pdf.line(marge, y, largeur - marge, y)
  pdf.setLineWidth(1)
  y += 34

  // ── Titre ──────────────────────────────────────────────
  pdf.setFontSize(16)
  pdf.setFont(undefined, 'bold')
  pdf.text('ORDONNANCE MÉDICALE', largeur / 2, y, { align: 'center' })
  y += 30

  // ── Bloc médecin / patient ────────────────────────────
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('Médecin', marge, y)
  pdf.text('Patient', largeur / 2 + 10, y)
  y += 14

  pdf.setFont(undefined, 'normal')
  const age = calculerAge(patient?.dateNaissance)
  const lignesMedecin = [
    consultation.medecinNom || '—',
  ]
  const lignesPatient = [
    consultation.patientNom || patient?.prenom + ' ' + patient?.nom || '—',
    age ? `${age} ans` : null,
    patient?.numeroDossier ? `Dossier ${patient.numeroDossier}` : null,
  ].filter(Boolean)

  const yDepart = y
  lignesMedecin.forEach((ligne) => { pdf.text(ligne, marge, y); y += 13 })
  let yPatient = yDepart
  lignesPatient.forEach((ligne) => { pdf.text(ligne, largeur / 2 + 10, yPatient); yPatient += 13 })
  y = Math.max(y, yPatient) + 10

  pdf.text(
    `Date : ${consultation.date ? format(toDate(consultation.date), 'dd MMMM yyyy', { locale: fr }) : '—'}`,
    marge, y
  )
  y += 30

  pdf.setDrawColor(200)
  pdf.line(marge, y, largeur - marge, y)
  y += 30

  // ── Médicaments ────────────────────────────────────────
  const ordonnances = consultation.ordonnances || []
  ordonnances.forEach((o, i) => {
    if (y > 740) { pdf.addPage(); y = marge }
    pdf.setFont(undefined, 'bold')
    pdf.setFontSize(11)
    pdf.text(`${i + 1}. ${o.medicament}`, marge, y)
    y += 15
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(90)
    const detail = [o.posologie, o.duree].filter(Boolean).join(' — ')
    if (detail) { pdf.text(detail, marge + 14, y); y += 14 }
    pdf.setTextColor(0)
    y += 10
  })

  y += 20
  if (y > 730) { pdf.addPage(); y = marge }

  // ── Signature ──────────────────────────────────────────
  pdf.setDrawColor(200)
  pdf.line(marge, y, largeur - marge, y)
  y += 24
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'italic')
  pdf.setTextColor(120)
  pdf.text(
    "Ordonnance à présenter au pharmacien. Ne pas dépasser les doses prescrites sans avis médical.",
    marge, y
  )
  y += 40
  pdf.setTextColor(0)
  pdf.setFont(undefined, 'normal')
  pdf.text(`${consultation.medecinNom || ''}`, largeur - marge, y, { align: 'right' })
  pdf.text('Signature', largeur - marge, y + 14, { align: 'right' })

  pdf.save(`ordonnance_${(consultation.patientNom || '').replace(/\s+/g, '_')}_${
    consultation.date ? format(toDate(consultation.date), 'yyyy-MM-dd') : 'date'
  }.pdf`)
}