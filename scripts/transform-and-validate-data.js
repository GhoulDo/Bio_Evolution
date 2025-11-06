import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import proj4 from 'proj4'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dataDir = join(rootDir, 'assets', 'data')
const outputDir = join(rootDir, 'assets', 'data', 'processed')

// Definir proyecciones
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs')
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs')
proj4.defs('EPSG:9377', '+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')

// Mapeos desde constants.js
const LOCALIDAD_ID_MAP = {
  '1': 'USAQUÉN',
  '2': 'CHAPINERO',
  '3': 'SANTA FE',
  '4': 'SAN CRISTÓBAL',
  '5': 'USME',
  '6': 'TUNJUELITO',
  '7': 'BOSA',
  '8': 'KENNEDY',
  '9': 'FONTIBÓN',
  '10': 'ENGATIVÁ',
  '11': 'SUBA',
  '12': 'BARRIOS UNIDOS',
  '13': 'TEUSAQUILLO',
  '14': 'LOS MÁRTIRES',
  '15': 'ANTONIO NARIÑO',
  '16': 'PUENTE ARANDA',
  '17': 'LA CANDELARIA',
  '18': 'RAFAEL URIBE URIBE',
  '19': 'CIUDAD BOLÍVAR',
  '20': 'SUMAPAZ'
}

const OPERADORES_MAP = {
  'CHAPINERO': 'Area_Limpia',
  'USAQUÉN': 'Area_Limpia',
  'SANTA FE': 'Area_Limpia',
  'LA CANDELARIA': 'Area_Limpia',
  'SAN CRISTÓBAL': 'Area_Limpia',
  'SUMAPAZ': 'Area_Limpia',
  'CIUDAD BOLÍVAR': 'ciudad_limpia',
  'BOSA': 'ciudad_limpia',
  'TUNJUELITO': 'ciudad_limpia',
  'ANTONIO NARIÑO': 'ciudad_limpia',
  'PUENTE ARANDA': 'ciudad_limpia',
  'LOS MÁRTIRES': 'ciudad_limpia',
  'TEUSAQUILLO': 'ciudad_limpia',
  'RAFAEL URIBE URIBE': 'ciudad_limpia',
  'KENNEDY': 'Lime',
  'FONTIBÓN': 'Lime',
  'ENGATIVÁ': 'bogota_limpia',
  'BARRIOS UNIDOS': 'bogota_limpia',
  'SUBA': 'pro_ambiental'
}

const FRECUENCIA_MAP = {
  '1': 'Lun - Mié - Vie',
  '2': 'Mar - Jue - Sáb',
  '3': 'Lun - Mié - Vie - Dom',
  '4': 'Diario'
}

// Crear directorio de salida
if (!existsSync(outputDir)) {
  const fs = await import('fs')
  fs.mkdirSync(outputDir, { recursive: true })
  console.log('✅ Directorio de salida creado:', outputDir)
}

/**
 * Transforma coordenadas recursivamente
 */
function transformCoords(coords, sourceProj, targetProj) {
  if (!Array.isArray(coords)) return coords
  
  // Si es un punto [x, y]
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    try {
      const [x, y] = coords
      if (isNaN(x) || isNaN(y)) {
        console.warn('⚠️ Coordenadas inválidas:', coords)
        return coords
      }
      return proj4(sourceProj, targetProj, coords)
    } catch (error) {
      console.error('❌ Error transformando:', coords, error.message)
      return coords
    }
  }
  
  // Si es un array de coordenadas, transformar recursivamente
  return coords.map(coord => transformCoords(coord, sourceProj, targetProj))
}

/**
 * Transforma geometría completa
 */
function transformGeometry(geometry, sourceProj, targetProj) {
  if (!geometry || sourceProj === targetProj) return geometry
  
  return {
    ...geometry,
    coordinates: transformCoords(geometry.coordinates, sourceProj, targetProj)
  }
}

/**
 * Detecta la proyección de un GeoJSON
 */
function detectProjection(geojson, filename) {
  // 1. Verificar CRS en metadatos
  if (geojson.crs?.properties?.name) {
    const crsName = geojson.crs.properties.name.toLowerCase()
    if (crsName.includes('3857')) return 'EPSG:3857'
    if (crsName.includes('4326')) return 'EPSG:4326'
    if (crsName.includes('9377')) return 'EPSG:9377'
  }
  
  // 2. Detectar por rango de coordenadas
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
          firstCoord = coords[0]?.[0]
          break
        case 'MultiPolygon':
          firstCoord = coords[0]?.[0]?.[0]
          break
        default:
          firstCoord = null
      }
      
      if (firstCoord && Array.isArray(firstCoord) && firstCoord.length >= 2) {
        const [x, y] = firstCoord
        
        // Web Mercator
        if (Math.abs(x) > 1000000 || Math.abs(y) > 1000000) {
          return 'EPSG:3857'
        }
        
        // Sistema local Bogotá
        if ((x > 80000 && x < 150000) && (y > 80000 && y < 150000)) {
          return 'EPSG:9377'
        }
        
        // WGS84
        if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
          return 'EPSG:4326'
        }
      }
    }
  }
  
  return 'EPSG:4326' // Por defecto
}

