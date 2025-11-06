import * as turf from '@turf/turf'

/**
 * Spatial Index para búsqueda rápida de polígonos que contienen un punto
 * Usa bounding boxes para filtrar antes de hacer punto-en-polígono
 */
export class SpatialIndex {
  constructor(features = []) {
    this.features = features
    this.index = this.buildIndex()
  }

  /**
   * Construye un índice espacial basado en bounding boxes
   */
  buildIndex() {
    const index = []
    
    this.features.forEach((feature, idx) => {
      if (!feature.geometry) return
      
      try {
        const bbox = turf.bbox(feature.geometry)
        index.push({
          featureIndex: idx,
          bbox: {
            minX: bbox[0], // west
            minY: bbox[1], // south
            maxX: bbox[2], // east
            maxY: bbox[3]  // north
          }
        })
      } catch (error) {
        console.warn(`Error calculando bbox para feature ${idx}:`, error)
      }
    })
    
    return index
  }

  /**
   * Encuentra features que potencialmente contienen el punto
   * Retorna índices de features candidatas
   */
  findCandidates(lng, lat) {
    return this.index
      .filter(item => {
        const { bbox } = item
        return lng >= bbox.minX && 
               lng <= bbox.maxX && 
               lat >= bbox.minY && 
               lat <= bbox.maxY
      })
      .map(item => item.featureIndex)
  }

  /**
   * Encuentra la feature que contiene el punto
   * Usa el índice para filtrar candidatas antes de verificar punto-en-polígono
   */
  findContainingFeature(lng, lat) {
    const point = turf.point([lng, lat])
    const candidates = this.findCandidates(lng, lat)
    
    // Si no hay candidatas, retornar null
    if (candidates.length === 0) {
      return null
    }
    
    // Verificar punto-en-polígono solo para candidatas
    for (const idx of candidates) {
      const feature = this.features[idx]
      if (!feature.geometry) continue
      
      try {
        const polygon = turf.feature(feature.geometry)
        if (turf.booleanPointInPolygon(point, polygon)) {
          return feature
        }
      } catch (error) {
        console.warn(`Error verificando feature ${idx}:`, error)
        continue
      }
    }
    
    return null
  }

  /**
   * Actualiza el índice con nuevas features
   */
  update(features) {
    this.features = features
    this.index = this.buildIndex()
  }
}

/**
 * Crea un spatial index desde un GeoJSON
 */
export function createSpatialIndex(geojson) {
  if (!geojson || !geojson.features) {
    return new SpatialIndex([])
  }
  
  return new SpatialIndex(geojson.features)
}

