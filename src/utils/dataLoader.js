import proj4 from 'proj4'
import { LOCALIDAD_ID_MAP, OPERADORES_MAP } from './constants'

// Definir proyecciones
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs')
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs')
proj4.defs('EPSG:9377', '+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')

/**
 * Normaliza nombres de localidades
 */
export const normalizeLocalidad = (localidad) => {
  if (!localidad) return ''
  
  return String(localidad)
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, ' ')
}

/**
 * Transforma recursivamente coordenadas (función auxiliar interna)
 */
const transformCoords = (coords, sourceProj, targetProj) => {
  if (!Array.isArray(coords)) return coords
  
  // Si es un punto [x, y]
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    try {
      const [x, y] = coords
      
      // Validar coordenadas
      if (isNaN(x) || isNaN(y)) {
        console.warn('Coordenadas inválidas:', coords)
        return coords
      }
      
      return proj4(sourceProj, targetProj, coords)
    } catch (error) {
      console.error('Error transformando coordenadas:', coords, error)
      return coords
    }
  }
  
  // Si es un array de coordenadas, transformar recursivamente
  return coords.map(coord => transformCoords(coord, sourceProj, targetProj))
}

/**
 * Transforma una geometría completa de una proyección a otra
 */
const transformGeometry = (geometry, sourceProj, targetProj) => {
  if (!geometry || sourceProj === targetProj) return geometry
  
  return {
    ...geometry,
    coordinates: transformCoords(geometry.coordinates, sourceProj, targetProj)
  }
}

/**
 * Detecta la proyección de un GeoJSON
 */
const detectProjection = (geojson, filename) => {
  // 1. Verificar CRS en metadatos
  if (geojson.crs?.properties?.name) {
    const crsName = geojson.crs.properties.name.toLowerCase()
    
    if (crsName.includes('3857')) {
      console.log(`📍 ${filename}: EPSG:3857 (por CRS)`)
      return 'EPSG:3857'
    }
    if (crsName.includes('4326')) {
      console.log(`📍 ${filename}: EPSG:4326 (por CRS)`)
      return 'EPSG:4326'
    }
    if (crsName.includes('9377')) {
      console.log(`📍 ${filename}: EPSG:9377 (por CRS)`)
      return 'EPSG:9377'
    }
  }
  
  // 2. Detectar por nombre de archivo
  if (filename.toLowerCase().includes('macrobarr')) {
    console.log(`📍 ${filename}: EPSG:3857 (por nombre)`)
    return 'EPSG:3857'
  }
  
  // 3. Detectar por rango de coordenadas
  if (geojson.features?.length > 0) {
    const firstFeature = geojson.features[0]
    if (firstFeature.geometry?.coordinates) {
      const coords = firstFeature.geometry.coordinates
      
      let firstCoord
      switch (firstFeature.geometry.type) {
        case 'Point':
          firstCoord = coords
          break
        case 'Polygon':
          firstCoord = coords[0][0]
          break
        case 'MultiPolygon':
          firstCoord = coords[0][0][0]
          break
        default:
          firstCoord = null
      }
      
      if (firstCoord && Array.isArray(firstCoord) && firstCoord.length >= 2) {
        const [x, y] = firstCoord
        
        console.log(`🔍 ${filename}: Muestra [${x.toFixed(2)}, ${y.toFixed(2)}]`)
        
        // Web Mercator
        if (Math.abs(x) > 1000000 || Math.abs(y) > 1000000) {
          console.log(`📍 ${filename}: EPSG:3857 (por valores)`)
          return 'EPSG:3857'
        }
        
        // Sistema local Bogotá
        if ((x > 80000 && x < 150000) && (y > 80000 && y < 150000)) {
          console.log(`📍 ${filename}: EPSG:9377 (por valores)`)
          return 'EPSG:9377'
        }
        
        // WGS84
        if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
          console.log(`📍 ${filename}: EPSG:4326 (por valores)`)
          return 'EPSG:4326'
        }
      }
    }
  }
  
  console.warn(`⚠️ ${filename}: Usando EPSG:4326 por defecto`)
  return 'EPSG:4326'
}

/**
 * Valida un GeoJSON
 */
export const validateGeoJSON = (geojson, filename) => {
  if (!geojson) {
    console.error(`${filename}: GeoJSON nulo`)
    return false
  }
  
  if (geojson.type !== 'FeatureCollection') {
    console.error(`${filename}: Tipo inválido: ${geojson.type}`)
    return false
  }
  
  if (!Array.isArray(geojson.features)) {
    console.error(`${filename}: 'features' no es array`)
    return false
  }
  
  const invalidFeatures = geojson.features.filter((f, idx) => {
    if (f.type !== 'Feature') {
      console.warn(`${filename}: Feature ${idx} tipo inválido`)
      return true
    }
    if (!f.geometry) {
      console.warn(`${filename}: Feature ${idx} sin geometría`)
      return true
    }
    return false
  })
  
  if (invalidFeatures.length > 0) {
    console.warn(`${filename}: ${invalidFeatures.length} features con problemas`)
  }
  
  console.log(`✓ ${filename}: ${geojson.features.length} features válidas`)
  return true
}

