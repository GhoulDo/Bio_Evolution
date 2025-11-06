import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import proj4 from 'proj4'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dataDir = join(rootDir, 'assets', 'data')
const outputDir = join(rootDir, 'assets', 'data', 'processed')
const publicDataDir = join(rootDir, 'public', 'data')

// Crear directorios si no existen
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
  console.log('✅ Directorio de salida creado:', outputDir)
}

if (!existsSync(publicDataDir)) {
  mkdirSync(publicDataDir, { recursive: true })
  console.log('✅ Directorio public/data creado:', publicDataDir)
}

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

/**
 * Simplifica coordenadas reduciendo precisión (optimización de tamaño)
 */
function simplifyCoords(coords, precision = 6) {
  if (!Array.isArray(coords)) return coords
  
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    // Reducir precisión decimal
    return [
      Math.round(coords[0] * Math.pow(10, precision)) / Math.pow(10, precision),
      Math.round(coords[1] * Math.pow(10, precision)) / Math.pow(10, precision)
    ]
  }
  
  return coords.map(coord => simplifyCoords(coord, precision))
}

/**
 * Transforma coordenadas recursivamente
 */
function transformCoords(coords, sourceProj, targetProj) {
  if (!Array.isArray(coords)) return coords
  
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    try {
      const [x, y] = coords
      if (isNaN(x) || isNaN(y)) {
        console.warn('⚠️ Coordenadas inválidas:', coords)
        return coords
      }
      const transformed = proj4(sourceProj, targetProj, coords)
      return transformed
    } catch (error) {
      console.error('❌ Error transformando:', coords, error.message)
      return coords
    }
  }
  
  return coords.map(coord => transformCoords(coord, sourceProj, targetProj))
}

/**
 * Transforma geometría completa
 */
function transformGeometry(geometry, sourceProj, targetProj) {
  if (!geometry || sourceProj === targetProj) return geometry
  
  const transformed = {
    ...geometry,
    coordinates: transformCoords(geometry.coordinates, sourceProj, targetProj)
  }
  
  // Simplificar coordenadas para reducir tamaño (6 decimales = ~10cm precisión)
  transformed.coordinates = simplifyCoords(transformed.coordinates, 6)
  
  return transformed
}

/**
 * Detecta la proyección de un GeoJSON
 */
function detectProjection(geojson, filename) {
  if (geojson.crs?.properties?.name) {
    const crsName = geojson.crs.properties.name.toLowerCase()
    if (crsName.includes('3857')) return 'EPSG:3857'
    if (crsName.includes('4326')) return 'EPSG:4326'
    if (crsName.includes('9377')) return 'EPSG:9377'
  }
  
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
        
        if (Math.abs(x) > 1000000 || Math.abs(y) > 1000000) {
          return 'EPSG:3857'
        }
        
        if ((x > 80000 && x < 150000) && (y > 80000 && y < 150000)) {
          return 'EPSG:9377'
        }
        
        if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
          return 'EPSG:4326'
        }
      }
    }
  }
  
  return 'EPSG:4326'
}

/**
 * Procesa macrorutas: transforma coordenadas y pre-procesa campos
 */
function processMacrorutas(geojson) {
  console.log('🔄 Procesando macrorutas...')
  
  const sourceProj = detectProjection(geojson, 'macrobarr.geojson')
  const targetProj = 'EPSG:4326'
  
  console.log(`   Sistema origen: ${sourceProj}`)
  console.log(`   Sistema destino: ${targetProj}`)
  
  let processedCount = 0
  let errorCount = 0
  
  const processedFeatures = geojson.features.map((feature, index) => {
    try {
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
      
      if (index < 5) {
        console.log(`   ${index + 1}: ${localidadNombre} → ${operador} (${frecuencia})`)
      }
      
      processedCount++
      
      return {
        type: 'Feature',
        geometry,
        properties: {
          // Mantener campos originales importantes
          IDMACRUT: props.IDMACRUT,
          IDLOCALID_: localidadId,
          IDFRECUE_: frecuenciaId,
          HORAINICIO: horaInicio,
          HORAFIN: horaFin,
          FECVIGDES_: props.FECVIGDES_,
          // Campos procesados
          LOCALIDAD: localidadNombre,
          LOCALIDAD_NORM: localidadNombre.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          FRECUENCIA: frecuencia,
          JORNADA: jornada,
          HORARIO: horario,
          operador: operador,
          _processed: true
        }
      }
    } catch (error) {
      errorCount++
      console.error(`   ❌ Error procesando feature ${index}:`, error.message)
      return feature
    }
  })
  
  console.log(`   ✅ Procesadas: ${processedCount}, Errores: ${errorCount}`)
  
  return {
    type: 'FeatureCollection',
    crs: { 
      type: "name", 
      properties: { name: "urn:ogc:def:crs:EPSG::4326" } 
    },
    features: processedFeatures
  }
}

/**
 * Procesa sitios de aprovechamiento solidos (transforma coordenadas)
 */
