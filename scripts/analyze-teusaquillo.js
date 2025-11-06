import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Script para analizar específicamente la localidad de Teusaquillo
 * en el archivo macrobarr.geojson
 */

function analyzeTeusaquillo() {
  console.log('🔍 Analizando Teusaquillo en macrobarr.geojson...\n')
  
  const filePath = path.join(__dirname, '..', 'public', 'data', 'macrobarr.geojson')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Archivo no encontrado:', filePath)
    return
  }
  
  console.log('📥 Cargando archivo...')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  
  if (!data.features || !Array.isArray(data.features)) {
    console.error('❌ Formato GeoJSON inválido')
    return
  }
  
  // Verificar si está procesado
  const isProcessed = data.features[0]?.properties?._processed === true
  console.log(`📋 Archivo procesado: ${isProcessed ? 'Sí' : 'No'}`)
  
  // Detectar sistema de coordenadas
  if (data.features.length > 0) {
    const firstFeature = data.features[0]
    if (firstFeature.geometry?.coordinates) {
      const coords = extractFirstCoord(firstFeature.geometry)
      if (coords) {
        const [lng, lat] = coords
        // EPSG:3857 tiene valores muy grandes (millones), WGS84 tiene valores pequeños (-180 a 180, -90 a 90)
        if (Math.abs(lng) > 1000 || Math.abs(lat) > 1000) {
          console.log('⚠️ Coordenadas parecen estar en EPSG:3857 (Web Mercator)')
          console.log(`   Primera coordenada: [${lng.toFixed(2)}, ${lat.toFixed(2)}]`)
        } else {
          console.log('✓ Coordenadas parecen estar en WGS84')
          console.log(`   Primera coordenada: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`)
        }
      }
    }
  }
  
  // Filtrar features de Teusaquillo
  const teusaquilloFeatures = data.features.filter(feature => {
    const props = feature.properties || {}
    const localidad = String(props.LOCALIDAD || props.IDLOCALID_ || '').toUpperCase()
    return localidad.includes('TEUSAQUILLO') || localidad.includes('TEUSAQUI')
  })
  
  console.log(`\n📊 RESULTADOS PARA TEUSAQUILLO:`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Total de polígonos encontrados: ${teusaquilloFeatures.length}\n`)
  
  if (teusaquilloFeatures.length === 0) {
    console.log('⚠️ No se encontraron polígonos de Teusaquillo')
    console.log('\nBuscando por ID de localidad...')
    
    // Teusaquillo tiene ID 13 según LOCALIDAD_ID_MAP
    const byId = data.features.filter(f => {
      const id = String(f.properties?.IDLOCALID_ || f.properties?.idlocalid_ || '')
      return id === '13'
    })
    
    console.log(`Polígonos con ID 13: ${byId.length}`)
    
    if (byId.length > 0) {
      analyzeFeatures(byId, 'ID 13')
    }
    return
  }
  
  analyzeFeatures(teusaquilloFeatures, 'Teusaquillo')
}

function analyzeFeatures(features, label) {
  console.log(`\n📐 ANÁLISIS DETALLADO - ${label}:`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  
  let totalArea = 0
  let totalVertices = 0
  const bounds = {
    minLat: Infinity,
    maxLat: -Infinity,
    minLng: Infinity,
    maxLng: -Infinity
  }
  
  features.forEach((feature, index) => {
    const props = feature.properties || {}
    const geometry = feature.geometry
    
    if (!geometry || geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
      console.log(`\n⚠️ Feature ${index + 1}: Geometría no es polígono`)
      return
    }
    
    // Extraer coordenadas correctamente
    let allRings = []
    if (geometry.type === 'Polygon') {
      allRings = geometry.coordinates
    } else if (geometry.type === 'MultiPolygon') {
      allRings = geometry.coordinates.flat()
    }
    
    let featureMinLat = Infinity
    let featureMaxLat = -Infinity
    let featureMinLng = Infinity
    let featureMaxLng = -Infinity
    let vertices = 0
    let firstRing = null
    
    allRings.forEach((ring, ringIndex) => {
      if (!Array.isArray(ring) || ring.length === 0) return
      
      // El primer anillo es el exterior
      if (ringIndex === 0 || firstRing === null) {
        firstRing = ring
      }
      
      ring.forEach(coord => {
        if (!Array.isArray(coord) || coord.length < 2) return
        
        const [lng, lat] = coord
        if (typeof lat === 'number' && typeof lng === 'number' && 
            !isNaN(lat) && !isNaN(lng)) {
          featureMinLat = Math.min(featureMinLat, lat)
          featureMaxLat = Math.max(featureMaxLat, lat)
          featureMinLng = Math.min(featureMinLng, lng)
          featureMaxLng = Math.max(featureMaxLng, lng)
          vertices++
        }
      })
    })
    
    // Determinar si son coordenadas WGS84 o EPSG:3857
    const isWGS84 = Math.abs(featureMinLng) <= 180 && Math.abs(featureMaxLng) <= 180 &&
                    Math.abs(featureMinLat) <= 90 && Math.abs(featureMaxLat) <= 90
    
    // Calcular área usando bounds (más confiable)
    const latDiff = featureMaxLat - featureMinLat
    const lngDiff = featureMaxLng - featureMinLng
    let area = 0
    let latKm = 0
    let lngKm = 0
    
    if (isWGS84) {
      latKm = latDiff * 111 // 1 grado lat ≈ 111 km
      const avgLat = (featureMinLat + featureMaxLat) / 2
      lngKm = lngDiff * 111 * Math.cos(avgLat * Math.PI / 180)
      area = latKm * lngKm * 1000000 // metros²
    } else {
      // EPSG:3857: valores ya están en metros
      latKm = Math.abs(latDiff) / 1000 // convertir a km
      lngKm = Math.abs(lngDiff) / 1000
      area = Math.abs(latDiff * lngDiff) // metros²
    }
    
    totalArea += area
    totalVertices += vertices
    
    bounds.minLat = Math.min(bounds.minLat, featureMinLat)
    bounds.maxLat = Math.max(bounds.maxLat, featureMaxLat)
    bounds.minLng = Math.min(bounds.minLng, featureMinLng)
    bounds.maxLng = Math.max(bounds.maxLng, featureMaxLng)
    
    console.log(`\n📍 Polígono ${index + 1}:`)
    console.log(`   Localidad: ${props.LOCALIDAD || 'N/A'}`)
    console.log(`   Operador: ${props.operador || 'N/A'}`)
    console.log(`   Frecuencia: ${props.FRECUENCIA || 'N/A'}`)
    console.log(`   Jornada: ${props.JORNADA || 'N/A'}`)
    console.log(`   Tipo: ${geometry.type}`)
    console.log(`   Sistema: ${isWGS84 ? 'WGS84' : 'EPSG:3857 (Web Mercator)'}`)
    console.log(`   Vértices: ${vertices}`)
    console.log(`   Área aproximada: ${(area / 1000000).toFixed(2)} km²`)
    console.log(`   Bounds: [${featureMinLat.toFixed(2)}, ${featureMinLng.toFixed(2)}] a [${featureMaxLat.toFixed(2)}, ${featureMaxLng.toFixed(2)}]`)
    console.log(`   Extensión: ${latKm.toFixed(2)} km (lat) × ${lngKm.toFixed(2)} km (lng)`)
    
    if (area / 1000000 > 50) { // Más de 50 km²
      console.log(`   ⚠️ ADVERTENCIA: Polígono muy grande (${(area / 1000000).toFixed(2)} km²)`)
    }
  })
  
  console.log(`\n📊 RESUMEN TOTAL:`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Total de polígonos: ${features.length}`)
  console.log(`Total de vértices: ${totalVertices}`)
  console.log(`Área total aproximada: ${(totalArea / 1000000).toFixed(2)} km²`)
  console.log(`\nBounds totales:`)
  console.log(`   Latitud: ${bounds.minLat.toFixed(6)} a ${bounds.maxLat.toFixed(6)}`)
  console.log(`   Longitud: ${bounds.minLng.toFixed(6)} a ${bounds.maxLng.toFixed(6)}`)
  
  const totalLatDiff = bounds.maxLat - bounds.minLat
  const totalLngDiff = bounds.maxLng - bounds.minLng
  const isWGS84 = Math.abs(bounds.minLng) <= 180 && Math.abs(bounds.maxLng) <= 180
  
  let totalLatKm, totalLngKm
  if (isWGS84) {
    totalLatKm = totalLatDiff * 111
    totalLngKm = totalLngDiff * 111 * Math.cos((bounds.minLat + bounds.maxLat) / 2 * Math.PI / 180)
  } else {
    totalLatKm = Math.abs(totalLatDiff) / 1000
    totalLngKm = Math.abs(totalLngDiff) / 1000
  }
  
  console.log(`\nExtensión total:`)
  console.log(`   ${totalLatKm.toFixed(2)} km (Norte-Sur)`)
  console.log(`   ${totalLngKm.toFixed(2)} km (Este-Oeste)`)
  
  // Comparar con tamaño esperado de Teusaquillo
  // Teusaquillo tiene aproximadamente 14.21 km² según datos oficiales
  const expectedArea = 14.21 // km²
  const actualArea = totalArea / 1000000
  
  console.log(`\n📏 COMPARACIÓN:`)
  console.log(`   Área esperada (oficial): ~${expectedArea} km²`)
  console.log(`   Área calculada: ${actualArea.toFixed(2)} km²`)
  console.log(`   Diferencia: ${Math.abs(actualArea - expectedArea).toFixed(2)} km²`)
  
  if (Math.abs(actualArea - expectedArea) > expectedArea * 0.5) {
    console.log(`   ⚠️ ADVERTENCIA: El área difiere significativamente de la esperada`)
  }
}

