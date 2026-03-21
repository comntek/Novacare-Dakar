import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Search, Send, Circle, User,
  Stethoscope, Shield, Users, MessageSquare,
} from 'lucide-react'

// ── Badges rôle ───────────────────────────────────────────
const ROLE_CONFIG = {
  medecin:    { label: 'Médecin',    color: 'bg-blue-100 text-blue-700',    icon: Stethoscope },
  secretaire: { label: 'Secrétaire', color: 'bg-amber-100 text-amber-700',  icon: Users },
  admin:      { label: 'Admin',      color: 'bg-purple-100 text-purple-700', icon: Shield },
  patient:    { label: 'Patient',    color: 'bg-green-100 text-green-700',  icon: User },
}

// ── Tous les contacts de la clinique ─────────────────────
const TOUS_CONTACTS = [
  // Patients
  { id: 'pat-001', nom: 'Aminata Diallo',    role: 'patient',    enLigne: true,  nonLus: 2, dernierMessage: 'Bonjour, j\'ai une question...',       heure: 'il y a 5 min',  estMonPatient: true },
  { id: 'pat-002', nom: 'Ousmane Traoré',    role: 'patient',    enLigne: false, nonLus: 0, dernierMessage: 'Merci pour l\'ordonnance.',             heure: 'il y a 2h',     estMonPatient: true },
  { id: 'pat-003', nom: 'Fatou Camara',      role: 'patient',    enLigne: true,  nonLus: 1, dernierMessage: 'D\'accord je serai là à 9h.',          heure: 'il y a 30 min', estMonPatient: true },
  { id: 'pat-004', nom: 'Ibrahima Sow',      role: 'patient',    enLigne: false, nonLus: 0, dernierMessage: 'Merci docteur.',                        heure: 'Hier',          estMonPatient: true },
  { id: 'pat-005', nom: 'Mariama Bah',       role: 'patient',    enLigne: false, nonLus: 0, dernierMessage: '',                                      heure: '',              estMonPatient: false },
  { id: 'pat-006', nom: 'Seydou Diop',       role: 'patient',    enLigne: false, nonLus: 0, dernierMessage: '',                                      heure: '',              estMonPatient: false },
  // Médecins
  { id: 'med-001', nom: 'Dr. Aissatou Bah',  role: 'medecin',    enLigne: true,  nonLus: 0, dernierMessage: 'Merci pour le transfert du dossier.',  heure: 'il y a 4h',     estMonPatient: false },
  { id: 'med-002', nom: 'Dr. Moussa Koné',   role: 'medecin',    enLigne: false, nonLus: 1, dernierMessage: 'Pouvez-vous consulter ce cas ?',       heure: 'Hier',          estMonPatient: false },
  // Secrétaires
  { id: 'sec-001', nom: 'Marième Ndiaye',    role: 'secretaire', enLigne: true,  nonLus: 0, dernierMessage: 'Le patient de 10h est arrivé.',        heure: 'il y a 1h',     estMonPatient: false },
  { id: 'sec-002', nom: 'Khady Diallo',      role: 'secretaire', enLigne: false, nonLus: 0, dernierMessage: 'RDV décalé pour demain matin.',        heure: 'Hier',          estMonPatient: false },
  // Admin
  { id: 'adm-001', nom: 'Dr. Ibrahima Sall', role: 'admin',      enLigne: false, nonLus: 0, dernierMessage: 'Réunion staff vendredi à 8h.',         heure: 'il y a 3h',     estMonPatient: false },
]

