import { supabase } from './supabase'

// ══════════════════════════════════════════════════════════
// Mappers — la base Postgres utilise snake_case, l'app camelCase.
// ══════════════════════════════════════════════════════════

const mapUtilisateur = (row) =>
  row && {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    role: row.role,
    actif: row.actif,
    specialite: row.specialite,
    tarif: row.tarif,
    telephone: row.telephone,
    disponibilites: row.disponibilites,
    dateCreation: row.date_creation,
  }

const mapPatient = (row) =>
  row && {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    dateNaissance: row.date_naissance,
    sexe: row.sexe,
    groupeSanguin: row.groupe_sanguin,
    telephone: row.telephone,
    email: row.email,
    adresse: row.adresse,
    numeroDossier: row.numero_dossier,
    allergies: row.allergies || [],
    antecedents: row.antecedents || [],
    vaccins: row.vaccins || [],
    maladiesChroniques: row.maladies_chroniques || [],
    traitementsHabituels: row.traitements_habituels || [],
    habitudesVie: row.habitudes_vie || {},
    donneesEnAttente: row.donnees_en_attente || null,
    statutDossier: row.statut_dossier,
    validePar: row.valide_par,
    valideLe: row.valide_le,
    assurance: row.assurance,
    medecinReferentId: row.medecin_referent_id,
    medecinReferentNom: row.medecin_referent_nom,
    source: row.source,
    dateCreation: row.date_creation,
    dateMiseAJour: row.date_mise_a_jour,
  }

const patientToRow = (data) => {
  const row = {}
  const map = {
    prenom: 'prenom', nom: 'nom', dateNaissance: 'date_naissance', sexe: 'sexe',
    groupeSanguin: 'groupe_sanguin', telephone: 'telephone', email: 'email',
    adresse: 'adresse', numeroDossier: 'numero_dossier', allergies: 'allergies',
    antecedents: 'antecedents', vaccins: 'vaccins', assurance: 'assurance',
    maladiesChroniques: 'maladies_chroniques', traitementsHabituels: 'traitements_habituels',
    habitudesVie: 'habitudes_vie', donneesEnAttente: 'donnees_en_attente',
    statutDossier: 'statut_dossier', validePar: 'valide_par', valideLe: 'valide_le',
    medecinReferentId: 'medecin_referent_id', medecinReferentNom: 'medecin_referent_nom',
    source: 'source',
  }
  Object.entries(map).forEach(([js, col]) => {
    if (data[js] !== undefined) row[col] = data[js]
  })
  return row
}

const mapRdv = (row) =>
  row && {
    id: row.id,
    patientId: row.patient_id,
    patientNom: row.patient_nom,
    patientPrenom: row.patient_prenom,
    patientNomFamille: row.patient_nom_famille,
    patientEmail: row.patient_email,
    patientTelephone: row.patient_telephone,
    medecinId: row.medecin_id,
    medecinNom: row.medecin_nom,
    date: row.date,
    heure: row.heure,
    motif: row.motif,
    notes: row.notes,
    type: row.type,
    statut: row.statut,
    patientNonInscrit: row.patient_non_inscrit,
    source: row.source,
    dateCreation: row.date_creation,
    dateMiseAJour: row.date_mise_a_jour,
  }

const rdvToRow = (data) => {
  const row = {}
  const map = {
    patientId: 'patient_id', patientNom: 'patient_nom', patientPrenom: 'patient_prenom',
    patientNomFamille: 'patient_nom_famille', patientEmail: 'patient_email',
    patientTelephone: 'patient_telephone', medecinId: 'medecin_id', medecinNom: 'medecin_nom',
    date: 'date', heure: 'heure', motif: 'motif', notes: 'notes', type: 'type',
    statut: 'statut', patientNonInscrit: 'patient_non_inscrit', source: 'source',
  }
  Object.entries(map).forEach(([js, col]) => {
    if (data[js] !== undefined) row[col] = data[js]
  })
  return row
}

