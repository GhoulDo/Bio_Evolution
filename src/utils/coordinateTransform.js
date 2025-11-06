/**
 * Transforma coordenadas de Web Mercator (EPSG:3857) a WGS84 (EPSG:4326)
 * @param {number} x - Coordenada X en metros
 * @param {number} y - Coordenada Y en metros
 * @returns {[number, number]} [lng, lat] en grados
 */
export function epsg3857ToWgs84(x, y) {
  const lng = (x / 20037508.34) * 180
  let lat = (y / 20037508.34) * 180
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2)
  
  return [lng, lat]
}

/**
 * Detecta automáticamente el sistema de coordenadas y convierte a WGS84
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {[number, number]} [lng, lat] en WGS84
 */
export function autoConvertToWgs84(x, y) {
  // Si las coordenadas son muy grandes (>1000), asumimos EPSG:3857
  if (Math.abs(x) > 1000 || Math.abs(y) > 1000) {
    return epsg3857ToWgs84(x, y)
  }
  
  // Si ya están en rangos de lat/lng, retornar como están
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    return [x, y]
  }
  
  console.warn(`Coordenadas fuera de rango esperado: [${x}, ${y}]`)
  return [x, y]
}

/**
 * Verifica si unas coordenadas están dentro de Bogotá
 * @param {number} lng - Longitud
 * @param {number} lat - Latitud
 * @returns {boolean}
 */
export function isInBogota(lng, lat) {
  return (
    lat >= 4.4 && lat <= 4.9 &&
    lng >= -74.3 && lng <= -73.8
  )
}