// ── Messages mock par conversation ────────────────────────
const MESSAGES_MOCK = {
  'pat-001': [
    { id: 1, texte: 'Bonjour, j\'ai une question concernant mon traitement.', heure: '09:12', moi: false },
    { id: 2, texte: 'Bonjour Aminata, dites-moi.',                            heure: '09:15', moi: true  },
    { id: 3, texte: 'Est-ce que mon RDV de demain est confirmé ?',            heure: '09:16', moi: false },
    { id: 4, texte: 'Oui, votre RDV est bien confirmé à 9h30.',              heure: '09:20', moi: true  },
    { id: 5, texte: 'Bonjour, j\'ai une question...',                         heure: '10:45', moi: false },
  ],
  'pat-002': [
    { id: 1, texte: 'Votre ordonnance est prête, venez la récupérer.',        heure: '08:30', moi: true  },
    { id: 2, texte: 'Merci pour l\'ordonnance.',                              heure: '09:00', moi: false },
  ],
  'pat-003': [
    { id: 1, texte: 'Votre RDV de demain est confirmé à 9h.',                heure: '14:00', moi: true  },
    { id: 2, texte: 'D\'accord je serai là à 9h.',                           heure: '14:30', moi: false },
  ],
  'med-001': [
    { id: 1, texte: 'Docteur, le patient Diallo est arrivé.',                heure: '09:55', moi: true  },
    { id: 2, texte: 'Merci pour le transfert du dossier.',                   heure: '10:10', moi: false },
  ],
  'med-002': [
    { id: 1, texte: 'Pouvez-vous consulter ce cas ?',                        heure: 'Hier',  moi: false },
  ],
  'adm-001': [
    { id: 1, texte: 'Réunion staff vendredi à 8h.',                          heure: '08:00', moi: false },
    { id: 2, texte: 'Noté, je serai présente.',                              heure: '08:15', moi: true  },
  ],
}

// ── Filtre contacts selon rôle ────────────────────────────
function filtrerContacts(contacts, roleUtilisateur, monId) {
  switch (roleUtilisateur) {
    case 'medecin':
      // Médecin : ses patients uniquement + secrétaires + admin + autres médecins
      return contacts.filter((c) =>
        c.id !== monId && (
          c.role === 'secretaire' ||
          c.role === 'admin' ||
          c.role === 'medecin' ||
          (c.role === 'patient' && c.estMonPatient)
        )
      )
    case 'secretaire':
      // Secrétaire : tous les patients + tous les médecins + admin — pas les autres secrétaires
      return contacts.filter((c) =>
        c.id !== monId && (
          c.role === 'patient' ||
          c.role === 'medecin' ||
          c.role === 'admin'
        )
      )
    case 'admin':
      // Admin : tout le monde
      return contacts.filter((c) => c.id !== monId)
    case 'patient':
      // Patient : son médecin + secrétaires
      return contacts.filter((c) =>
        c.id !== monId && (
          c.role === 'medecin' ||
          c.role === 'secretaire'
        )
      )
    default:
      return contacts.filter((c) => c.id !== monId)
  }
}

