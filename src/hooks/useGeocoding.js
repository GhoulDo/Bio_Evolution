import { useState, useCallback } from 'react'
import { GEOCODING_CONFIG } from '../utils/constants'

/**
 * Hook para geocoding con Nominatim (OpenStreetMap)
 * Busca direcciones y retorna coordenadas
 */
export const useGeocoding = () => {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  /**
   * Busca una dirección
   * @param {string} query - Dirección a buscar
   * @returns {Promise<Array>} Resultados de geocoding
   */
  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setResults([])
      return []
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Añadir "Bogotá" si no está presente para mejorar resultados
      const searchQuery = query.toLowerCase().includes('bogotá') 
        ? query 
        : `${query}, Bogotá, Colombia`
      
      const params = new URLSearchParams({
        ...GEOCODING_CONFIG.nominatim.params,
        q: searchQuery
      })
      
      const response = await fetch(
        `${GEOCODING_CONFIG.nominatim.url}?${params}`,
        {
          headers: {
            'User-Agent': 'BioEvolution-UAESP/1.0'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Normalizar resultados
      const normalized = data.map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
        address: {
          road: item.address?.road,
          neighbourhood: item.address?.neighbourhood,
          suburb: item.address?.suburb,
          city: item.address?.city || item.address?.town,
          locality: item.address?.city_district
        },
        boundingbox: item.boundingbox,
        importance: item.importance
      }))
      
      // Filtrar solo resultados dentro de Bogotá
      const inBogota = normalized.filter(r => 
        r.lat >= 4.4 && r.lat <= 4.9 && 
        r.lng >= -74.3 && r.lng <= -73.8
      )
      
      setResults(inBogota)
      setIsLoading(false)
      
      return inBogota
      
    } catch (err) {
      console.error('Geocoding error:', err)
      setError(err.message)
      setIsLoading(false)
      setResults([])
      return []
    }
  }, [])
  
  /**
   * Geocoding inverso: obtener dirección desde coordenadas
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {Promise<Object>} Información de la dirección
   */
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        format: 'json',
        lat: lat.toString(),
        lon: lng.toString(),
        zoom: 18,
        addressdetails: 1
      })
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        {
          headers: {
            'User-Agent': 'BioEvolution-UAESP/1.0'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`)
      }
      
      const data = await response.json()
      
      setIsLoading(false)
      
      return {
        display_name: data.display_name,
        address: data.address
      }
      
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      setError(err.message)
      setIsLoading(false)
      return null
    }
  }, [])
  
  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])
  
  return {
    results,
    isLoading,
    error,
    search,
    reverseGeocode,
    clearResults
  }
}
