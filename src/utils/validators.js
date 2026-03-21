import { z } from 'zod'

const phoneRegex = /^(\+221|00221)?[7][0-9]{8}$|^(\+224|00224)?[6][0-9]{8}$|^\+?[0-9]{8,15}$/

export const phoneSchema = z
  .string()
  .min(8, 'Numéro de téléphone invalide')
  .regex(phoneRegex, 'Format de téléphone invalide')
  .optional()
  .or(z.literal(''))

export const emailSchema = z
  .string()
  .email('Adresse email invalide')

export const loginSchema = z.object({
  email: emailSchema,
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const inscriptionPatientSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: emailSchema,
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmMotDePasse: z.string(),
  telephone: z.string().min(8, 'Numéro invalide'),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
}).refine((data) => data.motDePasse === data.confirmMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmMotDePasse'],
})

export const patientSchema = z.object({
  prenom: z.string().min(2, 'Prénom requis'),
  nom: z.string().min(2, 'Nom requis'),
  email: emailSchema.optional().or(z.literal('')),
  telephone: z.string().min(8, 'Téléphone requis'),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  sexe: z.enum(['M', 'F'], { required_error: 'Sexe requis' }),
  adresse: z.string().optional(),
  groupeSanguin: z.string().optional(),
  allergies: z.string().optional(),
  antecedents: z.string().optional(),
  assurance: z.string().optional(),
  numeroAssurance: z.string().optional(),
})

export const rdvSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  medecinId: z.string().min(1, 'Médecin requis'),
  date: z.string().min(1, 'Date requise'),
  heureDebut: z.string().min(1, 'Heure de début requise'),
  heureFin: z.string().min(1, 'Heure de fin requise'),
  motif: z.string().min(3, 'Motif requis'),
  type: z.enum(['presentiel', 'teleconsultation']),
  notes: z.string().optional(),
})

export const consultationSchema = z.object({
  motif: z.string().min(3, 'Motif requis'),
  examenClinique: z.string().optional(),
  diagnostic: z.string().min(3, 'Diagnostic requis'),
  traitement: z.string().optional(),
  ordonnance: z.string().optional(),
  examensPrescrits: z.string().optional(),
  dureeMinutes: z.number().min(5).max(480).optional(),
  notes: z.string().optional(),
})

export const medecinSchema = z.object({
  prenom: z.string().min(2, 'Prénom requis'),
  nom: z.string().min(2, 'Nom requis'),
  email: emailSchema,
  telephone: z.string().min(8, 'Téléphone requis'),
  specialite: z.string().min(1, 'Spécialité requise'),
  biographie: z.string().optional(),
  diplomes: z.string().optional(),
  tarifsConsultation: z.number().min(0).optional(),
})

export const paiementSchema = z.object({
  montant: z.number().min(1, 'Montant requis'),
  modePaiement: z.string().min(1, 'Mode de paiement requis'),
  referencePaiement: z.string().optional(),
  notes: z.string().optional(),
})

export const cliniqueSchema = z.object({
  nom: z.string().min(2, 'Nom de la clinique requis'),
  slogan: z.string().optional(),
  adresse: z.string().min(5, 'Adresse requise'),
  telephone: z.string().min(8, 'Téléphone requis'),
  email: emailSchema.optional().or(z.literal('')),
  siteWeb: z.string().url('URL invalide').optional().or(z.literal('')),
  ninea: z.string().optional(),
  horairesOuverture: z.string().optional(),
})

export const articleSchema = z.object({
  titre: z.string().min(5, 'Titre requis'),
  contenu: z.string().min(50, 'Contenu requis'),
  categorie: z.string().min(1, 'Catégorie requise'),
  imageUrl: z.string().optional(),
  publie: z.boolean().default(false),
})

export const messageSchema = z.object({
  destinataireId: z.string().min(1, 'Destinataire requis'),
  contenu: z.string().min(1, 'Message vide'),
})