// Extraer primera coordenada de cualquier geometría
function extractFirstCoord(geometry) {
  if (!geometry || !geometry.coordinates) return null
  
  if (geometry.type === 'Point') {
    return geometry.coordinates
  } else if (geometry.type === 'Polygon') {
    return geometry.coordinates[0]?.[0] || null
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates[0]?.[0]?.[0] || null
  }
  return null
}

// Fórmula de Shoelace para calcular área de polígono
function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0
  
  // Verificar si son coordenadas WGS84 o EPSG:3857
  const firstCoord = coordinates[0]
  const isWGS84 = Math.abs(firstCoord[0]) <= 180 && Math.abs(firstCoord[1]) <= 90
  
  let area = 0
  const n = coordinates.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const [x1, y1] = coordinates[i]
    const [x2, y2] = coordinates[j]
    
    if (typeof y1 === 'number' && typeof x1 === 'number' &&
        typeof y2 === 'number' && typeof x2 === 'number') {
      area += x1 * y2
      area -= x2 * y1
    }
  }
  
  area = Math.abs(area / 2)
  
  if (isWGS84) {
    // WGS84: convertir grados a metros cuadrados
    // 1 grado lat ≈ 111 km, 1 grado lng ≈ 111 km * cos(lat)
    return area * 111000 * 111000 // metros² (aproximado)
  } else {
    // EPSG:3857: ya está en metros, pero el cálculo de Shoelace no es correcto para proyección Mercator
    // Retornar 0 y calcular área de otra manera
    return 0
  }
}

// Calcular área usando bounds (más preciso para EPSG:3857)
function calculateAreaFromBounds(minLat, maxLat, minLng, maxLng, isWGS84) {
  if (isWGS84) {
    const latDiff = (maxLat - minLat) * 111000 // metros
    const avgLat = (minLat + maxLat) / 2
    const lngDiff = (maxLng - minLng) * 111000 * Math.cos(avgLat * Math.PI / 180) // metros
    return latDiff * lngDiff // metros²
  } else {
    // EPSG:3857: ya está en metros
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    return Math.abs(latDiff * lngDiff) // metros²
  }
}

// Ejecutar análisis
try {
  analyzeTeusaquillo()
} catch (error) {
  console.error('❌ Error:', error.message)
  console.error(error.stack)
}

