import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import useAppStore from '../store/useAppStore'
import { BOGOTA_CENTER, DEFAULT_ZOOM, OPERADOR_COLORS, OPERADORES_NOMBRES } from '../utils/constants'

// Fix para iconos de Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapView = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef({
    macrorutas: null,
    sitios: null,
    userMarker: null
  })
  const [isLegendOpen, setIsLegendOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('map-legend-open') === 'true'
  })
  const [activeOperatorFilter, setActiveOperatorFilter] = useState(null)
  const operatorLayersRef = useRef({})
  
  const { 
    macrorutas, 
    sitiosAprovechamiento, 
    userLocation, 
    activeLayers,
    setSelectedSitio 
  } = useAppStore()
  
  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    
    console.log('🗺️ Inicializando mapa...')
    
    const map = L.map(mapRef.current, {
      center: BOGOTA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true
    })
    
    // Capa base - OpenStreetMap con mejor visibilidad
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      opacity: 1.0 // Máxima opacidad para ver calles claramente
    }).addTo(map)
    
    mapInstanceRef.current = map
    console.log('✅ Mapa inicializado')
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLegendOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('map-legend-open', isLegendOpen ? 'true' : 'false')
  }, [isLegendOpen])

  const applyOperatorHighlight = (operador) => {
    if (!operadorLayersRef.current[operador]) return
    operatorLayersRef.current[operador].forEach(layer => {
      const color = OPERADOR_COLORS[operador] || OPERADOR_COLORS.desconocido
      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      layer.setStyle({
        weight: 3,
        opacity: 1,
        color: hexToRgba(color, 1),
        fillColor: hexToRgba(color, 0.25),
        fillOpacity: 0.25
      })
      if (!layer.isTooltipOpen) {
        layer.openTooltip()
        layer.isTooltipOpen = true
      }
    })
  }

  const resetOperatorHighlight = (operador) => {
    if (!operadorLayersRef.current[operador]) return
    operatorLayersRef.current[operador].forEach(layer => {
      if (layer.featureOriginalStyle) {
        layer.setStyle(layer.featureOriginalStyle)
      }
      if (layer.isTooltipOpen) {
        layer.closeTooltip()
        layer.isTooltipOpen = false
      }
    })
  }

  const applyOperatorFilterStyles = () => {
    const currentFilter = activeOperatorFilter
    Object.entries(operatorLayersRef.current).forEach(([operador, layers]) => {
      layers.forEach(layer => {
        if (!layer.featureOriginalStyle) return
        if (!currentFilter || operador === currentFilter) {
          layer.setStyle(layer.featureOriginalStyle)
          return
        }
        const baseStyle = layer.featureOriginalStyle
        layer.setStyle({
          ...baseStyle,
          fillOpacity: Math.max(baseStyle.fillOpacity * 0.3, 0.01),
          opacity: Math.max(baseStyle.opacity * 0.4, 0.15)
        })
      })
    })
  }
  
  // Renderizar macrorutas
  useEffect(() => {
    if (!mapInstanceRef.current || !macrorutas) return
    
    console.log('🔄 Renderizando macrorutas...', macrorutas.features?.length)
    
    // Remover capa anterior
    if (layersRef.current.macrorutas) {
      mapInstanceRef.current.removeLayer(layersRef.current.macrorutas)
      layersRef.current.macrorutas = null
    }
    operatorLayersRef.current = {}
    
    if (!activeLayers.macrorutas) return
    
    try {
      // Contador de polígonos por operador
      const operadorCounts = {}
      
      const layer = L.geoJSON(macrorutas, {
        style: (feature) => {
          const operador = feature.properties?.operador || 'desconocido'
          const color = OPERADOR_COLORS[operador] || OPERADOR_COLORS.desconocido
          
          // Contar
          operadorCounts[operador] = (operadorCounts[operador] || 0) + 1
          
          // Convertir color hex a rgba con opacidad muy baja para mejor visibilidad de calles
          const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
          }
          
          return {
            fillColor: hexToRgba(color, 0.08), // Opacidad muy baja: 0.08 (8%) para ver calles claramente
            weight: 1.2, // Borde más delgado
            opacity: 0.6, // Borde más sutil
            color: hexToRgba(color, 0.5), // Borde con color pero más transparente
            fillOpacity: 0.08, // Relleno muy transparente
            dashArray: operador === 'desconocido' ? '5, 5' : null
          }
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {}
          const operadorNombre = OPERADORES_NOMBRES[props.operador] || 'Desconocido'
          const color = OPERADOR_COLORS[props.operador] || OPERADOR_COLORS.desconocido
          
          // Función para convertir hex a rgba
          const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
          }
          
          // Guardar estilo original para restaurarlo después
          const originalStyle = {
            fillColor: hexToRgba(color, 0.08), // Opacidad muy baja
            weight: 1.2,
            opacity: 0.6,
            color: hexToRgba(color, 0.5),
            fillOpacity: 0.08, // Muy transparente para ver calles
            dashArray: props.operador === 'desconocido' ? '5, 5' : null
          }
          
          const popupContent = `
            <div class="p-3 min-w-[220px]" style="border-left: 4px solid ${color}">
              <h3 class="font-bold text-lg mb-2" style="color: ${color}">
                ${props.LOCALIDAD || 'N/A'}
              </h3>
              <div class="space-y-2 text-sm">
                <p class="flex items-center gap-2">
                  <span class="font-semibold">🚛 Operador:</span>
                  <span>${operadorNombre}</span>
                </p>
                <p class="flex items-center gap-2">
                  <span class="font-semibold">📅 Frecuencia:</span>
                  <span>${props.FRECUENCIA || 'N/A'}</span>
                </p>
                <p class="flex items-center gap-2">
                  <span class="font-semibold">⏰ Jornada:</span>
                  <span>${props.JORNADA || 'N/A'}</span>
                </p>
              </div>
            </div>
          `
          
          layer.bindPopup(popupContent, { maxWidth: 300 })
          
          // Tooltip al hover
          layer.bindTooltip(
            `<div class="text-center">
              <div class="font-bold">${props.LOCALIDAD}</div>
              <div class="text-xs">${operadorNombre}</div>
            </div>`,
            { 
              sticky: true,
              className: 'custom-tooltip'
            }
          )
          
          layer.on({
            mouseover: (e) => {
              // Función para convertir hex a rgba
              const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                return `rgba(${r}, ${g}, ${b}, ${alpha})`
              }
              
              e.target.setStyle({
                weight: 2.5, // Borde más visible al hover
                fillOpacity: 0.20, // Aumenta ligeramente pero sigue siendo transparente
                opacity: 0.9, // Borde más visible
                fillColor: hexToRgba(color, 0.20),
                color: hexToRgba(color, 0.8)
              })
              layer.openTooltip()
            },
            mouseout: (e) => {
              // Restaurar estilo original manualmente (resetStyle no funciona con preferCanvas)
              e.target.setStyle(originalStyle)
              layer.closeTooltip()
            }
          })

          const operadorKey = props.operador || 'desconocido'
          if (!operatorLayersRef.current[operadorKey]) {
            operatorLayersRef.current[operadorKey] = []
          }
          operatorLayersRef.current[operadorKey].push(layer)
          layer.featureOriginalStyle = originalStyle
          layer.isTooltipOpen = false
        }
      })
      
      layer.addTo(mapInstanceRef.current)
      layersRef.current.macrorutas = layer
      
      // Ajustar vista al contenido
      const bounds = layer.getBounds()
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
      
      // Log de distribución
      console.log('✅ Macrorutas renderizadas - Distribución:', operadorCounts)
      
      applyOperatorFilterStyles()

    } catch (error) {
      console.error('❌ Error renderizando macrorutas:', error)
    }
    
  }, [macrorutas, activeLayers.macrorutas])

  useEffect(() => {
    if (!mapInstanceRef.current || !macrorutas) return
    applyOperatorFilterStyles()
  }, [activeOperatorFilter, macrorutas])
  
  // Renderizar sitios de aprovechamiento
  useEffect(() => {
    if (!mapInstanceRef.current || !sitiosAprovechamiento) return
    
    console.log('🔄 Renderizando sitios...', sitiosAprovechamiento.features?.length)
    
    // Remover capa anterior
    if (layersRef.current.sitios) {
      mapInstanceRef.current.removeLayer(layersRef.current.sitios)
      layersRef.current.sitios = null
    }
    
    if (!activeLayers.sitios) return
    
    try {
      // Icono personalizado para sitios
      const sitioIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      
      const layer = L.geoJSON(sitiosAprovechamiento, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: sitioIcon })
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {}
          
          const materialesArray = props.materiales_array || []
          const materialesList = materialesArray.length > 0
            ? materialesArray.map(m => `<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1 mb-1">${m}</span>`).join('')
            : '<span class="text-gray-500">No especificado</span>'
          
          const popupContent = `
            <div class="p-3 min-w-[280px] max-w-[320px]">
              <h3 class="font-bold text-lg mb-2 text-green-700">${props.nombre || props.NOMBRE || 'Sin nombre'}</h3>
              <div class="space-y-2 text-sm">
                <p><strong>Dirección:</strong> ${props.direccion || 'N/A'}</p>
                <p><strong>Localidad:</strong> ${props.localidad || 'N/A'}</p>
                <p><strong>Tipo:</strong> ${props.tipo || 'N/A'}</p>
                <p><strong>Horario:</strong> ${props.horario || 'Consultar'}</p>
                ${props.telefono ? `<p><strong>Teléfono:</strong> ${props.telefono}</p>` : ''}
                <div class="mt-2">
                  <p class="font-semibold mb-1">Materiales aceptados:</p>
                  <div class="flex flex-wrap">${materialesList}</div>
                </div>
                <button 
                  onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${props.lat},${props.lng}', '_blank')"
                  class="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-medium text-sm transition-colors"
                >
                  Cómo llegar 🗺️
                </button>
              </div>
            </div>
          `
          
          layer.bindPopup(popupContent, { maxWidth: 350 })
          
          layer.on('click', () => {
            setSelectedSitio(props)
          })
        }
      })
      
      layer.addTo(mapInstanceRef.current)
      layersRef.current.sitios = layer
      console.log('✅ Sitios renderizados')
      
    } catch (error) {
      console.error('❌ Error renderizando sitios:', error)
    }
    
  }, [sitiosAprovechamiento, activeLayers.sitios, setSelectedSitio])
  
  // Marcador de usuario
  useEffect(() => {
    if (!mapInstanceRef.current) return
    
    // Remover marcador anterior
    if (layersRef.current.userMarker) {
      mapInstanceRef.current.removeLayer(layersRef.current.userMarker)
      layersRef.current.userMarker = null
    }
    
    if (!userLocation) return
    
    try {
      // Icono personalizado para usuario
      const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      
      const marker = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userIcon 
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">Tu ubicación</h3>
            <p class="text-sm">${userLocation.address || 'Ubicación actual'}</p>
          </div>
        `)
        .openPopup()
      
      layersRef.current.userMarker = marker
      
      // Centrar mapa en usuario
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, {
        animate: true
      })
      
      console.log('✅ Marcador de usuario actualizado')
      
    } catch (error) {
      console.error('❌ Error creando marcador de usuario:', error)
    }
    
  }, [userLocation])
  
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Leyenda mejorada - Colapsable y Responsive */}
      <div className={`absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-50 transition-all duration-300 ${
        isLegendOpen 
          ? 'w-[calc(100%-1rem)] sm:w-auto max-w-xs' 
          : 'w-auto'
      }`}>
        {/* Botón para abrir/cerrar leyenda */}
        {!isLegendOpen ? (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="bg-white rounded-lg shadow-xl border-2 border-gray-200 p-3 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm font-semibold text-gray-700"
            aria-label="Mostrar leyenda"
          >
            <span className="text-lg">🗺️</span>
            <span className="hidden sm:inline">Leyenda</span>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 max-w-xs animate-scale-in">
            {/* Header con botón cerrar */}
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <span>Leyenda del Mapa</span>
              </h4>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                aria-label="Cerrar leyenda"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido de la leyenda */}
            <div className="max-h-[60vh] sm:max-h-none overflow-y-auto">
              {/* Operadores */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">OPERADORES DE ASEO</p>
                <div className="space-y-2">
                  {Object.entries(OPERADOR_COLORS).map(([operador, color]) => {
                    if (operador === 'desconocido') return null
                    return (
                      <button
                        key={operador}
                        type="button"
                        onClick={() => setActiveOperatorFilter(prev => prev === operador ? null : operador)}
                        onMouseEnter={() => applyOperatorHighlight(operador)}
                        onMouseLeave={() => {
                          resetOperatorHighlight(operador)
                          applyOperatorFilterStyles()
                        }}
                        className={`group flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                          activeOperatorFilter === operador ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-100'
                        }`}
                        aria-pressed={activeOperatorFilter === operador}
                      >
                        <div 
                          className="w-4 h-3 sm:w-5 sm:h-4 rounded border-2 flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                          style={{ 
                            backgroundColor: `${color}60`,
                            borderColor: color
                          }}
                        ></div>
                        <span className="text-xs text-gray-700 font-medium truncate">
                          {OPERADORES_NOMBRES[operador]}
                        </span>
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-gray-400 group-hover:text-emerald-500">
                          {activeOperatorFilter === operador ? 'Filtrando' : 'Ver zonas'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Marcadores */}
              <div className="border-t pt-2 mb-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">MARCADORES</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-transparent border-t-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-700">Sitios de reciclaje</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-transparent border-t-red-500"></div>
                    </div>
                    <span className="text-xs text-gray-700">Tu ubicación</span>
                  </div>
                </div>
              </div>
              
              {/* Estado de capas */}
              <div className="border-t pt-2 mt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeLayers.macrorutas ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600">Zonas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeLayers.sitios ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600">Sitios</span>
                  </div>
                </div>
                {activeOperatorFilter && (
                  <button
                    type="button"
                    onClick={() => setActiveOperatorFilter(null)}
                    className="mt-3 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline"
                  >
                    Quitar filtro de operador
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Indicador de carga */}
      {(!macrorutas || !sitiosAprovechamiento) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border-2 border-blue-300 rounded-lg px-4 py-3 z-50 shadow-lg">
          <div className="flex items-center gap-3 text-sm text-blue-800">
            <div className="animate-spin w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full"></div>
            <div>
              <div className="font-bold">Cargando datos del mapa...</div>
              <div className="text-xs">
                {!macrorutas && '⏳ Macrorutas'} 
                {!macrorutas && !sitiosAprovechamiento && ' • '}
                {!sitiosAprovechamiento && '⏳ Sitios'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug panel (solo en desarrollo) */}
      {import.meta.env.DEV && macrorutas && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50 font-mono">
          <div>Features: {macrorutas.features?.length || 0}</div>
          <div>Sitios: {sitiosAprovechamiento?.features?.length || 0}</div>
        </div>
      )}
    </div>
  )
}

export default MapView
