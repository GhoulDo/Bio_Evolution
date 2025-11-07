import { useState, useMemo, useEffect } from 'react'
import useAppStore from '../store/useAppStore'
import { useZonificacion } from '../hooks/useZonificacion'
import { MATERIALES_INFO } from '../utils/constants'
import { IMPACT_INITIATIVES } from '../data/impactInitiatives'

const formatContactEntry = (key, value) => {
  if (!value) return null
  const normalizedKey = key.toLowerCase()

  if (normalizedKey === 'email') {
    return (
      <a key={key} href={`mailto:${value}`} className="text-xs sm:text-sm text-emerald-700 font-semibold underline">
        {value}
      </a>
    )
  }

  if (normalizedKey === 'telefono' || normalizedKey === 'teléfono') {
    const digits = value.replace(/[^0-9+]/g, '')
    return (
      <a key={key} href={`tel:${digits}`} className="text-xs sm:text-sm text-emerald-700 font-semibold underline">
        {value}
      </a>
    )
  }

  if (normalizedKey === 'whatsapp') {
    const digits = value.replace(/[^0-9+]/g, '')
    return (
      <a key={key} href={`https://wa.me/${digits.replace('+', '')}`} target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-emerald-700 font-semibold underline">
        WhatsApp
      </a>
    )
  }

  return (
    <a key={key} href={value} target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-emerald-700 font-semibold underline capitalize">
      {key}
    </a>
  )
}

