import { useState, useRef, useEffect } from 'react'
import { OPERADORES_NOMBRES } from '../utils/constants'

// Información detallada de operadores basada en los mapas analizados
const OPERADORES_INFO = [
  {
    id: 'Area_Limpia',
    nombre: 'Área Limpia',
    logo: 'Area_Limpia.png',
    mapa: 'Area_Limpia.png',
    localidades: [
      { nombre: 'CHAPINERO', frecuencias: ['Mar - Jue - Sab (Día)', 'Lun - Mie - Vie (Noche)', 'Mar - Jue - Sab (Noche)', 'Lun - Mie - Vie (Día)'] },
      { nombre: 'SANTA FE', frecuencias: ['Mar - Jue - Sab (Día)', 'Lun - Mie - Vie (Día)', 'Lun a Dom (Día - Noche)'] },
      { nombre: 'SAN CRISTÓBAL', frecuencias: ['Lun - Mie - Vie (Día)', 'Mar - Jue - Sab (Día)'] },
      { nombre: 'LA CANDELARIA', frecuencias: ['Lun a Dom (Día - Noche)', 'Mar - Jue - Sab (Día)'] },
      { nombre: 'SUMAPAZ', frecuencias: ['1 VEZ CADA 15 (Día)'] },
      { nombre: 'USAQUÉN', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] }
    ],
    color: '#3B82F6',
    descripcion: 'Operador responsable de las localidades del centro y norte de Bogotá'
  },
  {
    id: 'ciudad_limpia',
    nombre: 'Ciudad Limpia',
    logo: 'ciudad_limpia.png',
    mapa: 'ciudad_limpia.png',
    localidades: [
      { nombre: 'CIUDAD BOLÍVAR', frecuencias: ['Jue - Sab (Día)', 'Lun - Mie - Vie (Día)', 'Lun - Mie - Vie (Noche)', 'Lun a Dom (Noche)', 'Mar - Jue - Sab (Mañana)'] },
      { nombre: 'BOSA', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab', 'Lun a Dom'] },
      { nombre: 'TUNJUELITO', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] },
      { nombre: 'ANTONIO NARIÑO', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] },
      { nombre: 'PUENTE ARANDA', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] },
      { nombre: 'LOS MÁRTIRES', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] },
      { nombre: 'TEUSAQUILLO', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] },
      { nombre: 'RAFAEL URIBE URIBE', frecuencias: ['Lun - Mie - Vie', 'Mar - Jue - Sab'] }
    ],
    color: '#10B981',
    descripcion: 'Operador responsable de las localidades del sur y centro de Bogotá'
  },
  {
    id: 'Lime',
    nombre: 'LIME',
    logo: 'Lime.png',
    mapa: 'Lime.png',
    localidades: [
      { 
        nombre: 'KENNEDY', 
        frecuencias: [
          'Lun - Mie - Vie (Día)',
          'Mar - Jue - Sab (Día)',
          'Mar - Jue - Sab (Noche)',
          'Lun - Mie - Vie (Tarde)',
          'Mar - Jue - Sab (Tarde)',
          'Lun a Sab (Día)',
          'Lun - Mie - Vie (Noche)'
        ] 
      },
      { 
        nombre: 'FONTIBÓN', 
        frecuencias: [
          'Lun - Mie - Vie (Noche)',
          'Lun a Sab (Día)'
        ] 
      }
    ],
    color: '#F59E0B',
    descripcion: 'Operador responsable de las localidades del occidente de Bogotá'
  },
  {
    id: 'bogota_limpia',
    nombre: 'Bogotá Limpia',
    logo: 'bogota_limpia.png',
    mapa: 'bogota_limpia.png',
    localidades: [
      { 
        nombre: 'ENGATIVÁ', 
        frecuencias: [
          'Lun a Sab (Noche)',
          'Mar - Jue - Sab (Noche)'
        ] 
      },
      { 
        nombre: 'BARRIOS UNIDOS', 
        frecuencias: [
          'Mar - Jue - Sab (Noche)',
          'Mar - Jue - Sab (Día)',
          'Lun a Sab (Noche)'
        ] 
      }
    ],
    color: '#8B5CF6',
    descripcion: 'Operador responsable de las localidades del noroccidente de Bogotá'
  },
  {
    id: 'pro_ambiental',
    nombre: 'Promoambiental',
    logo: 'pro_ambiental.png',
    mapa: 'pro_ambiental.png',
    localidades: [
      { 
        nombre: 'SUBA', 
        frecuencias: [
          'Lun - Mie - Vie (Día)',
          'Mar - Jue - Sab (Día)',
          'Lun - Mie - Vie (Noche)',
          'Mar - Jue - Sab (Noche)'
        ] 
      }
    ],
    color: '#EF4444',
    descripcion: 'Operador responsable de la localidad de Suba en el nororiente de Bogotá'
  }
]

