import { useState, useRef, useEffect } from 'react'
import { useGeocoding } from '../hooks/useGeocoding'
import { useZonificacion } from '../hooks/useZonificacion'
import useAppStore from '../store/useAppStore'

const SearchBar = ({ onLocationSelected }) => {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const searchRef = useRef(null)
  
  const { results, isLoading, error, search, clearResults } = useGeocoding()
  const { setUserLocationAndZona } = useZonificacion()
  const { setUserLocation } = useAppStore()
  
  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 3) {
        search(query)
        setShowResults(true)
      } else {
        clearResults()
        setShowResults(false)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [query, search, clearResults])
  
  /**
   * Maneja la selección de un resultado de búsqueda
   */
  const handleSelectResult = (result) => {
    const location = {
      lat: result.lat,
      lng: result.lng,
      address: result.display_name
    }
    
    setUserLocation(location)
    setUserLocationAndZona(result.lat, result.lng)
    
    setQuery(result.address.road || result.display_name)
    setShowResults(false)
    
    if (onLocationSelected) {
      onLocationSelected(location)
    }
  }
  
  /**
   * Obtiene la ubicación actual del usuario vía GPS
   */
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }
    
    setIsGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        // Verificar que estamos en Bogotá
        if (lat < 4.4 || lat > 4.9 || lng < -74.3 || lng > -73.8) {
          alert('Parece que estás fuera de Bogotá. Esta aplicación solo funciona en la ciudad.')
          setIsGettingLocation(false)
          return
        }
        
        const location = {
          lat,
          lng,
          address: 'Tu ubicación actual'
        }
        
        setUserLocation(location)
        const zona = setUserLocationAndZona(lat, lng)
        
        if (zona) {
          setQuery('Mi ubicación')
        } else {
          setQuery('Ubicación fuera de zona de cobertura')
        }
        
        setIsGettingLocation(false)
        
        if (onLocationSelected) {
          onLocationSelected(location)
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        
        let mensaje = 'No se pudo obtener tu ubicación. '
        if (error.code === 1) {
          mensaje += 'Debes permitir el acceso a tu ubicación.'
        } else if (error.code === 2) {
          mensaje += 'Ubicación no disponible.'
        } else {
          mensaje += 'Tiempo de espera agotado.'
        }
        
        alert(mensaje)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }
  
  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto animate-fade-in">
      {/* Barra de búsqueda mejorada - Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 glass rounded-xl shadow-large p-2 sm:p-3 border border-white/50">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca tu dirección (ej: Calle 26 con Carrera 7)"
            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={isLoading || isGettingLocation}
          />
          
          {/* Spinner de carga */}
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-[3px] border-green-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Botón limpiar */}
          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery('')
                clearResults()
                setShowResults(false)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Botón GPS mejorado - Responsive */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-sm sm:text-base"
          title="Usar mi ubicación"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin h-5 w-5 border-[3px] border-white border-t-transparent rounded-full"></div>
              <span className="hidden sm:inline">Ubicando...</span>
            </>
          ) : (
            <>
              <span className="text-xl">📍</span>
              <span className="hidden sm:inline">Mi ubicación</span>
            </>
          )}
        </button>
      </div>
      
      {/* Resultados de búsqueda mejorados */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-3 bg-white rounded-xl shadow-large max-h-80 overflow-y-auto border border-gray-200 animate-slide-up">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full px-5 py-4 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl group"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <span className="text-green-600 text-lg">📍</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {result.address.road || result.address.neighbourhood || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {result.display_name}
                  </p>
                </div>
                <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Sin resultados mejorado */}
      {showResults && query.length >= 3 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-3 glass rounded-xl shadow-large p-6 text-center animate-slide-up border border-gray-200">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600 font-medium">No se encontraron direcciones</p>
          <p className="text-sm text-gray-500 mt-1">Intenta ser más específico con tu búsqueda</p>
        </div>
      )}
      
      {/* Error mejorado */}
      {error && (
        <div className="absolute z-50 w-full mt-3 bg-red-50 border-2 border-red-200 rounded-xl shadow-large p-4 text-sm text-red-700 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