const mapConsultation = (row) =>
  row && {
    id: row.id,
    patientId: row.patient_id,
    patientNom: row.patient_nom,
    patientAge: row.patient_age,
    medecinId: row.medecin_id,
    medecinNom: row.medecin_nom,
    date: row.date,
    motif: row.motif,
    examenClinique: row.examen_clinique,
    diagnostic: row.diagnostic,
    planTraitement: row.plan_traitement,
    ordonnances: row.ordonnances || [],
    constantes: row.constantes || {},
    statut: row.statut,
    dateCreation: row.date_creation,
    dateMiseAJour: row.date_mise_a_jour,
  }

const consultationToRow = (data) => {
  const row = {}
  const map = {
    patientId: 'patient_id', patientNom: 'patient_nom', patientAge: 'patient_age',
    medecinId: 'medecin_id',
    medecinNom: 'medecin_nom', date: 'date', motif: 'motif',
    examenClinique: 'examen_clinique', diagnostic: 'diagnostic',
    planTraitement: 'plan_traitement', ordonnances: 'ordonnances',
    constantes: 'constantes', statut: 'statut',
  }
  Object.entries(map).forEach(([js, col]) => {
    if (data[js] !== undefined) row[col] = data[js]
  })
  return row
}

const mapFacture = (row) =>
  row && {
    id: row.id,
    patientId: row.patient_id,
    patientNom: row.patient_nom,
    service: row.service,
    montant: row.montant,
    statut: row.statut,
    modePaiement: row.mode_paiement,
    dateCreation: row.date_creation,
    datePaiement: row.date_paiement,
  }

const mapConversation = (row) =>
  row && {
    id: row.id,
    participants: [row.participant_1, row.participant_2],
    dernierMessage: row.dernier_message,
    dernierMessageDate: row.dernier_message_date,
    nonLus: row.non_lus || {},
    dateCreation: row.date_creation,
  }

const mapMessage = (row) =>
  row && {
    id: row.id,
    conversationId: row.conversation_id,
    expediteurId: row.expediteur_id,
    expediteurNom: row.expediteur_nom,
    destinataireId: row.destinataire_id,
    texte: row.texte,
    dateEnvoi: row.date_envoi,
  }

const mapClinique = (row) =>
  row && {
    nomClinique: row.nom_clinique,
    slogan: row.slogan,
    adresse: row.adresse,
    telephone: row.telephone,
    telephone2: row.telephone_2,
    email: row.email,
    siteWeb: row.site_web,
    ninea: row.ninea,
    horaires: row.horaires,
    couleurPrimaire: row.couleur_primaire,
    couleurSecondaire: row.couleur_secondaire,
    logoUrl: row.logo_url,
    facebook: row.facebook,
    instagram: row.instagram,
    whatsapp: row.whatsapp,
    linkedin: row.linkedin,
    dateMiseAJour: row.date_mise_a_jour,
  }

const mapArticle = (row) =>
  row && {
    id: row.id,
    titre: row.titre,
    categorie: row.categorie,
    resume: row.resume,
    contenu: row.contenu,
    publie: row.publie,
    auteur: row.auteur,
    auteurId: row.auteur_id,
    datePublication: row.date_publication,
    dateMiseAJour: row.date_mise_a_jour,
  }

// ══════════════════════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════════════════════

export const getPatients = async () => {
  // Un utilisateur qui s'est inscrit via /inscription obtient une fiche
  // `patients` (id = son uid Auth). S'il est ensuite promu admin/médecin/
  // secrétaire, cette fiche reste en base mais ne doit plus apparaître
  // dans les listes de patients — sinon le personnel se voit lui-même
  // (ou d'autres membres du personnel) listé comme patient.
  const [{ data: patients, error: errP }, { data: staff, error: errU }] = await Promise.all([
    supabase.from('patients').select('*'),
    supabase.from('utilisateurs').select('id').neq('role', 'patient'),
  ])
  if (errP) throw errP
  if (errU) throw errU
  const staffIds = new Set((staff || []).map((u) => u.id))
  return patients.filter((p) => !staffIds.has(p.id)).map(mapPatient)
}

