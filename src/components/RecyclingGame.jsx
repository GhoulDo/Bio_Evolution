import { useState, useEffect } from 'react'
import { MATERIALES_INFO } from '../utils/constants'

const ITEMS_JUEGO = [
  { nombre: 'Botella de plástico', tipo: 'plastico', icono: '🍶', dificultad: 1 },
  { nombre: 'Periódico', tipo: 'papel', icono: '📰', dificultad: 1 },
  { nombre: 'Botella de vidrio', tipo: 'vidrio', icono: '🍾', dificultad: 1 },
  { nombre: 'Lata de aluminio', tipo: 'metal', icono: '🥫', dificultad: 1 },
  { nombre: 'Cáscara de plátano', tipo: 'organico', icono: '🍌', dificultad: 1 },
  { nombre: 'Celular viejo', tipo: 'RAEE', icono: '📱', dificultad: 2 },
  { nombre: 'Caja de cartón', tipo: 'papel', icono: '📦', dificultad: 1 },
  { nombre: 'Bolsa plástica', tipo: 'plastico', icono: '🛍️', dificultad: 2 },
  { nombre: 'Computador', tipo: 'RAEE', icono: '💻', dificultad: 2 },
  { nombre: 'Restos de comida', tipo: 'organico', icono: '🍽️', dificultad: 1 },
  { nombre: 'Bombillo', tipo: 'RAEE', icono: '💡', dificultad: 3 },
  { nombre: 'Frasco de mermelada', tipo: 'vidrio', icono: '🫙', dificultad: 2 },
  { nombre: 'Revista', tipo: 'papel', icono: '📖', dificultad: 1 },
  { nombre: 'Tapa plástica', tipo: 'plastico', icono: '🔘', dificultad: 2 },
  { nombre: 'Cable eléctrico', tipo: 'RAEE', icono: '🔌', dificultad: 3 },
  { nombre: 'Hojas secas', tipo: 'organico', icono: '🍂', dificultad: 1 },
  { nombre: 'Lata de conservas', tipo: 'metal', icono: '🥫', dificultad: 1 },
  { nombre: 'Batería', tipo: 'RAEE', icono: '🔋', dificultad: 3 },
]

