import { useState, useEffect, useRef } from 'react'
import {
  Send, Search, X, AlertCircle,
  Loader2, MessageSquare, Plus,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import {
  getConversations, ecouterMessages, envoyerMessage,
  creerOuOuvrirConversation, getUtilisateurs,
  marquerCommeLu,
} from '../../services/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(val) {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function ModalNouvelleConv({ userId, onClose, onStart }) {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [recherche,    setRecherche]    = useState('')
  const [selectionne,  setSelectionne]  = useState(null)
  const [chargement,   setChargement]   = useState(true)
  const [envoi,        setEnvoi]        = useState(false)

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await getUtilisateurs()
        setUtilisateurs(data.filter((u) => u.id !== userId))
      } catch (e) {
        setUtilisateurs([])
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [userId])

  const filtres = utilisateurs.filter((u) =>
    `${u.prenom} ${u.nom}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const handleStart = async () => {
    if (!selectionne) return
    setEnvoi(true)
    try { await onStart(selectionne); onClose() }
    finally { setEnvoi(false) }
  }

  const ROLE_LABELS = {
    admin: 'Administrateur', medecin: 'Médecin',
    secretaire: 'Secrétaire', patient: 'Patient',
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-neutral-text">Nouvelle conversation</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="modal-body space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
            <input className="form-input pl-9" placeholder="Rechercher un contact..."
              value={recherche} onChange={(e) => setRecherche(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-hide">
            {chargement ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : filtres.length === 0 ? (
              <p className="text-sm text-neutral-muted text-center py-4">Aucun contact trouvé</p>
            ) : (
              filtres.map((u) => (
                <button key={u.id} onClick={() => setSelectionne(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                    ${selectionne?.id === u.id
                      ? 'bg-primary-50 border border-primary'
                      : 'hover:bg-neutral-bg border border-transparent'
                    }`}>
                  <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center
                                  justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {u.prenom?.[0]}{u.nom?.[0]}
                    </span>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-text truncate">
                      {u.role === 'medecin' ? 'Dr. ' : ''}{u.prenom} {u.nom}
                    </p>
                    <p className="text-xs text-neutral-muted">{ROLE_LABELS[u.role] || u.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="modal-footer justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Annuler</button>
          <button onClick={handleStart} disabled={!selectionne || envoi} className="btn-primary">
            {envoi ? <><Loader2 className="w-4 h-4 animate-spin" /> Ouverture...</> : 'Démarrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SecretaireMessagerie() {
  const { user }                          = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [convActive,    setConvActive]    = useState(null)
  const [messages,      setMessages]      = useState([])
  const [texte,         setTexte]         = useState('')
  const [recherche,     setRecherche]     = useState('')
  const [chargement,    setChargement]    = useState(true)
  const [chargMsgs,     setChargMsgs]     = useState(false)
  const [envoi,         setEnvoi]         = useState(false)
  const [erreur,        setErreur]        = useState(null)
  const [modalNouveau,  setModalNouveau]  = useState(false)
  const messagesRef                       = useRef(null)

  const chargerConversations = async () => {
    if (!user?.uid) return
    setChargement(true)
    setErreur(null)
    try {
      const data = await getConversations(user.uid)
      setConversations(data)
    } catch (e) {
      setErreur('Impossible de charger les conversations.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { chargerConversations() }, [user])

  // Écoute messages + marquer comme lu
  useEffect(() => {
    if (!convActive) return
    setChargMsgs(true)

    if (convActive.id && user?.uid) {
      marquerCommeLu(convActive.id, user.uid).catch(() => {})
      setConversations((prev) =>
        prev.map((c) => c.id === convActive.id ? { ...c, nonLusCount: 0 } : c)
      )
    }

    const unsub = ecouterMessages(convActive.id, (data) => {
      setMessages(data)
      setChargMsgs(false)
      setTimeout(() => {
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    })
    return () => unsub && unsub()
  }, [convActive])

  const handleEnvoyer = async () => {
    if (!texte.trim() || !convActive || !user?.uid) return
    setEnvoi(true)
    setErreur(null)
    try {
      await envoyerMessage(convActive.id, {
        expediteurId:   user.uid,
        expediteurNom:  `${user.prenom} ${user.nom}`,
        texte:          texte.trim(),
        destinataireId: convActive.interlocuteurId,
      })
      setTexte('')
    } catch (e) {
      setErreur('Impossible d\'envoyer le message.')
    } finally {
      setEnvoi(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnvoyer() }
  }

  const handleNouvelleConv = async (contact) => {
    const convId = await creerOuOuvrirConversation(user.uid, contact.id)
    const convs  = await getConversations(user.uid)
    setConversations(convs)
    const conv = convs.find((c) => c.id === convId)
    if (conv) setConvActive(conv)
  }

  const convsFiltrees = conversations.filter((c) =>
    c.nomInterlocuteur?.toLowerCase().includes(recherche.toLowerCase())
  )

  // ── Nombre total non lus pour le titre
  const totalNonLus = conversations.reduce((acc, c) => acc + (c.nonLusCount || 0), 0)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-fade-in">

      {/* Liste conversations */}
      <div className={`w-full sm:w-72 flex-shrink-0 card p-0 flex flex-col overflow-hidden
        ${convActive ? 'hidden sm:flex' : 'flex'}`}>

        <div className="p-4 border-b border-neutral-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="section-title">Messages</h2>
              {totalNonLus > 0 && (
                <span className="w-5 h-5 bg-danger rounded-full flex items-center justify-center">
                  <span className="text-2xs text-white font-bold">
                    {totalNonLus > 9 ? '9+' : totalNonLus}
                  </span>
                </span>
              )}
            </div>
            <button onClick={() => setModalNouveau(true)} className="btn-icon"
              title="Nouvelle conversation">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
            <input className="form-input pl-9 py-2 text-sm" placeholder="Rechercher..."
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {chargement ? (
            <div className="flex items-center justify-center py-12"><div className="spinner" /></div>
          ) : convsFiltrees.length === 0 ? (
            <div className="empty-state py-12">
              <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Aucune conversation</p>
              <button onClick={() => setModalNouveau(true)} className="btn-outline btn-sm mt-3">
                <Plus className="w-3.5 h-3.5" /> Nouvelle conversation
              </button>
            </div>
          ) : (
            convsFiltrees.map((conv) => (
              <button key={conv.id} onClick={() => setConvActive(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-colors duration-250 border-b border-neutral-border/50
                  ${convActive?.id === conv.id
                    ? 'bg-primary-50 border-l-2 border-l-primary'
                    : conv.nonLusCount > 0
                    ? 'bg-primary-50/40 hover:bg-primary-50'
                    : 'hover:bg-neutral-bg'
                  }`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {conv.nomInterlocuteur?.[0] || '?'}
                    </span>
                  </div>
                  {/* Point rouge si non lu */}
                  {conv.nonLusCount > 0 && convActive?.id !== conv.id && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger
                                    rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate
                      ${conv.nonLusCount > 0 ? 'font-bold text-neutral-text' : 'font-semibold text-neutral-text'}`}>
                      {conv.nomInterlocuteur}
                    </p>
                    {conv.dernierMessageDate && (
                      <p className="text-2xs text-neutral-muted flex-shrink-0 ml-1">
                        {format(toDate(conv.dernierMessageDate), 'HH:mm')}
                      </p>
                    )}
                  </div>
                  <p className={`text-xs truncate mt-0.5
                    ${conv.nonLusCount > 0 ? 'text-neutral-text font-medium' : 'text-neutral-muted'}`}>
                    {conv.dernierMessage || 'Aucun message'}
                  </p>
                </div>
                {/* Badge compteur */}
                {conv.nonLusCount > 0 && convActive?.id !== conv.id && (
                  <span className="w-5 h-5 bg-primary rounded-full flex items-center
                                   justify-center flex-shrink-0">
                    <span className="text-2xs text-white font-bold">
                      {conv.nonLusCount > 9 ? '9+' : conv.nonLusCount}
                    </span>
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Zone messages */}
      {convActive ? (
        <div className="flex-1 card p-0 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-border">
            <button onClick={() => setConvActive(null)} className="sm:hidden btn-icon">
              <X className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center
                            justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {convActive.nomInterlocuteur?.[0] || '?'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-neutral-text">{convActive.nomInterlocuteur}</p>
              <p className="text-xs text-neutral-muted capitalize">
                {convActive.roleInterlocuteur || '—'}
              </p>
            </div>
          </div>

          <div ref={messagesRef}
            className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-3">
            {chargMsgs ? (
              <div className="flex items-center justify-center py-12"><div className="spinner" /></div>
            ) : messages.length === 0 ? (
              <div className="empty-state py-12">
                <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Aucun message</p>
                <p className="text-xs mt-1">Commencez la conversation</p>
              </div>
            ) : (
              messages.map((msg) => {
                const estMoi = msg.expediteurId === user.uid
                return (
                  <div key={msg.id} className={`flex ${estMoi ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm
                      ${estMoi
                        ? 'bg-gradient-primary text-white rounded-br-sm'
                        : 'bg-neutral-bg text-neutral-text border border-neutral-border rounded-bl-sm'
                      }`}>
                      {!estMoi && (
                        <p className="text-2xs font-semibold mb-1 text-primary">{msg.expediteurNom}</p>
                      )}
                      <p className="leading-relaxed">{msg.texte}</p>
                      <p className={`text-2xs mt-1 ${estMoi ? 'text-primary-200' : 'text-neutral-muted'}`}>
                        {msg.dateEnvoi ? format(toDate(msg.dateEnvoi), 'HH:mm', { locale: fr }) : '—'}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {erreur && (
            <div className="px-5 pb-2">
              <div className="alert-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{erreur}</p>
              </div>
            </div>
          )}

          <div className="px-5 py-4 border-t border-neutral-border">
            <div className="flex items-end gap-3">
              <textarea className="form-input flex-1 resize-none text-sm" rows={1}
                placeholder="Écrire un message... (Entrée pour envoyer)"
                value={texte} onChange={(e) => setTexte(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ minHeight: '42px', maxHeight: '120px' }} />
              <button onClick={handleEnvoyer} disabled={envoi || !texte.trim()}
                className="btn-primary flex-shrink-0 w-10 h-10 p-0 rounded-xl">
                {envoi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 card items-center justify-center">
          <div className="empty-state">
            <MessageSquare className="w-14 h-14 mb-4 opacity-20" />
            <p className="font-medium">Sélectionnez une conversation</p>
            <p className="text-sm mt-1">Ou démarrez une nouvelle conversation</p>
            <button onClick={() => setModalNouveau(true)} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> Nouvelle conversation
            </button>
          </div>
        </div>
      )}

      {modalNouveau && (
        <ModalNouvelleConv
          userId={user.uid}
          onClose={() => setModalNouveau(false)}
          onStart={handleNouvelleConv}
        />
      )}
    </div>
  )
}

export default SecretaireMessagerie