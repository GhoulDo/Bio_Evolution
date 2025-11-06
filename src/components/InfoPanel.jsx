import { useState, useMemo } from 'react'
import useAppStore from '../store/useAppStore'
import { useZonificacion } from '../hooks/useZonificacion'
import { MATERIALES_INFO } from '../utils/constants'

const InfoPanel = () => {
  const { userLocation, userZona, selectedSitio } = useAppStore()
  const { generarHorariosEstimados, parseFrecuencia } = useZonificacion()
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  
  // Generar horarios estimados
  const horarios = useMemo(() => {
    if (!userZona) return []
    return generarHorariosEstimados(userZona.frecuencia, userZona.jornada)
  }, [userZona, generarHorariosEstimados])
  
  // Días de recolección parseados
  const diasRecoleccion = useMemo(() => {
    if (!userZona) return []
    return parseFrecuencia(userZona.frecuencia)
  }, [userZona, parseFrecuencia])
  
  // Estado inicial: sin ubicación
  if (!userLocation) {
    return (
      <div className="bg-white rounded-2xl shadow-large p-8 card-hover animate-fade-in">
        <div className="text-center py-8">
          <div className="text-7xl mb-6 animate-bounce-subtle">🗺️</div>
          <h3 className="text-2xl font-bold gradient-text mb-3">
            Bienvenido a Bio Evolution
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Usa el buscador o tu ubicación GPS para conocer cuándo pasa el camión de recolección en tu zona
          </p>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-left shadow-soft">
            <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
              <span>✨</span>
              <span>¿Qué puedes hacer?</span>
            </h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Ver cuándo pasa la recolección en tu cuadra</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Encontrar sitios de reciclaje cercanos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Aprender a separar correctamente</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Conocer tu operador de aseo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
  
  // Usuario ubicado pero sin zona
  if (userLocation && !userZona) {
    return (
      <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-7xl mb-6">⚠️</div>
          <h3 className="text-2xl font-bold text-yellow-700 mb-3">
            Ubicación fuera de cobertura
          </h3>
          <p className="text-gray-600 text-lg">
            No pudimos encontrar información de recolección para esta ubicación. 
            Verifica que estés en Bogotá.
          </p>
        </div>
      </div>
    )
  }
  
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!userZona) return null
    const diasCount = diasRecoleccion.length
    const horariosCount = horarios.length
    return { diasCount, horariosCount }
  }, [diasRecoleccion, horarios, userZona])

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Dashboard Header - Estilo profesional */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 drop-shadow-lg">
                Dashboard de Recolección
              </h2>
              <p className="text-emerald-50 text-sm font-medium">
                Información de tu zona
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border-2 border-white/30">
              <span className="text-3xl">📊</span>
            </div>
          </div>
          
          {/* Stats rápidas */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xs text-emerald-100 mb-1">Días de servicio</p>
                <p className="text-2xl font-bold">{stats.diasCount}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xs text-emerald-100 mb-1">Horarios</p>
                <p className="text-2xl font-bold">{stats.horariosCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información del Operador - Estilo Dashboard */}
      <div className="bg-white rounded-2xl shadow-large p-6 card-hover border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">🚛</span>
            <span>Operador de Aseo</span>
          </h2>
          <div className="px-3 py-1 bg-green-100 rounded-full">
            <span className="text-xs font-bold text-green-700 uppercase">Activo</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Card del operador - Estilo premium */}
          <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl p-5 border-2 border-gray-200 shadow-md overflow-hidden">
            {/* Patrón de fondo sutil */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Operador Asignado</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{userZona.operador_nombre}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-600 font-medium">Servicio activo</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-gray-200">
                <img 
                  src={`/maps/${userZona.operador_id}.png`}
                  alt={userZona.operador_nombre}
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Localidad - Card mejorada */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-semibold">📍 Localidad</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{userZona.localidad}</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <span className="text-2xl">🏙️</span>
              </div>
            </div>
          </div>
          
          {/* Frecuencia - Mejorada */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">📅 Días de Recolección</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                {diasRecoleccion.length} días
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {diasRecoleccion.map((dia, index) => (
                <span 
                  key={index}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-emerald-400/50"
                >
                  {dia}
                </span>
              ))}
            </div>
          </div>
          
          {/* Jornada - Card mejorada */}
          <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-semibold">⏰ Jornada de Servicio</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-800">{userZona.jornada}</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <span className="text-2xl">🕐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Horarios de Recolección - Dashboard Style */}
      <div className="bg-white rounded-2xl shadow-large p-6 card-hover border-2 border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">🕐</span>
            <span>Horarios Estimados</span>
          </h3>
          <div className="px-3 py-1 bg-blue-100 rounded-full">
            <span className="text-xs font-bold text-blue-700">{horarios.length} ventanas</span>
          </div>
        </div>
        
        {/* Alerta informativa mejorada */}
        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-5 shadow-md">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-400 rounded-full p-2">
              <span className="text-lg">ℹ️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">Información Importante</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
                Horarios estimados basados en la frecuencia oficial. Los horarios pueden variar según las necesidades operativas.
              </p>
            </div>
          </div>
        </div>
        
        {/* Lista de horarios - Estilo mejorado */}
        <div className="space-y-2.5">
          {horarios.map((ventana, index) => (
            <div 
              key={index}
              className="relative flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl hover:from-green-50 hover:via-emerald-50 hover:to-green-50 transition-all duration-300 border-2 border-gray-200 hover:border-green-400 hover:shadow-lg group overflow-hidden"
            >
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative flex items-center gap-4 flex-1">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-500 rounded-full group-hover:bg-green-600 shadow-md group-hover:shadow-lg transition-all"></div>
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-0 group-hover:opacity-30"></div>
                </div>
                <div>
                  <span className="font-bold text-gray-800 group-hover:text-green-700 transition-colors text-base">{ventana.dia}</span>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{ventana.tipo}</p>
                </div>
              </div>
              <div className="relative text-right bg-white/80 rounded-lg px-4 py-2 border border-gray-200 group-hover:border-green-300 group-hover:bg-green-50 transition-all">
                <p className="text-base font-extrabold text-gray-700 group-hover:text-green-700 transition-colors">
                  {ventana.hora_ini} - {ventana.hora_fin}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer con fecha */}
        <div className="mt-5 pt-4 border-t-2 border-gray-200 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 flex items-center gap-2 font-medium">
            <span className="text-base">📅</span>
            <span>Última actualización: <span className="font-bold">{userZona.fecha_dato}</span></span>
          </p>
        </div>
      </div>
      
      {/* Tips de Separación - Dashboard Style */}
      <div className="bg-white rounded-2xl shadow-large p-6 card-hover border-2 border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">♻️</span>
            <span>Guía de Separación</span>
          </h3>
          <div className="px-3 py-1 bg-purple-100 rounded-full">
            <span className="text-xs font-bold text-purple-700">Educativo</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-5 font-semibold">
          Selecciona un material para ver cómo separarlo correctamente:
        </p>
        
        {/* Grid de materiales mejorado */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {Object.entries(MATERIALES_INFO).filter(([key]) => {
            // Filtrar duplicados
            return !key.includes('ó') && !key.includes('á') && !key.includes('é') && !key.includes('í') && !key.includes('ú')
          }).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedMaterial(selectedMaterial === key ? null : key)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                selectedMaterial === key
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-105 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-green-300 bg-white hover:shadow-md'
              }`}
            >
              {selectedMaterial === key && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10"></div>
              )}
              <div className="relative text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                {info.icono}
              </div>
              <div className="relative text-xs font-bold text-gray-700 group-hover:text-green-700 transition-colors">
                {info.nombre}
              </div>
            </button>
          ))}
        </div>
        
        {/* Panel de información del material seleccionado */}
        {selectedMaterial && (
          <div 
            className="relative p-5 rounded-xl border-2 animate-scale-in shadow-lg overflow-hidden"
            style={{ 
              borderColor: MATERIALES_INFO[selectedMaterial].color,
              backgroundColor: `${MATERIALES_INFO[selectedMaterial].color}10`
            }}
          >
            {/* Efecto de brillo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex items-start gap-4">
              <div className="bg-white rounded-xl p-3 shadow-md border-2" style={{ borderColor: MATERIALES_INFO[selectedMaterial].color }}>
                <span className="text-4xl">{MATERIALES_INFO[selectedMaterial].icono}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-gray-800 mb-2 text-lg">
                  {MATERIALES_INFO[selectedMaterial].nombre}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {MATERIALES_INFO[selectedMaterial].tips}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sitio Seleccionado - Dashboard Style */}
      {selectedSitio && (
        <div className="bg-white rounded-2xl shadow-large p-6 card-hover border-2 border-gray-100 animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">📍</span>
              <span>Sitio de Reciclaje</span>
            </h3>
            <div className="px-3 py-1 bg-green-100 rounded-full">
              <span className="text-xs font-bold text-green-700 uppercase">Seleccionado</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Nombre y dirección - Card destacada */}
            <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-green-300 shadow-md overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <p className="text-xl sm:text-2xl font-extrabold text-green-700 mb-2">{selectedSitio.nombre}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📍</span>
                  <span className="font-medium">{selectedSitio.direccion}</span>
                </div>
              </div>
            </div>
            
            {/* Grid de información */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-semibold">🏙️ Localidad</p>
                <p className="font-bold text-gray-800 text-lg">{selectedSitio.localidad}</p>
              </div>
              
              {selectedSitio.horario && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-semibold">🕐 Horario</p>
                  <p className="font-bold text-blue-800 text-lg">{selectedSitio.horario}</p>
                </div>
              )}
            </div>
            
            {/* Materiales aceptados - Mejorado */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">♻️ Materiales Aceptados</p>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                  {selectedSitio.materiales_array?.length || 0} tipos
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSitio.materiales_array?.map((material, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all border-2 border-emerald-400/50"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Botón de acción - Mejorado */}
            <button
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${selectedSitio.lat},${selectedSitio.lng}`,
                  '_blank'
                )
              }}
              className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-4 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 text-base"
            >
              <span className="text-2xl">🗺️</span>
              <span>Abrir en Google Maps</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoPanel
