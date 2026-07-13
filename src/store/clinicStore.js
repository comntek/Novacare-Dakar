import { create } from 'zustand'
import { getClinique } from '../services/firestore'

const VALEURS_DEFAUT = {
  nomClinique: 'NovaCare Dakar',
  slogan: '',
  adresse: '',
  telephone: '',
  telephone2: '',
  email: '',
  siteWeb: '',
  ninea: '',
  horaires: {},
  couleurPrimaire: '#0A5C3E',
  couleurSecondaire: '#C9922A',
  logoUrl: '',
  facebook: '',
  instagram: '',
  whatsapp: '',
  linkedin: '',
}

export const useClinicStore = create((set, get) => ({
  data: VALEURS_DEFAUT,
  loading: true,
  loaded: false,

  // Appelé une fois au démarrage de l'app (voir App.jsx).
  // Peut aussi être rappelé après une sauvegarde dans AdminParametres
  // pour que le reste de l'app (header, footer...) reflète le changement
  // immédiatement, sans rechargement de page.
  load: async () => {
    set({ loading: true })
    try {
      const clinique = await getClinique()
      set({ data: clinique || VALEURS_DEFAUT, loading: false, loaded: true })
    } catch (e) {
      // Si la table n'est pas accessible (RLS, réseau...), on retombe
      // sur des valeurs par défaut plutôt que de casser le site public.
      console.error('Impossible de charger les paramètres de la clinique :', e)
      set({ loading: false, loaded: true })
    }
  },

  setData: (data) => set({ data }),
}))

export default useClinicStore