export const getPatientById = async (id) => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return mapPatient(data)
}

export const getPatientsByMedecin = async (medecinId) => {
  const [{ data: patients, error: errP }, { data: staff, error: errU }] = await Promise.all([
    supabase.from('patients').select('*').eq('medecin_referent_id', medecinId),
    supabase.from('utilisateurs').select('id').neq('role', 'patient'),
  ])
  if (errP) throw errP
  if (errU) throw errU
  const staffIds = new Set((staff || []).map((u) => u.id))
  return patients.filter((p) => !staffIds.has(p.id)).map(mapPatient)
}

export const createPatient = async (data) => {
  const { data: inserted, error } = await supabase
    .from('patients')
    .insert(patientToRow(data))
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updatePatient = async (id, data) => {
  const { error } = await supabase
    .from('patients')
    .update({ ...patientToRow(data), date_mise_a_jour: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// RENDEZ-VOUS
// ══════════════════════════════════════════════════════════

export const getRdvs = async () => {
  const { data, error } = await supabase.from('rendezvous').select('*').order('date', { ascending: true })
  if (error) throw error
  return data.map(mapRdv)
}

export const getRdvsByMedecin = async (medecinId) => {
  const { data, error } = await supabase
    .from('rendezvous')
    .select('*')
    .eq('medecin_id', medecinId)
    .order('date', { ascending: true })
  if (error) throw error
  return data.map(mapRdv)
}

export const getRdvsByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from('rendezvous')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: true })
  if (error) throw error
  return data.map(mapRdv)
}

export const createRdv = async (data) => {
  const statut = data.patientNonInscrit ? 'en_attente' : (data.statut || 'confirme')
  const { data: inserted, error } = await supabase
    .from('rendezvous')
    .insert({ ...rdvToRow(data), statut })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updateStatutRdv = async (id, statut) => {
  const { error } = await supabase
    .from('rendezvous')
    .update({ statut, date_mise_a_jour: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export const updateRdv = async (id, data) => {
  const { error } = await supabase
    .from('rendezvous')
    .update({ ...rdvToRow(data), date_mise_a_jour: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export const deleteRdv = async (id) => {
  const { error } = await supabase
    .from('rendezvous')
    .update({ statut: 'annule', date_mise_a_jour: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export const getRdvsSite = async () => {
  const { data, error } = await supabase
    .from('rendezvous')
    .select('*')
    .eq('patient_non_inscrit', true)
    .order('date_creation', { ascending: false })
  if (error) throw error
  return data.map(mapRdv)
}

export const confirmerRdvSite = async (id, data) => {
  const { error } = await supabase
    .from('rendezvous')
    .update({
      ...rdvToRow(data),
      statut: 'confirme',
      patient_non_inscrit: false,
      date_mise_a_jour: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export const ecouterRdvsDuJour = (callback) => {
  const aujourdHui = new Date().toISOString().slice(0, 10)

  const charger = async () => {
    const { data, error } = await supabase
      .from('rendezvous')
      .select('*')
      .eq('date', aujourdHui)
      .order('date', { ascending: true })
    if (!error) callback(data.map(mapRdv))
  }

  charger()

  const channel = supabase
    .channel(`rdv-du-jour-${aujourdHui}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rendezvous' }, charger)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════════════════════
// CONSULTATIONS
// ══════════════════════════════════════════════════════════

export const getConsultationsByMedecin = async (medecinId) => {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('medecin_id', medecinId)
    .order('date', { ascending: false })
  if (error) throw error
  return data.map(mapConsultation)
}

export const getConsultationsByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
  if (error) throw error
  return data.map(mapConsultation)
}

export const createConsultation = async (data) => {
  const { data: inserted, error } = await supabase
    .from('consultations')
    .insert({ ...consultationToRow(data), statut: 'en_cours' })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updateConsultation = async (id, data) => {
  const { error } = await supabase
    .from('consultations')
    .update({ ...consultationToRow(data), date_mise_a_jour: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// FACTURES
// ══════════════════════════════════════════════════════════

export const getFactures = async () => {
  const { data, error } = await supabase
    .from('factures')
    .select('*')
    .order('date_creation', { ascending: false })
  if (error) throw error
  return data.map(mapFacture)
}

export const getFacturesByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from('factures')
    .select('*')
    .eq('patient_id', patientId)
    .order('date_creation', { ascending: false })
  if (error) throw error
  return data.map(mapFacture)
}

export const createFacture = async (data) => {
  const { data: inserted, error } = await supabase
    .from('factures')
    .insert({
      patient_id: data.patientId,
      patient_nom: data.patientNom,
      service: data.service,
      montant: data.montant,
      statut: 'impayee',
    })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const payerFacture = async (id, modePaiement) => {
  const { error } = await supabase
    .from('factures')
    .update({ statut: 'payee', mode_paiement: modePaiement, date_paiement: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// MESSAGERIE
// ══════════════════════════════════════════════════════════

export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('dernier_message_date', { ascending: false })
  if (error) throw error

  const conversations = data.map(mapConversation)

  const enrichies = await Promise.all(
    conversations.map(async (conv) => {
      const interlocuteurId = conv.participants.find((p) => p !== userId)
      if (!interlocuteurId) {
        return { ...conv, nomInterlocuteur: 'Inconnu', nonLusCount: conv.nonLus?.[userId] || 0 }
      }

      const { data: interlocuteur } = await supabase
        .from('utilisateurs')
        .select('prenom, nom, role')
        .eq('id', interlocuteurId)
        .maybeSingle()

      if (interlocuteur) {
        const prefix = interlocuteur.role === 'medecin' ? 'Dr. ' : ''
        return {
          ...conv,
          interlocuteurId,
          nomInterlocuteur: `${prefix}${interlocuteur.prenom} ${interlocuteur.nom}`,
          roleInterlocuteur: interlocuteur.role,
          nonLusCount: conv.nonLus?.[userId] || 0,
        }
      }

      return {
        ...conv,
        interlocuteurId,
        nomInterlocuteur: 'Utilisateur inconnu',
        nonLusCount: conv.nonLus?.[userId] || 0,
      }
    })
  )

  return enrichies
}

export const ecouterMessages = (conversationId, callback) => {
  const charger = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('date_envoi', { ascending: true })
    if (!error) callback(data.map(mapMessage))
  }

  charger()

  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      charger
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export const envoyerMessage = async (conversationId, data) => {
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    expediteur_id: data.expediteurId,
    expediteur_nom: data.expediteurNom,
    destinataire_id: data.destinataireId,
    texte: data.texte,
  })
  if (msgError) throw msgError

  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('non_lus')
    .eq('id', conversationId)
    .single()
  if (convError) throw convError

  const nonLus = { ...(conv.non_lus || {}), [data.destinataireId]: true }

  const { error: updateError } = await supabase
    .from('conversations')
    .update({
      dernier_message: data.texte,
      dernier_message_date: new Date().toISOString(),
      non_lus: nonLus,
    })
    .eq('id', conversationId)
  if (updateError) throw updateError
}

export const marquerCommeLu = async (conversationId, userId) => {
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('non_lus')
    .eq('id', conversationId)
    .single()
  if (convError) throw convError

  const nonLus = { ...(conv.non_lus || {}), [userId]: 0 }

  const { error } = await supabase.from('conversations').update({ non_lus: nonLus }).eq('id', conversationId)
  if (error) throw error
}

export const creerOuOuvrirConversation = async (user1Id, user2Id) => {
  const { data: existantes, error } = await supabase
    .from('conversations')
    .select('id, participant_1, participant_2')
    .or(`participant_1.eq.${user1Id},participant_2.eq.${user1Id}`)
  if (error) throw error

  const existante = existantes.find(
    (c) =>
      (c.participant_1 === user1Id && c.participant_2 === user2Id) ||
      (c.participant_1 === user2Id && c.participant_2 === user1Id)
  )
  if (existante) return existante.id

  const { data: inserted, error: insertError } = await supabase
    .from('conversations')
    .insert({
      participant_1: user1Id,
      participant_2: user2Id,
      dernier_message: '',
      non_lus: {},
    })
    .select('id')
    .single()
  if (insertError) throw insertError
  return inserted.id
}

// ══════════════════════════════════════════════════════════
// UTILISATEURS & MÉDECINS
// ══════════════════════════════════════════════════════════

export const getUtilisateurs = async () => {
  const { data, error } = await supabase.from('utilisateurs').select('*, specialites(nom), cabinets(nom)')
  if (error) throw error
  return data.map(mapUtilisateur)
}

export const getUtilisateurById = async (id) => {
  const { data, error } = await supabase.from('utilisateurs').select('*, specialites(nom), cabinets(nom)').eq('id', id).maybeSingle()
  if (error) throw error
  return mapUtilisateur(data)
}

export const getMedecins = async () => {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('role', 'medecin')
    .eq('actif', true)
  if (error) throw error
  return data.map(mapUtilisateur)
}

export const getSecretaires = async () => {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('role', 'secretaire')
    .eq('actif', true)
  if (error) throw error
  return data.map(mapUtilisateur)
}

export const updateUtilisateur = async (id, data) => {
  const payload = {}
  ;['prenom', 'nom', 'telephone', 'role', 'actif', 'specialite', 'tarif', 'disponibilites'].forEach(
    (champ) => {
      if (data[champ] !== undefined) payload[champ] = data[champ]
    }
  )
  const { error } = await supabase.from('utilisateurs').update(payload).eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// ARTICLES BLOG
// ══════════════════════════════════════════════════════════

export const getArticlesPublies = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('publie', true)
    .order('date_publication', { ascending: false })
  if (error) throw error
  return data.map(mapArticle)
}

export const getArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('date_publication', { ascending: false })
  if (error) throw error
  return data.map(mapArticle)
}

export const createArticle = async (data) => {
  const { data: inserted, error } = await supabase
    .from('articles')
    .insert({
      titre: data.titre,
      categorie: data.categorie,
      resume: data.resume,
      contenu: data.contenu,
      publie: data.publie ?? false,
      auteur: data.auteur,
      auteur_id: data.auteurId,
    })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updateArticle = async (id, data) => {
  const payload = { date_mise_a_jour: new Date().toISOString() }
  const map = { titre: 'titre', categorie: 'categorie', resume: 'resume', contenu: 'contenu', publie: 'publie' }
  Object.entries(map).forEach(([js, col]) => {
    if (data[js] !== undefined) payload[col] = data[js]
  })
  const { error } = await supabase.from('articles').update(payload).eq('id', id)
  if (error) throw error
}

export const deleteArticle = async (id) => {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// CLINIQUE  (config globale, une seule ligne — id fixe = 1)
// Lue par toutes les pages publiques + écrite depuis Admin > Paramètres.
// ══════════════════════════════════════════════════════════

export const getClinique = async () => {
  const { data, error } = await supabase.from('clinique').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return mapClinique(data)
}

export const updateClinique = async (data) => {
  const payload = { date_mise_a_jour: new Date().toISOString() }
  const map = {
    nomClinique: 'nom_clinique',
    slogan: 'slogan',
    adresse: 'adresse',
    telephone: 'telephone',
    telephone2: 'telephone_2',
    email: 'email',
    siteWeb: 'site_web',
    ninea: 'ninea',
    horaires: 'horaires',
    couleurPrimaire: 'couleur_primaire',
    couleurSecondaire: 'couleur_secondaire',
    logoUrl: 'logo_url',
    facebook: 'facebook',
    instagram: 'instagram',
    whatsapp: 'whatsapp',
    linkedin: 'linkedin',
  }
  Object.entries(map).forEach(([js, col]) => {
    if (data[js] !== undefined) payload[col] = data[js]
  })
  const { error } = await supabase.from('clinique').update(payload).eq('id', 1)
  if (error) throw error
  return getClinique()
}
// ══════════════════════════════════════════════════════════
// SPÉCIALITÉS
// ══════════════════════════════════════════════════════════

const mapSpecialite = (row) =>
  row && {
    id: row.id,
    nom: row.nom,
    description: row.description,
    actif: row.actif,
    ordre: row.ordre,
    dateCreation: row.date_creation,
  }

export const getSpecialites = async () => {
  const { data, error } = await supabase
    .from('specialites')
    .select('*')
    .order('ordre', { ascending: true })
  if (error) throw error
  return data.map(mapSpecialite)
}

export const createSpecialite = async (data) => {
  const { data: inserted, error } = await supabase
    .from('specialites')
    .insert({
      nom: data.nom,
      description: data.description || '',
      actif: data.actif ?? true,
      ordre: data.ordre ?? 0,
    })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updateSpecialite = async (id, data) => {
  const payload = {}
  ;['nom', 'description', 'actif', 'ordre'].forEach((champ) => {
    if (data[champ] !== undefined) payload[champ] = data[champ]
  })
  const { error } = await supabase.from('specialites').update(payload).eq('id', id)
  if (error) throw error
}

export const deleteSpecialite = async (id) => {
  const { error } = await supabase.from('specialites').delete().eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// CABINETS
// ══════════════════════════════════════════════════════════

const mapCabinet = (row) =>
  row && {
    id: row.id,
    nom: row.nom,
    description: row.description,
    actif: row.actif,
    dateCreation: row.date_creation,
  }

export const getCabinets = async () => {
  const { data, error } = await supabase
    .from('cabinets')
    .select('*')
    .order('nom', { ascending: true })
  if (error) throw error
  return data.map(mapCabinet)
}

export const createCabinet = async (data) => {
  const { data: inserted, error } = await supabase
    .from('cabinets')
    .insert({
      nom: data.nom,
      description: data.description || '',
      actif: data.actif ?? true,
    })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updateCabinet = async (id, data) => {
  const payload = {}
  ;['nom', 'description', 'actif'].forEach((champ) => {
    if (data[champ] !== undefined) payload[champ] = data[champ]
  })
  const { error } = await supabase.from('cabinets').update(payload).eq('id', id)
  if (error) throw error
}

export const deleteCabinet = async (id) => {
  const { error } = await supabase.from('cabinets').delete().eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// PERMISSIONS PAR RÔLE
// ══════════════════════════════════════════════════════════

export const getRolePermissions = async () => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .order('role', { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    role: row.role,
    action: row.action,
    autorise: row.autorise,
  }))
}

export const updateRolePermission = async (id, autorise) => {
  const { error } = await supabase.from('role_permissions').update({ autorise }).eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// EXAMENS
// ══════════════════════════════════════════════════════════

const mapExamen = (row) =>
  row && {
    id: row.id,
    patientId: row.patient_id,
    patientNom: row.patient_nom,
    medecinId: row.medecin_id,
    medecinNom: row.medecin_nom,
    consultationId: row.consultation_id,
    type: row.type,
    designation: row.designation,
    instructions: row.instructions,
    statut: row.statut,
    resultat: row.resultat,
    commentaireMedecin: row.commentaire_medecin,
    datePrescription: row.date_prescription,
    dateResultat: row.date_resultat,
  }

export const getExamensByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from('examens')
    .select('*')
    .eq('patient_id', patientId)
  if (error) throw error
  return data
    .map(mapExamen)
    .sort((a, b) => new Date(b.datePrescription) - new Date(a.datePrescription))
}

export const getExamensByMedecin = async (medecinId) => {
  const { data, error } = await supabase
    .from('examens')
    .select('*')
    .eq('medecin_id', medecinId)
  if (error) throw error
  return data
    .map(mapExamen)
    .sort((a, b) => new Date(b.datePrescription) - new Date(a.datePrescription))
}

export const createExamen = async (data) => {
  const { data: inserted, error } = await supabase
    .from('examens')
    .insert({
      patient_id: data.patientId,
      patient_nom: data.patientNom,
      medecin_id: data.medecinId,
      medecin_nom: data.medecinNom,
      consultation_id: data.consultationId || null,
      type: data.type || 'analyse',
      designation: data.designation,
      instructions: data.instructions || '',
    })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const updateExamen = async (id, data) => {
  const payload = {}
  if (data.resultat !== undefined) payload.resultat = data.resultat
  if (data.commentaireMedecin !== undefined) payload.commentaire_medecin = data.commentaireMedecin
  if (data.statut !== undefined) {
    payload.statut = data.statut
    if (data.statut === 'resultat_disponible') payload.date_resultat = new Date().toISOString()
  }
  const { error } = await supabase.from('examens').update(payload).eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// DOCUMENTS (certificats, comptes rendus)
// ══════════════════════════════════════════════════════════

const mapDocument = (row) =>
  row && {
    id: row.id,
    patientId: row.patient_id,
    patientNom: row.patient_nom,
    medecinId: row.medecin_id,
    medecinNom: row.medecin_nom,
    consultationId: row.consultation_id,
    type: row.type,
    titre: row.titre,
    contenu: row.contenu,
    signePar: row.signe_par,
    dateSignature: row.date_signature,
    dateCreation: row.date_creation,
  }

export const getDocumentsByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
  if (error) throw error
  return data
    .map(mapDocument)
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
}

export const getDocumentsByMedecin = async (medecinId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('medecin_id', medecinId)
  if (error) throw error
  return data
    .map(mapDocument)
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
}

export const createDocument = async (data) => {
  const { data: inserted, error } = await supabase
    .from('documents')
    .insert({
      patient_id: data.patientId,
      patient_nom: data.patientNom,
      medecin_id: data.medecinId,
      medecin_nom: data.medecinNom,
      consultation_id: data.consultationId || null,
      type: data.type || 'certificat',
      titre: data.titre,
      contenu: data.contenu,
      signe_par: data.signePar || null,
      date_signature: data.signePar ? new Date().toISOString() : null,
    })
    .select('id')
    .single()
  if (error) throw error
  return inserted.id
}

export const deleteDocument = async (id) => {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════════
// VALIDATION DES DONNÉES PATIENT (par le médecin référent)
// ══════════════════════════════════════════════════════════

// Le patient propose des modifications (infos admin/perso + questionnaire
// santé) : rien n'est appliqué au dossier officiel avant validation.
export const proposerModificationsPatient = async (patientId, champs) => {
  const { error } = await supabase
    .from('patients')
    .update({
      donnees_en_attente: { champs, proposeLe: new Date().toISOString() },
      statut_dossier: 'en_attente_validation',
    })
    .eq('id', patientId)
  if (error) throw error
}

// Le médecin référent valide (ou corrige puis valide) les propositions :
// elles sont fusionnées dans le dossier officiel.
export const validerModificationsPatient = async (patientId, champsValides, medecinId) => {
  const payload = {
    ...patientToRow(champsValides),
    donnees_en_attente: null,
    statut_dossier: 'valide',
    valide_par: medecinId,
    valide_le: new Date().toISOString(),
  }
  const { error } = await supabase.from('patients').update(payload).eq('id', patientId)
  if (error) throw error
}

// Le médecin référent rejette les propositions sans les appliquer.
export const rejeterModificationsPatient = async (patientId) => {
  const { error } = await supabase
    .from('patients')
    .update({ donnees_en_attente: null, statut_dossier: 'valide' })
    .eq('id', patientId)
  if (error) throw error
}