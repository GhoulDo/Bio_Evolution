import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // Datos cargados
  macrorutas: null,
  sitiosAprovechamiento: null,
  
  // Estado del usuario
  userLocation: null,
  userZona: null,
  
  // UI State
  selectedSitio: null,
  activeLayers: {
    macrorutas: true,
    sitios: true
  },
  
  // Acciones
  setMacrorutas: (data) => set({ macrorutas: data }),
  setSitiosAprovechamiento: (data) => set({ sitiosAprovechamiento: data }),
  
  setUserLocation: (location) => set({ userLocation: location }),
  setUserZona: (zona) => set({ userZona: zona }),
  
  setSelectedSitio: (sitio) => set({ selectedSitio: sitio }),
  
  toggleLayer: (layerName) => set((state) => ({
    activeLayers: {
      ...state.activeLayers,
      [layerName]: !state.activeLayers[layerName]
    }
  })),
  
  resetUser: () => set({ userLocation: null, userZona: null, selectedSitio: null })
}))

export default useAppStore
