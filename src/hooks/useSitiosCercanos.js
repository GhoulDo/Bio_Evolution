import { useMemo } from 'react'
import * as turf from '@turf/turf'
import useAppStore from '../store/useAppStore'
import { SEARCH_RADIUS_KM } from '../utils/constants'

/**
 * Hook para encontrar sitios de aprovechamiento cercanos
 */
export const useSitiosCercanos = () => {
  const { sitiosAprovechamiento, userLocation } = useAppStore()
  
  /**
   * Calcula sitios cercanos con distancia
   */
  const sitiosCercanos = useMemo(() => {
    if (!sitiosAprovechamiento || !userLocation) return []
    
    const userPoint = turf.point([userLocation.lng, userLocation.lat])
    
    const sitiosConDistancia = sitiosAprovechamiento.features.map(feature => {
      const sitioPoint = turf.point(feature.geometry.coordinates)
      const distance = turf.distance(userPoint, sitioPoint, { units: 'kilometers' })
      
      return {
        ...feature.properties,
        geometry: feature.geometry,
        dist_km: parseFloat(distance.toFixed(2))
      }
    })
    
    // Filtrar por radio y ordenar por distancia
    return sitiosConDistancia
      .filter(sitio => sitio.dist_km <= SEARCH_RADIUS_KM)
      .sort((a, b) => a.dist_km - b.dist_km)
      
  }, [sitiosAprovechamiento, userLocation])
  
  /**
   * Filtra sitios por material
   */
  const filtrarPorMaterial = (material) => {
    if (!material) return sitiosCercanos
    
    return sitiosCercanos.filter(sitio => 
      sitio.materiales_array?.some(m => 
        m.toLowerCase().includes(material.toLowerCase())
      )
    )
  }
  
  /**
   * Obtiene el sitio más cercano
   */
  const sitioMasCercano = useMemo(() => {
    return sitiosCercanos.length > 0 ? sitiosCercanos[0] : null
  }, [sitiosCercanos])
  
  return {
    sitiosCercanos,
    sitioMasCercano,
    filtrarPorMaterial,
    total: sitiosCercanos.length
  }
}
