import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

export function genererDocumentPdf(doc, clinique) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const marge = 56
  let y = marge

  pdf.setFontSize(14)
  pdf.setFont(undefined, 'bold')
  pdf.text(clinique.nomClinique || 'NovaCare Dakar', marge, y)
  y += 18
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'normal')
  const infosLignes = [clinique.adresse, clinique.telephone, clinique.email].filter(Boolean)
  infosLignes.forEach((ligne) => { pdf.text(ligne, marge, y); y += 12 })

  y += 20
  pdf.setDrawColor(200)
  pdf.line(marge, y, 595 - marge, y)
  y += 30

  pdf.setFontSize(13)
  pdf.setFont(undefined, 'bold')
  pdf.text(doc.titre, marge, y)
  y += 10
  pdf.setFontSize(9)
  pdf.setFont(undefined, 'normal')
  pdf.setTextColor(120)
  pdf.text(`Patient : ${doc.patientNom}`, marge, y + 16)
  pdf.text(
    `Date : ${format(toDate(doc.dateCreation), 'dd MMMM yyyy', { locale: fr })}`,
    marge, y + 30
  )
  pdf.setTextColor(0)
  y += 55

  pdf.setFontSize(11)
  const lignes = pdf.splitTextToSize(doc.contenu, 595 - marge * 2)
  lignes.forEach((ligne) => {
    if (y > 780) { pdf.addPage(); y = marge }
    pdf.text(ligne, marge, y)
    y += 16
  })

  if (doc.signePar) {
    y += 30
    if (y > 760) { pdf.addPage(); y = marge }
    pdf.setFont(undefined, 'italic')
    pdf.setFontSize(10)
    pdf.text(
      `Signé électroniquement par ${doc.signePar} le ${format(toDate(doc.dateSignature), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
      marge, y
    )
  }

  pdf.save(`${doc.type}_${doc.patientNom.replace(/\s+/g, '_')}.pdf`)
}