const ReciclaConCausaSection = ({
  iniciativasTags,
  selectedCauseTag,
  setSelectedCauseTag,
  iniciativasFiltradas,
  highlightedInitiative,
  setHighlightedInitiative,
  formatContactEntry
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-large p-6 card-hover border-2 border-rose-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/10 rounded-full blur-2xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">❤️</span>
            <span>Recicla con Causa</span>
          </h3>
          <div className="px-3 py-1 bg-rose-100 rounded-full border border-rose-200">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
              Impacto social
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Conecta tus hábitos de reciclaje con organizaciones bogotanas que transforman materiales en vida digna, salud y oportunidades.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {iniciativasTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedCauseTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedCauseTag === tag
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
                  : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              {tag === 'todos' ? 'Todas las causas' : `#${tag}`}
            </button>
          ))}
        </div>

        {highlightedInitiative ? (
          <div className="relative bg-gradient-to-br from-emerald-50 via-white to-rose-50 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-md mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-4 w-20 h-20 bg-emerald-300/10 rounded-full blur-2xl"></div>
            <div className="relative flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold mb-1">
                    {highlightedInitiative.causa}
                  </p>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    {highlightedInitiative.nombre}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {highlightedInitiative.tags?.map((tag) => (
                    <span
                      key={`${highlightedInitiative.id}-${tag}`}
                      className="px-3 py-1 rounded-full bg-white text-emerald-600 border border-emerald-200 text-xs font-bold shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">
                {highlightedInitiative.enfoqueSocial}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    Materiales que puedes aportar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {highlightedInitiative.materialesAceptados?.map((material) => (
                      <span
                        key={`${highlightedInitiative.id}-${material}`}
                        className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 shadow-sm"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    ¿Por qué esta causa importa?
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {highlightedInitiative.valoresClave?.map((valor) => (
                      <li key={`${highlightedInitiative.id}-${valor}`} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{valor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-emerald-100 pt-4">
                <div className="flex gap-2 flex-wrap">
                  {highlightedInitiative.comoDonarUrl && (
                    <a
                      href={highlightedInitiative.comoDonarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      💚 Quiero apoyar
                    </a>
                  )}
                  {highlightedInitiative.mapaAcopioUrl && (
                    <a
                      href={highlightedInitiative.mapaAcopioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-emerald-50"
                    >
                      📍 Ver puntos de entrega
                    </a>
                  )}
                  {highlightedInitiative.infoUrl && (
                    <a
                      href={highlightedInitiative.infoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-emerald-50"
                    >
                      ℹ️ Más información
                    </a>
                  )}
                </div>
                {highlightedInitiative.contacto && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                      Contacto directo:
                    </span>
                    {Object.entries(highlightedInitiative.contacto).map(([key, value]) =>
                      formatContactEntry(key, value)
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-600">
            No encontramos iniciativas para este filtro.
          </div>
        )}

        {highlightedInitiative && (
          <div>
            <h4 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3">
              Otras iniciativas que puedes apoyar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {iniciativasFiltradas
                .filter((initiative) => initiative.id !== highlightedInitiative.id)
                .slice(0, 4)
                .map((initiative) => (
                  <button
                    key={initiative.id}
                    onClick={() => setHighlightedInitiative(initiative)}
                    className="text-left bg-white border-2 border-gray-200 hover:border-emerald-300 rounded-xl p-4 transition-all shadow-sm hover:shadow-lg group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h5 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                        {initiative.nombre}
                      </h5>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 border border-rose-200 font-semibold">
                        {initiative.causa}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {initiative.enfoqueSocial}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {initiative.materialesAceptados?.slice(0, 2).map((material) => (
                        <span
                          key={`${initiative.id}-material-${material}`}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-semibold rounded-full border border-emerald-100"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const InfoPanel = () => {
  const { userLocation, userZona, selectedSitio } = useAppStore()
  const { generarHorariosEstimados, parseFrecuencia } = useZonificacion()
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [selectedCauseTag, setSelectedCauseTag] = useState('todos')
  const [highlightedInitiative, setHighlightedInitiative] = useState(
    IMPACT_INITIATIVES[0] || null
  )
  
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

  const iniciativasTags = useMemo(() => {
    const base = new Set()
    IMPACT_INITIATIVES.forEach((initiative) => {
      initiative.tags?.forEach(tag => base.add(tag))
    })
    return ['todos', ...Array.from(base)]
  }, [])

  const iniciativasFiltradas = useMemo(() => {
    if (selectedCauseTag === 'todos') return IMPACT_INITIATIVES
    return IMPACT_INITIATIVES.filter(initiative => initiative.tags?.includes(selectedCauseTag))
  }, [selectedCauseTag])

  useEffect(() => {
    if (!iniciativasFiltradas.length) {
      setHighlightedInitiative(null)
      return
    }
    const existsInSelection = highlightedInitiative && iniciativasFiltradas.some(
      initiative => initiative.id === highlightedInitiative.id
    )
    if (!existsInSelection) {
      setHighlightedInitiative(iniciativasFiltradas[0])
    }
  }, [iniciativasFiltradas, highlightedInitiative])
  
  // Estado inicial: sin ubicación
  if (!userLocation) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-large p-8 card-hover">
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
        <ReciclaConCausaSection
          iniciativasTags={iniciativasTags}
          selectedCauseTag={selectedCauseTag}
          setSelectedCauseTag={setSelectedCauseTag}
          iniciativasFiltradas={iniciativasFiltradas}
          highlightedInitiative={highlightedInitiative}
          setHighlightedInitiative={setHighlightedInitiative}
          formatContactEntry={formatContactEntry}
        />
      </div>
    )
  }
  
  // Usuario ubicado pero sin zona
  if (userLocation && !userZona) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-large p-8">
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
        <ReciclaConCausaSection
          iniciativasTags={iniciativasTags}
          selectedCauseTag={selectedCauseTag}
          setSelectedCauseTag={setSelectedCauseTag}
          iniciativasFiltradas={iniciativasFiltradas}
          highlightedInitiative={highlightedInitiative}
          setHighlightedInitiative={setHighlightedInitiative}
          formatContactEntry={formatContactEntry}
        />
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
      
      <ReciclaConCausaSection
        iniciativasTags={iniciativasTags}
        selectedCauseTag={selectedCauseTag}
        setSelectedCauseTag={setSelectedCauseTag}
        iniciativasFiltradas={iniciativasFiltradas}
        highlightedInitiative={highlightedInitiative}
        setHighlightedInitiative={setHighlightedInitiative}
        formatContactEntry={formatContactEntry}
      />
      
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
