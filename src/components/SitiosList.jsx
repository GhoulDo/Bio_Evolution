import { useState } from 'react'
import { useSitiosCercanos } from '../hooks/useSitiosCercanos'
import { MATERIALES_INFO } from '../utils/constants'
import useAppStore from '../store/useAppStore'

const SitiosList = () => {
  const { sitiosCercanos, filtrarPorMaterial, total } = useSitiosCercanos()
  const { userLocation, setSelectedSitio } = useAppStore()
  const [filtroMaterial, setFiltroMaterial] = useState('')
  
  if (!userLocation) {
    return (
      <div className="bg-white rounded-2xl shadow-large p-8 text-center card-hover border border-gray-100">
        <div className="text-6xl mb-4 animate-bounce-subtle">📍</div>
        <p className="text-gray-600 text-lg font-medium">
          Primero ubícate en el mapa para ver sitios cercanos
        </p>
      </div>
    )
  }
  
  const sitiosFiltrados = filtroMaterial 
    ? filtrarPorMaterial(filtroMaterial) 
    : sitiosCercanos
  
  return (
    <div className="bg-white rounded-2xl shadow-large p-4 sm:p-6 card-hover border border-gray-100">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
        <span className="text-2xl">♻️</span>
        <span>Sitios de Reciclaje Cercanos</span>
        <span className="ml-auto px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-md">
          {sitiosFiltrados.length}
        </span>
      </h3>
      
      {/* Filtro por material mejorado */}
      <div className="mb-5">
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
          Filtrar por material:
        </label>
        <select
          value={filtroMaterial}
          onChange={(e) => setFiltroMaterial(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm hover:shadow-md"
        >
          <option value="">Todos los materiales</option>
          {Object.entries(MATERIALES_INFO).map(([key, info]) => (
            <option key={key} value={key}>
              {info.icono} {info.nombre}
            </option>
          ))}
        </select>
      </div>
      
      {/* Lista de sitios mejorada */}
      {sitiosFiltrados.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">No hay sitios cercanos en un radio de 2 km</p>
          {filtroMaterial && (
            <p className="text-sm mt-2">para el material seleccionado</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sitiosFiltrados.map((sitio, index) => (
            <div
              key={sitio.id || index}
              className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 group"
              onClick={() => setSelectedSitio(sitio)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1 group-hover:text-green-700 transition-colors">
                    {sitio.nombre}
                  </h4>
                  <p className="text-sm text-gray-600">{sitio.direccion}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                    {sitio.dist_km} km
                  </p>
                  <p className="text-xs text-gray-500">{sitio.localidad}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-sm">
                  {sitio.tipo}
                </span>
                {sitio.horario && (
                  <span className="text-xs text-gray-600 font-medium">
                    🕐 {sitio.horario}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sitio.materiales_array?.slice(0, 4).map((material, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-sm"
                  >
                    {material}
                  </span>
                ))}
                {sitio.materiales_array?.length > 4 && (
                  <span className="text-xs px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full font-semibold">
                    +{sitio.materiales_array.length - 4}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SitiosList
