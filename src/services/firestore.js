import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// ══════════════════════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════════════════════

export const getPatients = async () => {
  const snap = await getDocs(collection(db, 'patients'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getPatientById = async (id) => {
  const snap = await getDoc(doc(db, 'patients', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getPatientsByMedecin = async (medecinId) => {
  const q = query(
    collection(db, 'patients'),
    where('medecinReferentId', '==', medecinId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createPatient = async (data) => {
  const ref = await addDoc(collection(db, 'patients'), {
    ...data,
    dateCreation: serverTimestamp(),
  })
  return ref.id
}

export const updatePatient = async (id, data) => {
  await updateDoc(doc(db, 'patients', id), {
    ...data,
    dateMiseAJour: serverTimestamp(),
  })
}

// ══════════════════════════════════════════════════════════
// RENDEZ-VOUS
// ══════════════════════════════════════════════════════════

export const getRdvs = async () => {
  const snap = await getDocs(collection(db, 'rendezvous'))
  const rdvs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return rdvs.sort((a, b) => {
    const da = a.date?.toDate?.() || new Date(a.date || 0)
    const db2 = b.date?.toDate?.() || new Date(b.date || 0)
    return da - db2
  })
}

export const getRdvsByMedecin = async (medecinId) => {
  const q = query(
    collection(db, 'rendezvous'),
    where('medecinId', '==', medecinId)
  )
  const snap = await getDocs(q)
  const rdvs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return rdvs.sort((a, b) => {
    const da  = a.date?.toDate?.() || new Date(a.date || 0)
    const db2 = b.date?.toDate?.() || new Date(b.date || 0)
    return da - db2
  })
}

export const getRdvsByPatient = async (patientId) => {
  const q = query(
    collection(db, 'rendezvous'),
    where('patientId', '==', patientId),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createRdv = async (data) => {
  const statut = data.patientNonInscrit
    ? 'en_attente'
    : (data.statut || 'confirme')

  const ref = await addDoc(collection(db, 'rendezvous'), {
    ...data,
    statut,
    dateCreation: serverTimestamp(),
  })
  return ref.id
}


export const updateStatutRdv = async (id, statut) => {
  await updateDoc(doc(db, 'rendezvous', id), {
    statut,
    dateMiseAJour: serverTimestamp(),
  })
}

export const updateRdv = async (id, data) => {
  await updateDoc(doc(db, 'rendezvous', id), {
    ...data,
    dateMiseAJour: serverTimestamp(),
  })
}

export const deleteRdv = async (id) => {
  await updateDoc(doc(db, 'rendezvous', id), {
    statut: 'annule',
    dateMiseAJour: serverTimestamp(),
  })
}

// RDV pris sur le site (sans compte)
export const getRdvsSite = async () => {
  const q = query(
    collection(db, 'rendezvous'),
    where('patientNonInscrit', '==', true)
  )
  const snap = await getDocs(q)
  const rdvs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return rdvs.sort((a, b) => {
    const da  = a.dateCreation?.toDate?.() || new Date(0)
    const db2 = b.dateCreation?.toDate?.() || new Date(0)
    return db2 - da
  })
}

// Confirmer un RDV site → statut confirme + retirer flag patientNonInscrit
export const confirmerRdvSite = async (id, data) => {
  await updateDoc(doc(db, 'rendezvous', id), {
    ...data,
    statut:            'confirme',
    patientNonInscrit: false,
    dateMiseAJour:     serverTimestamp(),
  })
}

// Écoute en temps réel des RDV du jour
export const ecouterRdvsDuJour = (callback) => {
  const debut = new Date()
  debut.setHours(0, 0, 0, 0)
  const fin = new Date()
  fin.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, 'rendezvous'),
    where('date', '>=', debut),
    where('date', '<=', fin),
    orderBy('date', 'asc')
  )

  return onSnapshot(q, (snap) => {
    const rdvs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(rdvs)
  })
}

// ══════════════════════════════════════════════════════════
// CONSULTATIONS
// ══════════════════════════════════════════════════════════

export const getConsultationsByMedecin = async (medecinId) => {
  const q = query(
    collection(db, 'consultations'),
    where('medecinId', '==', medecinId),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getConsultationsByPatient = async (patientId) => {
  const q = query(
    collection(db, 'consultations'),
    where('patientId', '==', patientId),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createConsultation = async (data) => {
  const ref = await addDoc(collection(db, 'consultations'), {
    ...data,
    statut: 'en_cours',
    dateCreation: serverTimestamp(),
  })
  return ref.id
}

export const updateConsultation = async (id, data) => {
  await updateDoc(doc(db, 'consultations', id), {
    ...data,
    dateMiseAJour: serverTimestamp(),
  })
}

// ══════════════════════════════════════════════════════════
// FACTURES
// ══════════════════════════════════════════════════════════

export const getFactures = async () => {
  const q = query(collection(db, 'factures'), orderBy('dateCreation', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getFacturesByPatient = async (patientId) => {
  const q = query(
    collection(db, 'factures'),
    where('patientId', '==', patientId),
    orderBy('dateCreation', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createFacture = async (data) => {
  const ref = await addDoc(collection(db, 'factures'), {
    ...data,
    statut: 'impayee',
    dateCreation: serverTimestamp(),
  })
  return ref.id
}

export const payerFacture = async (id, modePaiement) => {
  await updateDoc(doc(db, 'factures', id), {
    statut: 'payee',
    modePaiement,
    datePaiement: serverTimestamp(),
  })
}

// ══════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════

export const getConversations = async (userId) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  )
  const snap = await getDocs(q)
  const conversations = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const enrichies = await Promise.all(
    conversations.map(async (conv) => {
      const interlocuteurId = conv.participants?.find((p) => p !== userId)
      if (!interlocuteurId) return {
        ...conv,
        nomInterlocuteur: 'Inconnu',
        nonLusCount: conv.nonLus?.[userId] || 0,
      }

      try {
        const userSnap = await getDoc(doc(db, 'utilisateurs', interlocuteurId))
        if (userSnap.exists()) {
          const data = userSnap.data()
          const prefix = data.role === 'medecin' ? 'Dr. ' : ''
          return {
            ...conv,
            interlocuteurId,
            nomInterlocuteur:  `${prefix}${data.prenom} ${data.nom}`,
            roleInterlocuteur: data.role,
            nonLusCount:       conv.nonLus?.[userId] || 0,
          }
        }
        const patSnap = await getDoc(doc(db, 'patients', interlocuteurId))
        if (patSnap.exists()) {
          const data = patSnap.data()
          return {
            ...conv,
            interlocuteurId,
            nomInterlocuteur:  `${data.prenom} ${data.nom}`,
            roleInterlocuteur: 'patient',
            nonLusCount:       conv.nonLus?.[userId] || 0,
          }
        }
      } catch (e) {}

      return {
        ...conv,
        interlocuteurId,
        nomInterlocuteur: 'Utilisateur inconnu',
        nonLusCount:      conv.nonLus?.[userId] || 0,
      }
    })
  )

  return enrichies.sort((a, b) => {
    const da = a.dernierMessageDate?.toDate?.() || new Date(0)
    const db2 = b.dernierMessageDate?.toDate?.() || new Date(0)
    return db2 - da
  })
}

export const ecouterMessages = (conversationId, callback) => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('dateEnvoi', 'asc')
  )
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(messages)
  })
}

export const envoyerMessage = async (conversationId, data) => {
  await addDoc(
    collection(db, 'conversations', conversationId, 'messages'),
    {
      ...data,
      dateEnvoi: serverTimestamp(),
    }
  )
  // Mettre à jour le dernier message de la conversation
  await updateDoc(doc(db, 'conversations', conversationId), {
    dernierMessage: data.texte,
    dernierMessageDate: serverTimestamp(),
    [`nonLus.${data.destinataireId}`]: true,
  })
}

export const marquerCommeLu = async (conversationId, userId) => {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`nonLus.${userId}`]: 0,
  })
}

export const creerOuOuvrirConversation = async (user1Id, user2Id) => {
  // Chercher si une conversation existe déjà
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', user1Id)
  )
  const snap = await getDocs(q)
  const existing = snap.docs.find((d) => {
    const participants = d.data().participants || []
    return participants.includes(user2Id)
  })
  if (existing) return existing.id

  // Créer une nouvelle conversation
  const ref = await addDoc(collection(db, 'conversations'), {
    participants: [user1Id, user2Id],
    dateCreation: serverTimestamp(),
    dernierMessage: '',
    nonLus: {},
  })
  return ref.id
}

// ══════════════════════════════════════════════════════════
// UTILISATEURS & MÉDECINS
// ══════════════════════════════════════════════════════════

export const getUtilisateurs = async () => {
  const snap = await getDocs(collection(db, 'utilisateurs'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getUtilisateurById = async (id) => {
  const snap = await getDoc(doc(db, 'utilisateurs', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getMedecins = async () => {
  const q = query(
    collection(db, 'utilisateurs'),
    where('role', '==', 'medecin'),
    where('actif', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getSecretaires = async () => {
  const q = query(
    collection(db, 'utilisateurs'),
    where('role', '==', 'secretaire'),
    where('actif', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateUtilisateur = async (id, data) => {
  await updateDoc(doc(db, 'utilisateurs', id), {
    ...data,
    dateMiseAJour: serverTimestamp(),
  })
}

// ══════════════════════════════════════════════════════════
// ARTICLES BLOG
// ══════════════════════════════════════════════════════════

export const getArticlesPublies = async () => {
  const q = query(
    collection(db, 'articles'),
    where('publie', '==', true)
  )
  const snap = await getDocs(q)
  const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Tri côté client — évite l'index composé Firestore
  return articles.sort((a, b) => {
    const dateA = a.datePublication?.toDate?.() || new Date(a.datePublication || 0)
    const dateB = b.datePublication?.toDate?.() || new Date(b.datePublication || 0)
    return dateB - dateA
  })
}

export const getArticles = async () => {
  const q = query(collection(db, 'articles'), orderBy('datePublication', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createArticle = async (data) => {
  const ref = await addDoc(collection(db, 'articles'), {
    ...data,
    datePublication: serverTimestamp(),
  })
  return ref.id
}

export const updateArticle = async (id, data) => {
  await updateDoc(doc(db, 'articles', id), {
    ...data,
    dateMiseAJour: serverTimestamp(),
  })
}

export const deleteArticle = async (id) => {
  await deleteDoc(doc(db, 'articles', id))
}