/**
 * Procesa macrorutas
 */
function processMacrorutas(geojson) {
  console.log('🔄 Procesando macrorutas...')
  
  const sourceProj = detectProjection(geojson, 'macrobarr.geojson')
  const targetProj = 'EPSG:4326'
  
  console.log(`   Sistema origen: ${sourceProj}`)
  console.log(`   Sistema destino: ${targetProj}`)
  
  const processedFeatures = geojson.features.map((feature, index) => {
    const props = feature.properties || {}
    
    // Transformar geometría
    const geometry = transformGeometry(feature.geometry, sourceProj, targetProj)
    
    // Obtener localidad
    const localidadId = String(props.IDLOCALID_ || '')
    const localidadNombre = LOCALIDAD_ID_MAP[localidadId] || `Localidad ${localidadId}`
    
    // Obtener operador
    const operador = OPERADORES_MAP[localidadNombre] || 'desconocido'
    
    // Frecuencia
    const frecuenciaId = String(props.IDFRECUE_ || '1')
    const frecuencia = FRECUENCIA_MAP[frecuenciaId] || 'No disponible'
    
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
      console.log(`   ${index + 1}: ${localidadNombre} → ${operador}`)
    }
    
    return {
      ...feature,
      geometry,
      properties: {
        ...props,
        IDLOCALID_: localidadId,
        IDFRECUE_: frecuenciaId,
        LOCALIDAD: localidadNombre,
        LOCALIDAD_NORM: localidadNombre.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        FRECUENCIA: frecuencia,
        JORNADA: jornada,
        HORARIO: horario,
        operador: operador,
        _processed: true,
        _index: index
      }
    }
  })
  
  return {
    ...geojson,
    crs: { 
      type: "name", 
      properties: { name: "urn:ogc:def:crs:EPSG::4326" } 
    },
    features: processedFeatures
  }
}

/**
 * Valida coordenadas en Bogotá
 */
function validateBogotaBounds(coords) {
  const bogotaBounds = {
    north: 4.9,
    south: 4.4,
    east: -73.8,
    west: -74.3
  }
  
  if (coords && coords.length >= 2) {
    const [lng, lat] = coords
    return lat >= bogotaBounds.south && 
           lat <= bogotaBounds.north && 
           lng >= bogotaBounds.west && 
           lng <= bogotaBounds.east
  }
  return false
}

// Procesar macrobarr.geojson
console.log('🚀 Iniciando procesamiento de datos...\n')

try {
  console.log('📥 Cargando macrobarr.geojson...')
  const macrobarrData = JSON.parse(readFileSync(join(dataDir, 'macrobarr.geojson'), 'utf8'))
  console.log(`   ✅ Cargado: ${macrobarrData.features.length} features`)
  
  const processedMacrobarr = processMacrorutas(macrobarrData)
  
  // Validar algunas coordenadas
  let validCount = 0
  let invalidCount = 0
  processedMacrobarr.features.slice(0, 10).forEach(f => {
    if (f.geometry.type === 'MultiPolygon') {
      const coords = f.geometry.coordinates[0]?.[0]?.[0]
      if (validateBogotaBounds(coords)) {
        validCount++
      } else {
        invalidCount++
      }
    }
  })
  
  console.log(`   ✅ Validación: ${validCount} válidas, ${invalidCount} fuera de Bogotá (muestra de 10)`)
  
  // Guardar
  const outputPath = join(outputDir, 'macrobarr_processed.geojson')
  writeFileSync(outputPath, JSON.stringify(processedMacrobarr, null, 2))
  console.log(`   💾 Guardado en: ${outputPath}`)
  
  // Estadísticas
  const fileSize = (JSON.stringify(processedMacrobarr).length / (1024 * 1024)).toFixed(2)
  console.log(`   📊 Tamaño: ${fileSize} MB`)
  
} catch (error) {
  console.error('❌ Error procesando macrobarr.geojson:', error.message)
}

console.log('\n✅ Procesamiento completado')
console.log(`📁 Archivos procesados guardados en: ${outputDir}`)

