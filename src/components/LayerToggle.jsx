import useAppStore from '../store/useAppStore'

const LayerToggle = () => {
  const { activeLayers, toggleLayer } = useAppStore()
  
  return (
    <div className="bg-white rounded-2xl shadow-large p-6 card-hover border border-gray-100">
      <h3 className="font-bold text-xl mb-5 flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <span>Capas del Mapa</span>
      </h3>
      
      <div className="space-y-3">
        <label className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl transition-all duration-300 border-2 ${
          activeLayers.macrorutas
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md'
            : 'bg-gray-50 border-gray-200 hover:border-green-200 hover:bg-green-50'
        }`}>
          <input
            type="checkbox"
            checked={activeLayers.macrorutas}
            onChange={() => toggleLayer('macrorutas')}
            className="w-6 h-6 text-green-600 rounded focus:ring-green-500 focus:ring-2 cursor-pointer accent-green-600"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-base">Zonas de recolección</p>
            <p className="text-xs text-gray-500 mt-0.5">Polígonos de operadores</p>
          </div>
          <span className="text-3xl">{activeLayers.macrorutas ? '✅' : '🚛'}</span>
        </label>
        
        <label className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl transition-all duration-300 border-2 ${
          activeLayers.sitios
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md'
            : 'bg-gray-50 border-gray-200 hover:border-green-200 hover:bg-green-50'
        }`}>
          <input
            type="checkbox"
            checked={activeLayers.sitios}
            onChange={() => toggleLayer('sitios')}
            className="w-6 h-6 text-green-600 rounded focus:ring-green-500 focus:ring-2 cursor-pointer accent-green-600"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-base">Sitios de aprovechamiento</p>
            <p className="text-xs text-gray-500 mt-0.5">Puntos de reciclaje</p>
          </div>
          <span className="text-3xl">{activeLayers.sitios ? '✅' : '♻️'}</span>
        </label>
      </div>
      
      <div className="mt-5 pt-4 border-t-2 border-gray-200">
        <p className="text-xs text-gray-500 flex items-center gap-2 font-medium">
          <span className="text-base">💡</span>
          <span>Usa los checkboxes para mostrar/ocultar capas</span>
        </p>
      </div>
    </div>
  )
}

export default LayerToggle
