import * as turf from '@turf/turf'

/**
 * Verifica si unas coordenadas están dentro de Bogotá
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si está en Bogotá
 */
export const isInBogota = (lat, lng) => {
  // Bounding box aproximado de Bogotá
  const bogotaBounds = {
    north: 4.9,
    south: 4.4,
    east: -73.8,
    west: -74.3
  }
  
  return lat >= bogotaBounds.south && 
         lat <= bogotaBounds.north && 
         lng >= bogotaBounds.west && 
         lng <= bogotaBounds.east
}

/**
 * Calcula la distancia entre dos puntos en kilómetros
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const point1 = turf.point([lng1, lat1])
  const point2 = turf.point([lng2, lat2])
  
  return turf.distance(point1, point2, { units: 'kilometers' })
}

/**
 * Encuentra sitios cercanos dentro de un radio
 * @param {number} userLat - Latitud del usuario
 * @param {number} userLng - Longitud del usuario
 * @param {Array} sitios - Array de sitios
 * @param {number} radiusKm - Radio de búsqueda en km
 * @returns {Array} Sitios ordenados por distancia
 */
export const findNearbySites = (userLat, userLng, sitios, radiusKm = 2) => {
  if (!sitios || !Array.isArray(sitios)) return []
  
  const userPoint = turf.point([userLng, userLat])
  
  const sitiosConDistancia = sitios
    .map(sitio => {
      const sitioPoint = turf.point([sitio.properties.lng, sitio.properties.lat])
      const distance = turf.distance(userPoint, sitioPoint, { units: 'kilometers' })
      
      return {
        ...sitio,
        properties: {
          ...sitio.properties,
          dist_km: Math.round(distance * 100) / 100
        }
      }
    })
    .filter(sitio => sitio.properties.dist_km <= radiusKm)
    .sort((a, b) => a.properties.dist_km - b.properties.dist_km)
  
  return sitiosConDistancia
}

/**
 * Filtra sitios por material aceptado
 * @param {Array} sitios - Array de sitios
 * @param {string} material - Material a buscar
 * @returns {Array} Sitios filtrados
 */
export const filterByMaterial = (sitios, material) => {
  if (!material || !sitios) return sitios
  
  return sitios.filter(sitio => {
    const materiales = sitio.properties.materiales_array || []
    return materiales.some(m => 
      m.toLowerCase().includes(material.toLowerCase())
    )
  })
}

/**
 * Valida coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si son válidas
 */
export const validateCoordinates = (lat, lng) => {
  return typeof lat === 'number' && 
         typeof lng === 'number' && 
         !isNaN(lat) && 
         !isNaN(lng) &&
         lat >= -90 && 
         lat <= 90 && 
         lng >= -180 && 
         lng <= 180
}