/**
 * Carga y transforma archivos GeoJSON
 * Optimizado: detecta si los datos ya están procesados y evita trabajo redundante
 */
export const loadGeoJSON = async (filename) => {
  try {
    const url = `/data/${filename}`
    
    console.log(`📥 Cargando: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${url}`)
      throw new Error(`HTTP ${response.status}: ${filename}`)
    }
    
    // Verificar content-type
    const contentType = response.headers.get('content-type') || ''
    console.log(`📄 Content-Type: ${contentType}`)
    
    // GeoJSON puede venir como application/json o application/geo+json
    const isValidJSONType = contentType.includes('application/json') || 
                            contentType.includes('application/geo+json') ||
                            contentType.includes('text/json') ||
                            contentType === ''
    
    if (!isValidJSONType) {
      // Obtener primeras líneas para debugging
      const text = await response.text()
      const firstLine = text.split('\n')[0].substring(0, 100)
      
      console.error(`❌ No es JSON, recibido:`, firstLine)
      
      // Si es HTML, es 404
      if (firstLine.includes('<!doctype') || firstLine.includes('<html')) {
        throw new Error(`Archivo no encontrado: ${filename}. Verifica que existe en public/data/`)
      }
      
      // Si parece JSON pero el content-type es diferente, intentar parsearlo de todas formas
      if (firstLine.trim().startsWith('{')) {
        console.warn(`⚠️ Content-Type inesperado (${contentType}), pero parece JSON. Intentando parsear...`)
        try {
          const data = JSON.parse(text)
          if (!validateGeoJSON(data, filename)) {
            throw new Error(`GeoJSON inválido: ${filename}`)
          }
          return data
        } catch (parseError) {
          throw new Error(`No es JSON válido (${contentType}): ${filename}`)
        }
      }
      
      throw new Error(`No es JSON (${contentType}): ${filename}`)
    }
    
    const data = await response.json()
    
    if (!validateGeoJSON(data, filename)) {
      throw new Error(`GeoJSON inválido: ${filename}`)
    }
    
    // OPTIMIZACIÓN: Verificar si los datos ya están procesados
    const isAlreadyProcessed = data.features.length > 0 && 
                               data.features[0].properties?._processed === true
    
    if (isAlreadyProcessed) {
      console.log(`✅ ${filename}: Datos ya procesados, usando directamente`)
      console.log(`✅ ${filename}: ${data.features.length} features cargadas (optimizado)`)
      return data
    }
    
    // Si no está procesado, transformar coordenadas
    const sourceProj = detectProjection(data, filename)
    const targetProj = 'EPSG:4326'
    
    if (sourceProj !== targetProj) {
      console.log(`🔄 ${filename}: Transformando a WGS84...`)
      
      const transformedFeatures = data.features.map((feature, index) => {
        if (!feature.geometry) {
          console.warn(`Feature ${index} sin geometría`)
          return feature
        }
        
        try {
          return {
            ...feature,
            geometry: transformGeometry(feature.geometry, sourceProj, targetProj)
          }
        } catch (error) {
          console.error(`Error en feature ${index}:`, error)
          return feature
        }
      })
      
      console.log(`✅ ${filename}: ${transformedFeatures.length} features transformadas`)
      
      return {
        ...data,
        crs: { 
          type: "name", 
          properties: { name: "urn:ogc:def:crs:EPSG::4326" } 
        },
        features: transformedFeatures
      }
    } else {
      console.log(`✅ ${filename}: Ya en WGS84, sin transformación necesaria`)
      console.log(`✅ ${filename}: ${data.features.length} features cargadas`)
      return data
    }
    
  } catch (error) {
    console.error(`❌ ${filename}:`, error.message)
    throw error
  }
}

/**
 * Preprocesa macrorutas
 * OPTIMIZADO: Si los datos ya están procesados, retorna directamente
 */