const OperatorGallery = () => {
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Referencias para el panel arrastrable
  const panelRef = useRef(null)
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
  const [isPanelDragging, setIsPanelDragging] = useState(false)
  const [panelDragStart, setPanelDragStart] = useState({ x: 0, y: 0 })
  
  // Reset zoom cuando se cierra el modal
  useEffect(() => {
    if (!showImageModal) {
      setImageZoom(1)
      setImagePosition({ x: 0, y: 0 })
    }
  }, [showImageModal])
  
  // Manejar arrastre del panel
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPanelDragging && panelRef.current) {
        const newX = e.clientX - panelDragStart.x
        const newY = e.clientY - panelDragStart.y
        
        // Limitar el movimiento dentro de los límites de la ventana
        const maxX = window.innerWidth - (panelRef.current.offsetWidth || 400)
        const maxY = window.innerHeight - 100
        
        setPanelPosition({ 
          x: Math.max(0, Math.min(newX, maxX)), 
          y: Math.max(0, Math.min(newY, maxY)) 
        })
      }
    }
    
    const handleMouseUp = () => {
      setIsPanelDragging(false)
    }
    
    if (isPanelDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none' // Prevenir selección de texto mientras se arrastra
    } else {
      document.body.style.userSelect = ''
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isPanelDragging, panelDragStart])
  
  // Manejar arrastre de imagen en el modal
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        setImagePosition({ x: deltaX, y: deltaY })
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Operadores de Aseo en Bogotá
        </h2>
        <p className="text-gray-600">
          Conoce las empresas responsables de la recolección de residuos en cada zona de la ciudad
        </p>
      </div>
      
      {/* Grid de operadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {OPERADORES_INFO.map((operador) => (
          <div 
            key={operador.id}
            className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
            style={{ 
              borderTopColor: operador.color, 
              borderTopWidth: '4px',
              backgroundColor: selectedOperator?.id === operador.id ? `${operador.color}05` : 'white'
            }}
            onClick={() => {
              setSelectedOperator(operador)
              setShowMap(true)
            }}
          >
            {/* Logo pequeño */}
            <div className="flex items-center justify-center h-20 mb-4 bg-gray-50 rounded-lg p-3">
              <img 
                src={`/maps/${operador.logo}`}
                alt={operador.nombre}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            
            {/* Nombre */}
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              {operador.nombre}
            </h3>
            
            {/* Descripción */}
            <p className="text-xs text-gray-500 mb-3 text-center">
              {operador.descripcion}
            </p>
            
            {/* Zonas - Vista previa */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Localidades ({operador.localidades.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {operador.localidades.slice(0, 3).map((loc, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs rounded"
                    style={{ 
                      backgroundColor: `${operador.color}20`,
                      color: operador.color
                    }}
                  >
                    {loc.nombre}
                  </span>
                ))}
                {operador.localidades.length > 3 && (
                  <span 
                    className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600"
                  >
                    +{operador.localidades.length - 3} más
                  </span>
                )}
              </div>
            </div>
            
            {/* Botón ver detalles */}
            <button
              className="w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              style={{
                backgroundColor: `${operador.color}20`,
                color: operador.color
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOperator(operador)
                setShowMap(true)
              }}
            >
              Ver Mapa y Detalles →
            </button>
          </div>
        ))}
      </div>
      
      {/* Panel de detalles del operador seleccionado - ARRASTRABLE */}
      {selectedOperator && (
        <div 
          ref={panelRef}
          className={`${panelPosition.x || panelPosition.y ? 'fixed' : 'relative'} z-40 mt-8 border-2 rounded-2xl p-6 bg-white shadow-2xl`}
          style={{ 
            borderColor: selectedOperator.color,
            ...(panelPosition.x || panelPosition.y ? {
              left: `${panelPosition.x}px`,
              top: `${panelPosition.y}px`,
              right: 'auto',
              bottom: 'auto'
            } : {}),
            maxWidth: '90vw',
            maxHeight: '85vh',
            overflow: 'auto'
          }}
        >
          {/* Barra de arrastre */}
          <div 
            className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200 cursor-move"
            style={{ borderColor: `${selectedOperator.color}30` }}
            onMouseDown={(e) => {
              e.preventDefault()
              setIsPanelDragging(true)
              const rect = panelRef.current?.getBoundingClientRect()
              if (rect) {
                setPanelDragStart({ 
                  x: e.clientX - (panelPosition.x || rect.left), 
                  y: e.clientY - (panelPosition.y || rect.top) 
                })
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: selectedOperator.color }}>
                  {selectedOperator.nombre}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{selectedOperator.descripcion}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedOperator(null)
                setShowMap(false)
                setPanelPosition({ x: 0, y: 0 })
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Tabs: Mapa / Frecuencias */}
          <div className="mb-4 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setShowMap(true)}
                className={`px-4 py-2 font-medium transition-colors ${
                  showMap 
                    ? 'border-b-2 text-gray-800' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={showMap ? { borderBottomColor: selectedOperator.color } : {}}
              >
                🗺️ Mapa de Cobertura
              </button>
              <button
                onClick={() => setShowMap(false)}
                className={`px-4 py-2 font-medium transition-colors ${
                  !showMap 
                    ? 'border-b-2 text-gray-800' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={!showMap ? { borderBottomColor: selectedOperator.color } : {}}
              >
                📋 Frecuencias y Jornadas
              </button>
            </div>
          </div>
          
          {/* Contenido del tab */}
          {showMap ? (
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">Mapa de Zonas de Recolección</h4>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>🔍</span>
                    <span>Ver en Pantalla Completa</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  El mapa muestra las diferentes zonas de recolección con sus frecuencias. 
                  Los colores representan diferentes días de servicio. Haz clic en "Ver en Pantalla Completa" para ampliar.
                </p>
                <div className="bg-white rounded-lg overflow-hidden shadow-inner cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => setShowImageModal(true)}
                >
                  <img 
                    src={`/maps/${selectedOperator.mapa}`}
                    alt={`Mapa de ${selectedOperator.nombre}`}
                    className="w-full h-auto object-contain transition-transform hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div style={{ display: 'none' }} className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p>Mapa no disponible</p>
                  </div>
                </div>
              </div>
              
              {/* Leyenda del mapa */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Convenciones del Mapa</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                    <span className="text-xs text-gray-700">Lun - Mie - Vie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10B981' }}></div>
                    <span className="text-xs text-gray-700">Mar - Jue - Sab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                    <span className="text-xs text-gray-700">Lun a Sab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
                    <span className="text-xs text-gray-700">Lun a Dom</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                      Localidad
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                      Frecuencias y Jornadas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOperator.localidades.map((localidad, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800">
                        {localidad.nombre}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {localidad.frecuencias.map((frec, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${selectedOperator.color}20`,
                                color: selectedOperator.color,
                                border: `1px solid ${selectedOperator.color}40`
                              }}
                            >
                              {frec}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cada operador es responsable de las localidades asignadas según el mapa</li>
          <li>• Las frecuencias y jornadas pueden variar según necesidades operativas</li>
          <li>• Los mapas muestran las zonas de recolección con diferentes frecuencias</li>
          <li>• Para quejas o reclamos, contacta directamente a tu operador</li>
          <li>• Los horarios exactos pueden consultarse en el mapa principal de la aplicación</li>
        </ul>
      </div>
      
      {/* Modal de imagen en pantalla completa */}
      {showImageModal && selectedOperator && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-[95vw] max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{selectedOperator.nombre} - Mapa de Cobertura</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Controles de zoom */}
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageZoom(Math.max(0.5, imageZoom - 0.25))
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded font-bold text-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold min-w-[60px] text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageZoom(Math.min(3, imageZoom + 0.25))
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded font-bold text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false)
                    setImageZoom(1)
                    setImagePosition({ x: 0, y: 0 })
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition-colors"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
            
            {/* Contenedor de imagen con zoom y arrastre */}
            <div 
              className="relative overflow-auto bg-gray-900"
              style={{ 
                width: '95vw', 
                height: 'calc(95vh - 80px)',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              <div
                className="flex items-center justify-center min-h-full p-4"
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageZoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
                onMouseDown={(e) => {
                  if (e.button === 0) { // Solo botón izquierdo
                    setIsDragging(true)
                    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
                  }
                }}
              >
                <img 
                  src={`/maps/${selectedOperator.mapa}`}
                  alt={`Mapa de ${selectedOperator.nombre}`}
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            </div>
            
            {/* Instrucciones */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              <span>🖱️ Arrastra para mover • 🔍 Usa + / - para zoom • 🖱️ Click fuera para cerrar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperatorGallery
