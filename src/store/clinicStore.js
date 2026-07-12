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

  load: async () => {
    set({ loading: true })
    try {
      const clinique = await getClinique()
      set({ data: clinique || VALEURS_DEFAUT, loading: false, loaded: true })
    } catch (e) {
      console.error('Impossible de charger les paramètres de la clinique :', e)
      set({ loading: false, loaded: true })
    }
  },

  setData: (data) => set({ data }),
}))

export default useClinicStore