function processSitiosSolidos(geojson) {
  console.log('🔄 Procesando sitios solidos...')
  
  const sourceProj = detectProjection(geojson, 'sitio_aprovechamiento_residuos_solidos.geojson')
  const targetProj = 'EPSG:4326'
  
  console.log(`   Sistema origen: ${sourceProj}`)
  console.log(`   Sistema destino: ${targetProj}`)
  
  const processedFeatures = geojson.features.map((feature, index) => {
    const props = feature.properties || {}
    
    // Transformar geometría
    const geometry = transformGeometry(feature.geometry, sourceProj, targetProj)
    
    // Extraer información del nombre
    const nombre = props.NOMBRE || ''
    
    // Intentar extraer tipo y localidad del nombre
    let tipo = 'Punto de Reciclaje'
    if (nombre.includes('ECA')) tipo = 'ECA'
    else if (nombre.includes('Punto Verde')) tipo = 'Punto Verde'
    
    // Extraer localidad (básico)
    let localidad = ''
    const localidades = Object.values(LOCALIDAD_ID_MAP)
    for (const loc of localidades) {
      if (nombre.toUpperCase().includes(loc.toUpperCase())) {
        localidad = loc
        break
      }
    }
    
    return {
      type: 'Feature',
      geometry,
      properties: {
        CODIGO_ID: props.CODIGO_ID || '',
        NOMBRE: nombre,
        tipo: tipo,
        localidad: localidad || 'No especificada',
        direccion: nombre.split('CHIP')[0]?.trim() || nombre,
        materiales: 'papel,plástico,vidrio,metal', // Por defecto
        horario: 'Consultar',
        telefono: null,
        ACTO_ADMIN: props.ACTO_ADMIN,
        NUMERO_ACT: props.NUMERO_ACT,
        FECHA_ACTO: props.FECHA_ACTO,
        _processed: true,
        _source: 'sitio_aprovechamiento_residuos_solidos'
      }
    }
  })
  
  return {
    type: 'FeatureCollection',
    crs: { 
      type: "name", 
      properties: { name: "urn:ogc:def:crs:EPSG::4326" } 
    },
    features: processedFeatures
  }
}

// Procesar archivos
console.log('🚀 Iniciando optimización de datos...\n')
console.log('='.repeat(80))

// 1. Procesar macrobarr.geojson
try {
  console.log('\n📥 [1/2] Procesando macrobarr.geojson...')
  const stats = statSync(join(dataDir, 'macrobarr.geojson'))
  const originalSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
  console.log(`   Tamaño original: ${originalSizeMB} MB`)
  
  const macrobarrData = JSON.parse(readFileSync(join(dataDir, 'macrobarr.geojson'), 'utf8'))
  console.log(`   Features: ${macrobarrData.features.length}`)
  
  const processedMacrobarr = processMacrorutas(macrobarrData)
  
  // Guardar versión procesada
  const outputPath = join(outputDir, 'macrobarr_processed.geojson')
  const jsonString = JSON.stringify(processedMacrobarr)
  writeFileSync(outputPath, jsonString)
  
  const newSizeMB = (jsonString.length / (1024 * 1024)).toFixed(2)
  const reduction = ((1 - jsonString.length / stats.size) * 100).toFixed(1)
  
  console.log(`   ✅ Guardado en: ${outputPath}`)
  console.log(`   📊 Tamaño nuevo: ${newSizeMB} MB (reducción: ${reduction}%)`)
  
  // Copiar a public/data para uso en la app
  const publicPath = join(publicDataDir, 'macrobarr.geojson')
  writeFileSync(publicPath, jsonString)
  console.log(`   📋 Copiado a: ${publicPath}`)
  
} catch (error) {
  console.error('❌ Error procesando macrobarr.geojson:', error.message)
  console.error(error.stack)
}

// 2. Procesar sitio_aprovechamiento_residuos_solidos.geojson
try {
  console.log('\n📥 [2/2] Procesando sitio_aprovechamiento_residuos_solidos.geojson...')
  
  if (!existsSync(join(dataDir, 'sitio_aprovechamiento_residuos_solidos.geojson'))) {
    console.log('   ⚠️ Archivo no encontrado, saltando...')
  } else {
    const solidosData = JSON.parse(readFileSync(join(dataDir, 'sitio_aprovechamiento_residuos_solidos.geojson'), 'utf8'))
    console.log(`   Features: ${solidosData.features.length}`)
    
    const processedSolidos = processSitiosSolidos(solidosData)
    
    // Guardar versión procesada
    const outputPath = join(outputDir, 'sitio_aprovechamiento_residuos_solidos_processed.geojson')
    writeFileSync(outputPath, JSON.stringify(processedSolidos, null, 2))
    console.log(`   ✅ Guardado en: ${outputPath}`)
    
    // NOTA: No copiamos a public/data porque el otro archivo de sitios es mejor
    console.log(`   ℹ️ Nota: Usar sitio_aprovechamiento_residuos.geojson que está completo`)
  }
  
} catch (error) {
  console.error('❌ Error procesando sitios solidos:', error.message)
}

// 3. Copiar sitio_aprovechamiento_residuos.geojson (ya está listo)
try {
  console.log('\n📥 [3/3] Copiando sitio_aprovechamiento_residuos.geojson (ya optimizado)...')
  
  const sitiosPath = join(dataDir, 'sitio_aprovechamiento_residuos.geojson')
  if (existsSync(sitiosPath)) {
    const sitiosData = readFileSync(sitiosPath, 'utf8')
    const publicPath = join(publicDataDir, 'sitio_aprovechamiento_residuos.geojson')
    writeFileSync(publicPath, sitiosData)
    console.log(`   ✅ Copiado a: ${publicPath}`)
  } else {
    console.log('   ⚠️ Archivo no encontrado')
  }
  
} catch (error) {
  console.error('❌ Error copiando sitios:', error.message)
}

console.log('\n' + '='.repeat(80))
console.log('✅ Optimización completada!')
console.log(`📁 Archivos procesados en: ${outputDir}`)
console.log(`📁 Archivos listos para usar en: ${publicDataDir}`)
console.log('\n💡 Próximo paso: Actualizar dataLoader.js para usar archivos optimizados')