// ── Composant principal ───────────────────────────────────
export function MessagerieView({ roleUtilisateur = 'medecin', monId = 'moi' }) {
  const location = useLocation()
  const contactPreselectionne = location.state?.contactId || null

  const [recherche, setRecherche] = useState('')
  const [contacts, setContacts] = useState(TOUS_CONTACTS)
  const [conversationActive, setConversationActive] = useState(() => {
    // Ouvrir directement le contact pré-sélectionné si fourni
    if (contactPreselectionne) {
      return TOUS_CONTACTS.find((c) => c.id === contactPreselectionne) || null
    }
    return null
  })
  const [messagesMap, setMessagesMap] = useState(MESSAGES_MOCK)
  const [nouveauMessage, setNouveauMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Contacts filtrés selon le rôle
  const contactsFiltres = filtrerContacts(contacts, roleUtilisateur, monId)

  // Contacts filtrés par recherche
  const contactsAffiches = contactsFiltres.filter((c) =>
    c.nom.toLowerCase().includes(recherche.toLowerCase())
  )

  // Scroll automatique vers le bas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversationActive, messagesMap])

  // Marquer messages comme lus à l'ouverture
  const ouvrirConversation = (contact) => {
    setConversationActive(contact)
    setContacts((prev) =>
      prev.map((c) => c.id === contact.id ? { ...c, nonLus: 0 } : c)
    )
  }

  // Envoyer un message
  const envoyerMessage = () => {
    if (!nouveauMessage.trim() || !conversationActive) return
    const msg = {
      id: Date.now(),
      texte: nouveauMessage.trim(),
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      moi: true,
    }
    setMessagesMap((prev) => ({
      ...prev,
      [conversationActive.id]: [...(prev[conversationActive.id] || []), msg],
    }))
    setContacts((prev) =>
      prev.map((c) =>
        c.id === conversationActive.id
          ? { ...c, dernierMessage: nouveauMessage.trim(), heure: 'À l\'instant' }
          : c
      )
    )
    setNouveauMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyerMessage()
    }
  }

  const messagesActifs = conversationActive
    ? messagesMap[conversationActive.id] || []
    : []

  const totalNonLus = contactsFiltres.reduce((acc, c) => acc + c.nonLus, 0)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-card overflow-hidden">

      {/* ── Sidebar conversations ─────────────────────── */}
      <div className={`
        w-full md:w-80 flex-shrink-0 border-r border-neutral-border flex flex-col
        ${conversationActive ? 'hidden md:flex' : 'flex'}
      `}>

        {/* Header sidebar */}
        <div className="p-4 border-b border-neutral-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-neutral-text flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Messagerie
            </h2>
            {totalNonLus > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalNonLus}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="form-input pl-9 text-sm py-2"
            />
          </div>
        </div>

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto">
          {contactsAffiches.length === 0 ? (
            <div className="text-center py-10 text-neutral-muted">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            contactsAffiches.map((contact) => {
              const roleInfo = ROLE_CONFIG[contact.role]
              const RoleIcon = roleInfo?.icon || User
              const isActive = conversationActive?.id === contact.id

              return (
                <button
                  key={contact.id}
                  onClick={() => ouvrirConversation(contact)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-bg transition-colors border-b border-neutral-border/50 text-left ${
                    isActive ? 'bg-primary-50 border-l-2 border-l-primary' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">
                        {contact.nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    {contact.enLigne && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate ${contact.nonLus > 0 ? 'font-bold text-neutral-text' : 'font-medium text-neutral-text'}`}>
                        {contact.nom}
                      </p>
                      <span className="text-xs text-neutral-muted flex-shrink-0 ml-1">
                        {contact.heure}
                      </span>
                    </div>

                    {/* Badge rôle + en ligne */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${roleInfo?.color}`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {roleInfo?.label}
                      </span>
                      {contact.enLigne && (
                        <span className="text-xs text-green-600 font-medium">• En ligne</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${contact.nonLus > 0 ? 'text-neutral-text font-medium' : 'text-neutral-muted'}`}>
                        {contact.dernierMessage || 'Démarrer une conversation'}
                      </p>
                      {contact.nonLus > 0 && (
                        <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-1">
                          {contact.nonLus}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Zone messages ─────────────────────────────── */}
      <div className={`
        flex-1 flex flex-col
        ${conversationActive ? 'flex' : 'hidden md:flex'}
      `}>
        {conversationActive ? (
          <>
            {/* Header conversation */}
            <div className="p-4 border-b border-neutral-border flex items-center gap-3">
              {/* Bouton retour mobile */}
              <button
                onClick={() => setConversationActive(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-neutral-bg"
              >
                <svg className="w-4 h-4 text-neutral-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary text-sm">
                    {conversationActive.nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                {conversationActive.enLigne && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Infos */}
              <div className="flex-1">
                <p className="font-bold text-neutral-text text-sm">{conversationActive.nom}</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const roleInfo = ROLE_CONFIG[conversationActive.role]
                    const RoleIcon = roleInfo?.icon || User
                    return (
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${roleInfo?.color}`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {roleInfo?.label}
                      </span>
                    )
                  })()}
                  {conversationActive.enLigne && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      En ligne
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesActifs.length === 0 ? (
                <div className="text-center py-12 text-neutral-muted">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Démarrez la conversation</p>
                </div>
              ) : (
                messagesActifs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.moi ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] flex flex-col gap-1 ${msg.moi ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.moi
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-neutral-bg text-neutral-text rounded-bl-sm'
                      }`}>
                        {msg.texte}
                      </div>
                      <span className="text-xs text-neutral-muted px-1">{msg.heure}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-neutral-border">
              <div className="flex items-end gap-3">
                <textarea
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message à ${conversationActive.nom}...`}
                  rows={1}
                  className="flex-1 form-input resize-none text-sm py-2.5 max-h-32"
                  style={{ minHeight: 44 }}
                />
                <button
                  onClick={envoyerMessage}
                  disabled={!nouveauMessage.trim()}
                  className="w-11 h-11 bg-primary hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-muted mt-1.5 ml-1">
                Entrée pour envoyer · Maj+Entrée pour saut de ligne
              </p>
            </div>
          </>
        ) : (
          /* Écran vide */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-neutral-muted">
              <MessageSquare className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-neutral-subtle">Sélectionnez une conversation</p>
              <p className="text-sm mt-1">
                {totalNonLus > 0
                  ? `${totalNonLus} message${totalNonLus > 1 ? 's' : ''} non lu${totalNonLus > 1 ? 's' : ''}`
                  : 'Aucun message non lu'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagerieView