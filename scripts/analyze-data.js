import { readFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dataDir = join(rootDir, 'assets', 'data')

console.log('🔍 ANÁLISIS DETALLADO DE ARCHIVOS DE DATOS\n')
console.log('='.repeat(80))

// Función para analizar un GeoJSON
function analyzeGeoJSON(filename, filepath) {
  console.log(`\n📄 ARCHIVO: ${filename}`)
  console.log('-'.repeat(80))
  
  try {
    // Información del archivo
    const stats = statSync(filepath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`📊 Tamaño: ${fileSizeMB} MB`)
    
    // Leer archivo
    const content = readFileSync(filepath, 'utf-8')
    const data = JSON.parse(content)
    
    // Validación básica
    if (data.type !== 'FeatureCollection') {
      console.log('❌ ERROR: No es un FeatureCollection válido')
      return
    }
    
    console.log(`✅ Tipo: ${data.type}`)
    console.log(`📦 Features: ${data.features.length}`)
    
    // CRS/Proyección
    if (data.crs) {
      console.log(`📍 CRS: ${JSON.stringify(data.crs)}`)
    } else {
      console.log(`📍 CRS: No especificado (asumir WGS84)`)
    }
    
    // Analizar primera feature
    if (data.features.length > 0) {
      const firstFeature = data.features[0]
      console.log(`\n🔍 Primera Feature:`)
      console.log(`   Tipo geometría: ${firstFeature.geometry?.type}`)
      
      if (firstFeature.geometry?.coordinates) {
        const coords = firstFeature.geometry.coordinates
        let sampleCoord
        
        if (firstFeature.geometry.type === 'Point') {
          sampleCoord = coords
        } else if (firstFeature.geometry.type === 'Polygon') {
          sampleCoord = coords[0]?.[0]
        } else if (firstFeature.geometry.type === 'MultiPolygon') {
          sampleCoord = coords[0]?.[0]?.[0]
        }
        
        if (sampleCoord && sampleCoord.length >= 2) {
          const [x, y] = sampleCoord
          console.log(`   Coordenada muestra: [${x.toFixed(6)}, ${y.toFixed(6)}]`)
          
          // Detectar proyección
          if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
            console.log(`   ✅ Sistema: WGS84 (EPSG:4326) - Coordenadas geográficas`)
          } else if (Math.abs(x) > 100000 || Math.abs(y) > 100000) {
            console.log(`   ⚠️ Sistema: Probablemente Web Mercator (EPSG:3857) o sistema local`)
          } else if ((x > 80000 && x < 150000) && (y > 80000 && y < 150000)) {
            console.log(`   ⚠️ Sistema: Probablemente EPSG:9377 (Sistema local Bogotá)`)
          } else {
            console.log(`   ⚠️ Sistema: Desconocido - Requiere transformación`)
          }
        }
      }
      
      // Propiedades
      console.log(`\n📋 Propiedades disponibles:`)
      const props = firstFeature.properties || {}
      const propKeys = Object.keys(props)
      console.log(`   Total: ${propKeys.length} campos`)
      
      // Mostrar todas las propiedades
      propKeys.forEach(key => {
        const value = props[key]
        const valueType = Array.isArray(value) ? 'array' : typeof value
        const valuePreview = typeof value === 'string' 
          ? (value.length > 50 ? value.substring(0, 50) + '...' : value)
          : (typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : value)
        
        console.log(`   - ${key}: ${valueType} = ${valuePreview}`)
      })
    }
    
    // Estadísticas de propiedades
    if (data.features.length > 0) {
      console.log(`\n📊 Estadísticas de Propiedades:`)
      const allProps = new Set()
      const propCounts = {}
      
      data.features.forEach(feature => {
        Object.keys(feature.properties || {}).forEach(key => {
          allProps.add(key)
          propCounts[key] = (propCounts[key] || 0) + 1
        })
      })
      
      console.log(`   Campos únicos: ${allProps.size}`)
      console.log(`   Campos presentes en todas las features: ${Object.keys(propCounts).filter(k => propCounts[k] === data.features.length).length}`)
      
      // Campos opcionales
      const optionalFields = Object.keys(propCounts).filter(k => propCounts[k] < data.features.length)
      if (optionalFields.length > 0) {
        console.log(`\n   ⚠️ Campos opcionales (no en todas las features):`)
        optionalFields.forEach(field => {
          const percentage = ((propCounts[field] / data.features.length) * 100).toFixed(1)
          console.log(`      - ${field}: ${propCounts[field]}/${data.features.length} (${percentage}%)`)
        })
      }
    }
    
    // Validar coordenadas
    console.log(`\n🌍 Validación de Coordenadas:`)
    let validCoords = 0
    let invalidCoords = 0
    let outOfBogota = 0
    const bogotaBounds = { north: 4.9, south: 4.4, east: -73.8, west: -74.3 }
    
    data.features.slice(0, Math.min(100, data.features.length)).forEach(feature => {
      if (!feature.geometry) {
        invalidCoords++
        return
      }
      
      let coords = null
      if (feature.geometry.type === 'Point') {
        coords = feature.geometry.coordinates
      } else if (feature.geometry.type === 'Polygon') {
        coords = feature.geometry.coordinates[0]?.[0]
      } else if (feature.geometry.type === 'MultiPolygon') {
        coords = feature.geometry.coordinates[0]?.[0]?.[0]
      }
      
      if (coords && coords.length >= 2) {
        const [x, y] = coords
        
        // Verificar si son coordenadas geográficas válidas
        if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
          validCoords++
          
          // Verificar si están en Bogotá
          if (y < bogotaBounds.south || y > bogotaBounds.north || 
              x < bogotaBounds.west || x > bogotaBounds.east) {
            outOfBogota++
          }
        } else {
          invalidCoords++
        }
      } else {
        invalidCoords++
      }
    })
    
    const sampleSize = Math.min(100, data.features.length)
    console.log(`   Muestra analizada: ${sampleSize} features`)
    console.log(`   ✅ Coordenadas válidas (WGS84): ${validCoords}`)
    if (invalidCoords > 0) {
      console.log(`   ⚠️ Coordenadas que requieren transformación: ${invalidCoords}`)
    }
    if (outOfBogota > 0) {
      console.log(`   ⚠️ Coordenadas fuera de Bogotá: ${outOfBogota}`)
    }
    
    // Análisis específico por tipo de archivo
    if (filename.includes('macrobarr')) {
      console.log(`\n🚛 Análisis Específico - Macrorutas:`)
      
      const localidades = new Set()
      const operadores = new Set()
      const frecuencias = new Set()
      
      data.features.forEach(f => {
        const props = f.properties || {}
        if (props.LOCALIDAD) localidades.add(props.LOCALIDAD)
        if (props.operador) operadores.add(props.operador)
        if (props.FRECUENCIA) frecuencias.add(props.FRECUENCIA)
        if (props.IDLOCALID_) localidades.add(`ID:${props.IDLOCALID_}`)
      })
      
      console.log(`   Localidades encontradas: ${localidades.size}`)
      console.log(`   Operadores encontrados: ${operadores.size}`)
      console.log(`   Frecuencias únicas: ${frecuencias.size}`)
      
      if (localidades.size > 0) {
        console.log(`   Localidades: ${Array.from(localidades).slice(0, 10).join(', ')}${localidades.size > 10 ? '...' : ''}`)
      }
    }
    
    if (filename.includes('sitio_aprovechamiento')) {
      console.log(`\n♻️ Análisis Específico - Sitios de Aprovechamiento:`)
      
      const tipos = new Set()
      const localidades = new Set()
      const materiales = new Set()
      let conHorario = 0
      let conTelefono = 0
      
      data.features.forEach(f => {
        const props = f.properties || {}
        if (props.tipo || props.TIPO) tipos.add(props.tipo || props.TIPO)
        if (props.localidad || props.LOCALIDAD) localidades.add(props.localidad || props.LOCALIDAD)
        if (props.horario || props.HORARIO) conHorario++
        if (props.telefono || props.TELEFONO) conTelefono++
        
        // Materiales
        const mats = props.materiales || props.MATERIALES || props.materiales_array
        if (mats) {
          if (Array.isArray(mats)) {
            mats.forEach(m => materiales.add(m))
          } else if (typeof mats === 'string') {
            mats.split(',').forEach(m => materiales.add(m.trim()))
          }
        }
      })
      
      console.log(`   Tipos de sitio: ${tipos.size} (${Array.from(tipos).join(', ')})`)
      console.log(`   Localidades: ${localidades.size}`)
      console.log(`   Materiales únicos: ${materiales.size} (${Array.from(materiales).slice(0, 10).join(', ')}${materiales.size > 10 ? '...' : ''})`)
      console.log(`   Con horario: ${conHorario}/${data.features.length} (${((conHorario/data.features.length)*100).toFixed(1)}%)`)
      console.log(`   Con teléfono: ${conTelefono}/${data.features.length} (${((conTelefono/data.features.length)*100).toFixed(1)}%)`)
    }
    
    console.log(`\n✅ Análisis completado para ${filename}`)
    
  } catch (error) {
    console.log(`\n❌ ERROR analizando ${filename}:`)
    console.log(`   ${error.message}`)
  }
}

// Analizar todos los archivos
const files = [
  'macrobarr.geojson',
  'sitio_aprovechamiento_residuos.geojson',
  'sitio_aprovechamiento_residuos_solidos.geojson'
]

files.forEach(filename => {
  const filepath = join(dataDir, filename)
  try {
    analyzeGeoJSON(filename, filepath)
  } catch (error) {
    console.log(`\n❌ No se pudo analizar ${filename}: ${error.message}`)
  }
})

console.log(`\n${'='.repeat(80)}`)
console.log('✅ Análisis completo finalizado')