export const preprocessMacrorutas = (geojson, operadoresMap) => {
  if (!geojson?.features) {
    throw new Error('GeoJSON de macrorutas inválido')
  }

  // OPTIMIZACIÓN: Verificar si ya está procesado
  const isAlreadyProcessed = geojson.features.length > 0 && 
                             geojson.features[0].properties?._processed === true
  
  if (isAlreadyProcessed) {
    console.log(`✅ Macrorutas ya procesadas, usando directamente (${geojson.features.length} features)`)
    return geojson
  }

  console.log(`🔄 Preprocesando ${geojson.features.length} macrorutas...`)

  // Crear mapa de operadores normalizado si no se proporciona
  let operadoresMapNormalizado = operadoresMap
  if (!operadoresMap) {
    operadoresMapNormalizado = {}
    Object.entries(OPERADORES_MAP).forEach(([localidad, operador]) => {
      const normalized = normalizeLocalidad(localidad)
      operadoresMapNormalizado[normalized] = operador
    })
  }

  // Rastrear localidades sin operador para evitar warnings repetidos
  const localidadesSinOperador = new Set()

  return {
    ...geojson,
    features: geojson.features.map((feature, index) => {
      const props = feature.properties || {}
      
      // Obtener localidad
      const localidadId = String(props.IDLOCALID_ || props.idlocalid_ || '')
      const localidadNombre = LOCALIDAD_ID_MAP[localidadId] || `Localidad ${localidadId}`
      const localidad = normalizeLocalidad(localidadNombre)
      
      // Obtener operador
      const operador = operadoresMapNormalizado[localidad] || 'desconocido'
      
      // Solo mostrar warning una vez por localidad
      if (operador === 'desconocido' && localidad && !localidadesSinOperador.has(localidad)) {
        localidadesSinOperador.add(localidad)
        console.warn(`⚠️ Sin operador asignado: ${localidadNombre} (normalizado: ${localidad}) - ID: ${localidadId}`)
      }
      
      // Frecuencia
      const frecuenciaId = String(props.IDFRECUE_ || props.idfrecue_ || '1')
      const frecuenciaMap = {
        '1': 'Lun - Mié - Vie',
        '2': 'Mar - Jue - Sáb',
        '3': 'Lun - Mié - Vie - Dom',
        '4': 'Diario'
      }
      const frecuencia = frecuenciaMap[frecuenciaId] || 'No disponible'
      
      // Jornada
      const horaInicio = props.HORAINICIO || 600
      const horaFin = props.HORAFIN || 1600
      
      let jornada = 'Día'
      if (horaInicio < 600) jornada = 'Madrugada'
      else if (horaInicio >= 600 && horaInicio < 1200) jornada = 'Mañana'
      else if (horaInicio >= 1200 && horaInicio < 1800) jornada = 'Tarde'
      else if (horaInicio >= 1800) jornada = 'Noche'
      if (horaFin > 2000) jornada += '-Noche'
      
      const horario = `${Math.floor(horaInicio/100)}:${String(horaInicio%100).padStart(2,'0')} - ${Math.floor(horaFin/100)}:${String(horaFin%100).padStart(2,'0')}`
      
      if (index < 3) {
        console.log(`   ${index}: ${localidadNombre} → ${operador}`)
      }
      
      return {
        ...feature,
        properties: {
          ...props,
          IDLOCALID_: localidadId,
          IDFRECUE_: frecuenciaId,
          LOCALIDAD: localidadNombre,
          LOCALIDAD_NORM: localidad,
          FRECUENCIA: frecuencia,
          JORNADA: jornada,
          HORARIO: horario,
          operador: operador,
          _processed: true,
          _index: index
        }
      }
    })
  }
}

/**
 * Preprocesa sitios de aprovechamiento
 * OPTIMIZADO: Si los datos ya están procesados, retorna directamente
 */
export const preprocessSitios = (geojson) => {
  if (!geojson?.features) {
    throw new Error('GeoJSON de sitios inválido')
  }

  // OPTIMIZACIÓN: Verificar si ya está procesado
  const isAlreadyProcessed = geojson.features.length > 0 && 
                             geojson.features[0].properties?._processed === true
  
  if (isAlreadyProcessed) {
    console.log(`✅ Sitios ya procesados, usando directamente (${geojson.features.length} features)`)
    return geojson
  }

  console.log(`🔄 Preprocesando ${geojson.features.length} sitios...`)

  return {
    ...geojson,
    features: geojson.features.map((feature, index) => {
      const props = feature.properties || {}
      
      const nombre = props.nombre || props.NOMBRE || 'Sin nombre'
      const tipo = props.tipo || props.TIPO || 'Punto de Reciclaje'
      
      // Materiales
      let materialesArray = []
      if (props.materiales) {
        if (Array.isArray(props.materiales)) {
          materialesArray = props.materiales
        } else if (typeof props.materiales === 'string') {
          materialesArray = props.materiales.split(',').map(m => m.trim())
        }
      }
      
      // Coordenadas
      let lat, lng
      if (feature.geometry?.type === 'Point') {
        [lng, lat] = feature.geometry.coordinates
      }
      
      return {
        ...feature,
        properties: {
          ...props,
          nombre,
          tipo,
          materiales_array: materialesArray,
          lat,
          lng,
          _processed: true
        }
      }
    })
  }
}

/**
 * Carga todos los datos
 */
export const loadAllData = async () => {
  console.log('🚀 Iniciando carga...')
  
  try {
    const [macrorutas, sitios] = await Promise.all([
      loadGeoJSON('macrobarr.geojson'),
      loadGeoJSON('sitio_aprovechamiento_residuos.geojson')
    ])
    
    console.log('✅ Carga completada')
    
    return { macrorutas, sitios }
  } catch (error) {
    console.error('❌ Error en carga:', error)
    throw error
  }
}