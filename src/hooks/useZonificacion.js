import { useCallback, useMemo } from 'react'
import * as turf from '@turf/turf'
import useAppStore from '../store/useAppStore'
import { OPERADORES_NOMBRES } from '../utils/constants'
import { createSpatialIndex } from '../utils/spatialIndex'

/**
 * Hook para determinar zona de recolección del usuario
 * OPTIMIZADO: Usa spatial index para búsqueda rápida
 */
export const useZonificacion = () => {
  const { macrorutas, setUserZona } = useAppStore()
  
  // Crear spatial index una vez cuando macrorutas cambian
  const spatialIndex = useMemo(() => {
    if (!macrorutas || !macrorutas.features) {
      return null
    }
    console.log('🔧 Construyendo spatial index para búsqueda rápida...')
    return createSpatialIndex(macrorutas)
  }, [macrorutas])
  
  /**
   * Búsqueda lineal (fallback si no hay spatial index)
   */
  const findZonaLinear = useCallback((lat, lng, macrorutasData) => {
    const point = turf.point([lng, lat])
    
    for (const feature of macrorutasData.features) {
      try {
        if (!feature.geometry) continue
        
        const polygon = turf.feature(feature.geometry)
        
        if (turf.booleanPointInPolygon(point, polygon)) {
          const props = feature.properties
          
          return {
            localidad: props.LOCALIDAD_NORM || props.LOCALIDAD,
            frecuencia: props.FRECUENCIA || 'No disponible',
            jornada: props.JORNADA || 'No disponible',
            operador_id: props.operador || 'desconocido',
            operador_nombre: OPERADORES_NOMBRES[props.operador] || 'Desconocido',
            fuente: 'macrobarr.geojson',
            fecha_dato: '2021-11-30',
            geometry: feature.geometry
          }
        }
      } catch (error) {
        console.error('❌ Error procesando feature:', error)
      }
    }
    
    return null
  }, [])
  
  /**
   * Encuentra la zona de recolección para unas coordenadas
   * OPTIMIZADO: Usa spatial index para filtrar candidatas antes de verificar
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {Object|null} Información de la zona
   */
  const findZona = useCallback((lat, lng) => {
    if (!macrorutas || !macrorutas.features) {
      console.warn('⚠️ Macrorutas no cargadas aún')
      return null
    }
    
    if (!spatialIndex) {
      console.warn('⚠️ Spatial index no disponible, usando búsqueda lineal')
      // Fallback a búsqueda lineal si no hay index
      return findZonaLinear(lat, lng, macrorutas)
    }
    
    console.log(`🔍 Buscando zona para coordenadas: [${lat}, ${lng}]`)
    
    // Usar spatial index para encontrar feature que contiene el punto
    const feature = spatialIndex.findContainingFeature(lng, lat)
    
    if (feature) {
      const props = feature.properties
      
      const zona = {
        localidad: props.LOCALIDAD_NORM || props.LOCALIDAD,
        frecuencia: props.FRECUENCIA || 'No disponible',
        jornada: props.JORNADA || 'No disponible',
        operador_id: props.operador || 'desconocido',
        operador_nombre: OPERADORES_NOMBRES[props.operador] || 'Desconocido',
        fuente: 'macrobarr.geojson',
        fecha_dato: '2021-11-30',
        geometry: feature.geometry
      }
      
      console.log('✅ Zona encontrada:', {
        localidad: zona.localidad,
        operador: zona.operador_nombre
      })
      
      return zona
    }
    
    console.warn(`⚠️ Punto fuera de zonas: [${lat}, ${lng}]`)
    return null
    
  }, [macrorutas, spatialIndex, findZonaLinear])
  
  /**
   * Establece la ubicación del usuario y determina su zona
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {Object|null} Zona encontrada
   */
  const setUserLocationAndZona = useCallback((lat, lng) => {
    const zona = findZona(lat, lng)
    setUserZona(zona)
    return zona
  }, [findZona, setUserZona])
  
  /**
   * Parsea la frecuencia a días de la semana
   * @param {string} frecuencia - Ej: "Mar - Jue - Sab"
   * @returns {Array<string>} Días normalizados
   */
  const parseFrecuencia = useCallback((frecuencia) => {
    if (!frecuencia) return []
    
    const diasMap = {
      'Lun': 'Lunes',
      'Mar': 'Martes',
      'Mie': 'Miércoles',
      'Jue': 'Jueves',
      'Vie': 'Viernes',
      'Sab': 'Sábado',
      'Dom': 'Domingo'
    }
    
    return frecuencia
      .split('-')
      .map(d => d.trim())
      .map(d => diasMap[d] || d)
      .filter(Boolean)
  }, [])
  
  /**
   * Genera horarios estimados basados en frecuencia y jornada
   * @param {string} frecuencia - Ej: "Mar - Jue - Sab"
   * @param {string} jornada - "Día" | "Noche" | "Mañana-Noche"
   * @returns {Array<Object>} Ventanas horarias estimadas
   */
  const generarHorariosEstimados = useCallback((frecuencia, jornada) => {
    const dias = parseFrecuencia(frecuencia)
    
    const horariosPorJornada = {
      'Día': { inicio: '06:00', fin: '14:00' },
      'Noche': { inicio: '18:00', fin: '22:00' },
      'Mañana-Noche': { inicio: '06:00', fin: '22:00' }
    }
    
    const horario = horariosPorJornada[jornada] || horariosPorJornada['Día']
    
    return dias.map(dia => ({
      dia,
      hora_ini: horario.inicio,
      hora_fin: horario.fin,
      tipo: 'ordinarios',
      estimado: true
    }))
  }, [parseFrecuencia])
  
  return {
    findZona,
    setUserLocationAndZona,
    parseFrecuencia,
    generarHorariosEstimados
  }
}
