import { useState } from 'react'
import { MATERIALES_INFO } from '../utils/constants'

const EducationPanel = () => {
  const [expandedCategory, setExpandedCategory] = useState(null)
  
  const toggleCategory = (key) => {
    setExpandedCategory(expandedCategory === key ? null : key)
  }
  
  // Filtrar materiales únicos (eliminar duplicados)
  const materialesUnicos = Object.entries(MATERIALES_INFO).filter(([key]) => {
    return !key.includes('ó') && !key.includes('á') && !key.includes('é') && !key.includes('í') && !key.includes('ú')
  })

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-large p-4 sm:p-6 lg:p-8 card-hover border border-gray-100">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-2">
          Guía de Separación de Residuos
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Aprende a separar correctamente tus residuos para facilitar el reciclaje
        </p>
      </div>
      
      {/* Categorías de materiales - Sin duplicados */}
      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
        {materialesUnicos.map(([key, info]) => (
          <div 
            key={key}
            className="border-2 border-gray-200 rounded-lg overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleCategory(key)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              style={{
                borderLeftColor: info.color,
                borderLeftWidth: '4px'
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span className="text-2xl sm:text-3xl flex-shrink-0">{info.icono}</span>
                <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{info.nombre}</span>
              </div>
              <span className="text-gray-400 text-lg sm:text-xl flex-shrink-0 ml-2">
                {expandedCategory === key ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedCategory === key && (
              <div 
                className="p-4 border-t-2 border-gray-200"
                style={{ backgroundColor: `${info.color}10` }}
              >
                <p className="text-gray-700 mb-4">{info.tips}</p>
                
                {key === 'papel' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">✓ SÍ reciclar:</p>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      <li>Periódicos y revistas</li>
                      <li>Hojas de papel y cartón</li>
                      <li>Cajas de cartón (aplastadas)</li>
                      <li>Sobres sin ventana de plástico</li>
                    </ul>
                    <p className="font-semibold text-gray-800 mt-3">✗ NO reciclar:</p>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      <li>Papel encerado o plastificado</li>
                      <li>Papel higiénico o servilletas usadas</li>
                      <li>Papel con grasa o alimentos</li>
                    </ul>
                  </div>
                )}
                
                {key === 'plastico' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">✓ SÍ reciclar:</p>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      <li>Botellas PET (código 1)</li>
                      <li>Envases de shampoo y limpieza</li>
                      <li>Tapas plásticas (separadas)</li>
                      <li>Bolsas limpias y secas</li>
                    </ul>
                    <p className="font-semibold text-gray-800 mt-3">✗ NO reciclar:</p>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      <li>Plástico con residuos de alimentos</li>
                      <li>Icopor (llevar a puntos especiales)</li>
                      <li>Empaques multicapa (metalizados)</li>
                    </ul>
                  </div>
                )}
                
                {key === 'RAEE' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                    <p className="text-sm text-red-800">
                      ⚠️ Los residuos electrónicos contienen materiales peligrosos. 
                      Llévalos a puntos de recolección especializados (ECA).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Código de colores - Responsive */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
          Código de Colores para Separación
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border-4 border-gray-400 rounded"></div>
            <div>
              <p className="font-semibold text-gray-800">Blanco</p>
              <p className="text-sm text-gray-600">Aprovechables</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded"></div>
            <div>
              <p className="font-semibold text-gray-800">Negro</p>
              <p className="text-sm text-gray-600">No aprovechables</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded"></div>
            <div>
              <p className="font-semibold text-gray-800">Verde</p>
              <p className="text-sm text-gray-600">Orgánicos</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Consejos adicionales */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">💡 Consejos importantes</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Limpia y seca los envases antes de reciclar</li>
          <li>• Aplasta las cajas y botellas para ahorrar espacio</li>
          <li>• Separa las tapas de las botellas</li>
          <li>• No mezcles materiales diferentes en la misma bolsa</li>
          <li>• Saca los residuos en los horarios indicados</li>
        </ul>
      </div>
    </div>
  )
}

export default EducationPanel