const RecyclingGame = () => {
  const [gameState, setGameState] = useState('inicio') // inicio, jugando, resultado
  const [currentItem, setCurrentItem] = useState(null)
  const [score, setScore] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [feedback, setFeedback] = useState(null)
  const [itemsUsed, setItemsUsed] = useState([])
  
  // Temporizador del juego
  useEffect(() => {
    if (gameState !== 'jugando') return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('resultado')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameState])
  
  // Auto-limpiar feedback
  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => setFeedback(null), 2000)
      return () => clearTimeout(timeout)
    }
  }, [feedback])
  
  const startGame = () => {
    setGameState('jugando')
    setScore(0)
    setTotalItems(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(60)
    setFeedback(null)
    setItemsUsed([])
    nextItem()
  }
  
  const nextItem = () => {
    // Filtrar items no usados
    const available = ITEMS_JUEGO.filter(item => !itemsUsed.includes(item.nombre))
    
    if (available.length === 0) {
      // Reiniciar pool si se acabaron
      setItemsUsed([])
      const randomItem = ITEMS_JUEGO[Math.floor(Math.random() * ITEMS_JUEGO.length)]
      setCurrentItem(randomItem)
      setItemsUsed([randomItem.nombre])
    } else {
      const randomItem = available[Math.floor(Math.random() * available.length)]
      setCurrentItem(randomItem)
      setItemsUsed(prev => [...prev, randomItem.nombre])
    }
  }
  
  const checkAnswer = (selectedType) => {
    if (!currentItem || feedback) return // Prevenir múltiples clicks
    
    // Normalizar tipos (manejar variantes con/sin acento)
    const normalizeType = (type) => {
      if (type === 'orgánico' || type === 'organico') return 'organico'
      if (type === 'plástico' || type === 'plastico') return 'plastico'
      if (type === 'cartón' || type === 'carton') return 'carton'
      return type
    }
    
    const normalizedSelected = normalizeType(selectedType)
    const normalizedCurrent = normalizeType(currentItem.tipo)
    const isCorrect = normalizedSelected === normalizedCurrent
    
    setTotalItems(prev => prev + 1)
    
    if (isCorrect) {
      const points = currentItem.dificultad * 10
      setScore(prev => prev + points)
      setStreak(prev => {
        const newStreak = prev + 1
        setMaxStreak(current => Math.max(current, newStreak))
        return newStreak
      })
      setFeedback({ 
        type: 'success', 
        message: `¡Correcto! +${points} puntos`,
        streak: streak + 1
      })
    } else {
      setStreak(0)
      const correctInfo = MATERIALES_INFO[currentItem.tipo] || MATERIALES_INFO[normalizedCurrent]
      setFeedback({ 
        type: 'error', 
        message: `Incorrecto. Era ${correctInfo?.nombre || currentItem.tipo}`,
        correct: currentItem.tipo
      })
    }
    
    setTimeout(() => {
      setFeedback(null)
      nextItem()
    }, 2000)
  }
  
  const restartGame = () => {
    setGameState('inicio')
    setFeedback(null)
  }
  
  // Filtrar materiales únicos (eliminar duplicados con/sin acento)
  const materialesUnicos = Object.entries(MATERIALES_INFO).filter(([key]) => {
    // Mantener solo las versiones sin acento o la primera ocurrencia
    return !key.includes('ó') && !key.includes('á') && !key.includes('é') && !key.includes('í') && !key.includes('ú')
  })

  // Pantalla de inicio - Responsive
  if (gameState === 'inicio') {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-large p-4 sm:p-6 lg:p-8 card-hover border border-gray-100">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4 animate-bounce-subtle">♻️</div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-3 sm:mb-4">
            Juego de Clasificación
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
            Clasifica correctamente los residuos en 60 segundos. 
            <span className="block mt-1">¡Gana más puntos con items difíciles!</span>
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {materialesUnicos.slice(0, 6).map(([key, info]) => (
              <div 
                key={key}
                className="p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <div className="text-xl sm:text-2xl mb-1">{info.icono}</div>
                <div className="text-xs font-medium text-gray-700 line-clamp-2">{info.nombre}</div>
              </div>
            ))}
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎮 Comenzar Juego
          </button>
        </div>
      </div>
    )
  }
  
  // Pantalla de juego - Responsive
  if (gameState === 'jugando') {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-large p-4 sm:p-6 lg:p-8 border border-gray-100">
        {/* Header con stats - Responsive */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <div className="flex gap-2 sm:gap-4 flex-1">
            <div className="text-center flex-1 bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{score}</div>
              <div className="text-xs text-gray-600">Puntos</div>
            </div>
            <div className="text-center flex-1 bg-orange-50 rounded-lg p-2 sm:p-3 border border-orange-200">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{streak}</div>
              <div className="text-xs text-gray-600">Racha</div>
            </div>
          </div>
          
          <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200 min-w-[60px] sm:min-w-[80px]">
            <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-gray-600">Tiempo</div>
          </div>
        </div>
        
        {/* Item actual - Responsive */}
        {currentItem && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center mb-3 sm:mb-4 border-2 border-gray-200">
              <div className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4 animate-bounce-subtle">{currentItem.icono}</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">{currentItem.nombre}</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Dificultad: <span className="text-yellow-500">{'⭐'.repeat(currentItem.dificultad)}</span>
              </p>
            </div>
            
            {/* Opciones de clasificación - Responsive y sin duplicados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {materialesUnicos.map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => checkAnswer(key)}
                  disabled={!!feedback}
                  className={`p-3 sm:p-4 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    feedback?.correct === key 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : feedback?.type === 'error' && key === currentItem?.tipo
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                  }`}
                  style={{ 
                    borderColor: feedback?.correct === key ? info.color : undefined,
                    backgroundColor: feedback?.correct === key ? `${info.color}20` : undefined
                  }}
                >
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{info.icono}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-2">{info.nombre}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Feedback - Mejorado */}
        {feedback && (
          <div className={`p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 text-center font-bold animate-scale-in shadow-md ${
            feedback.type === 'success' 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300' 
              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300'
          }`}>
            <div className="text-sm sm:text-base">{feedback.message}</div>
            {feedback.streak > 2 && (
              <div className="text-xs sm:text-sm mt-1">🔥 ¡Racha de {feedback.streak}!</div>
            )}
          </div>
        )}
        
        {/* Progreso - Mejorado */}
        <div className="text-center text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
          Items clasificados: <span className="font-bold text-gray-700">{totalItems}</span>
        </div>
      </div>
    )
  }
  
  // Pantalla de resultados - Responsive
  if (gameState === 'resultado') {
    const accuracy = totalItems > 0 ? ((score / (totalItems * 10)) * 100).toFixed(1) : 0
    
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-large p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4 animate-bounce-subtle">
            {score > 300 ? '🏆' : score > 150 ? '🥇' : score > 50 ? '🥈' : '🥉'}
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-3 sm:mb-4">
            ¡Juego Terminado!
          </h2>
          
          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 my-4 sm:my-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-green-200 shadow-soft">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">{score}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Puntos Totales</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border-2 border-orange-200 shadow-soft">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600">{maxStreak}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Racha Máxima</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200 shadow-soft">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Items Clasificados</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 sm:p-4 border-2 border-purple-200 shadow-soft">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Precisión</div>
            </div>
          </div>
          
          {/* Mensaje de desempeño - Mejorado */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-200">
            <p className="font-bold text-sm sm:text-base text-gray-800">
              {score > 300 ? '¡Excelente! Eres un experto en reciclaje 🎉' :
               score > 150 ? '¡Muy bien! Tienes buenos conocimientos 👍' :
               score > 50 ? 'Buen intento, sigue practicando 💪' :
               'Necesitas aprender más sobre reciclaje 📚'}
            </p>
          </div>
          
          {/* Botones - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Jugar de Nuevo
            </button>
            <button
              onClick={restartGame}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏠 Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default RecyclingGame
