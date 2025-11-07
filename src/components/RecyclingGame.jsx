import { useState, useEffect, useRef } from 'react'
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

const STORAGE_KEY = 'recycling-game-stats'
const BASE_TIME = 60
const MAX_TIME = 90

const RecyclingGame = () => {
  const [gameState, setGameState] = useState('inicio') // inicio, jugando, resultado
  const [currentItem, setCurrentItem] = useState(null)
  const [score, setScore] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(BASE_TIME)
  const [feedback, setFeedback] = useState(null)
  const [itemsUsed, setItemsUsed] = useState([])
  const [bestScore, setBestScore] = useState(0)
  const [bestStreakGlobal, setBestStreakGlobal] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [recentSessions, setRecentSessions] = useState([])
  const [recordFlags, setRecordFlags] = useState({ score: false, streak: false })
  const resultPersistedRef = useRef(false)
  const statsLoadedRef = useRef(false)
  const [keyboardHintVisible, setKeyboardHintVisible] = useState(false)

  const accuracyPercentage = totalItems > 0
    ? Number(((score / (totalItems * 10)) * 100).toFixed(1))
    : 0
  const ecoLevel = Math.min(5, Math.floor(maxStreak / 5) + 1)
  const comboMultiplier = streak >= 5
    ? (1 + Math.floor(streak / 5) * 0.5).toFixed(1)
    : null

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const savedStats = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
      if (savedStats) {
        setBestScore(savedStats.bestScore || 0)
        setBestStreakGlobal(savedStats.bestStreak || 0)
        setGamesPlayed(savedStats.gamesPlayed || 0)
        setRecentSessions(savedStats.recentSessions || [])
      }
    } catch (error) {
      console.warn('No se pudieron cargar las estadísticas guardadas', error)
    } finally {
      statsLoadedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!statsLoadedRef.current || typeof window === 'undefined') return
    const payload = {
      bestScore,
      bestStreak: bestStreakGlobal,
      gamesPlayed,
      recentSessions
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [bestScore, bestStreakGlobal, gamesPlayed, recentSessions])
  
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
  
  useEffect(() => {
    if (gameState !== 'resultado' || resultPersistedRef.current) return
    resultPersistedRef.current = true

    const isNewBestScore = score > bestScore
    const isNewBestStreak = maxStreak > bestStreakGlobal
    setRecordFlags({ score: isNewBestScore, streak: isNewBestStreak })

    if (isNewBestScore) {
      setBestScore(score)
    }
    if (isNewBestStreak) {
      setBestStreakGlobal(maxStreak)
    }
    setGamesPlayed(prev => prev + 1)
    setRecentSessions(prev => {
      const session = {
        score,
        maxStreak,
        accuracy: accuracyPercentage,
        timestamp: new Date().toISOString()
      }
      const updated = [session, ...prev]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
      return updated
    })
  }, [gameState, score, maxStreak, accuracyPercentage, bestScore, bestStreakGlobal])

  useEffect(() => {
    if (gameState !== 'jugando') return

    const handleKeyPress = (event) => {
      if (!currentItem || feedback) return
      const numeric = parseInt(event.key, 10)
      if (Number.isNaN(numeric) || numeric <= 0) return
      const index = numeric - 1
      const materialesUnicos = obtenerMaterialesUnicos()
      if (index >= materialesUnicos.length) return
      const [key] = materialesUnicos[index]
      checkAnswer(key)
      setKeyboardHintVisible(true)
      setTimeout(() => setKeyboardHintVisible(false), 2000)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, currentItem, feedback])

  const resetGameStates = () => {
    setScore(0)
    setTotalItems(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(BASE_TIME)
    setFeedback(null)
    setItemsUsed([])
    setRecordFlags({ score: false, streak: false })
    resultPersistedRef.current = false
  }

  const obtenerMaterialesUnicos = () => Object.entries(MATERIALES_INFO).filter(([key]) => (
    !key.includes('ó') && !key.includes('á') && !key.includes('é') && !key.includes('í') && !key.includes('ú')
  ))

  const startGame = () => {
    resetGameStates()
    setGameState('jugando')
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
      const upcomingStreak = streak + 1
      const multiplier = 1 + Math.floor((upcomingStreak - 1) / 5) * 0.5
      const basePoints = currentItem.dificultad * 10
      const points = Math.round(basePoints * multiplier)
      setScore(prev => prev + points)
      setStreak(prev => {
        const newStreak = prev + 1
        setMaxStreak(current => Math.max(current, newStreak))
        return newStreak
      })
      if (upcomingStreak > 0 && upcomingStreak % 5 === 0) {
        setTimeLeft(prev => Math.min(prev + 5, MAX_TIME))
      }
      setFeedback({ 
        type: 'success', 
        message: `¡Correcto! +${points} puntos`,
        streak: upcomingStreak,
        multiplier: multiplier > 1 ? `x${multiplier.toFixed(1)}` : null
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
    resetGameStates()
    setGameState('inicio')
  }
  
  // Filtrar materiales únicos (eliminar duplicados con/sin acento)
  const materialesUnicos = obtenerMaterialesUnicos()
  const tiempoPorcentaje = Math.max(0, Math.min(100, (timeLeft / MAX_TIME) * 100))

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3">
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Mejor Puntaje</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{bestScore}</div>
            </div>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Mejor Racha</div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{bestStreakGlobal}</div>
            </div>
            <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-3">
              <div className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">Partidas Jugadas</div>
              <div className="text-2xl sm:text-3xl font-bold text-teal-600">{gamesPlayed}</div>
            </div>
          </div>

          {recentSessions.length > 0 && (
            <div className="mb-4 sm:mb-6 text-left">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Últimas partidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentSessions.map((session, index) => (
                  <div 
                    key={`${session.timestamp}-${index}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div className="text-xs text-gray-400">
                      {new Date(session.timestamp).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-1">
                      <span>Puntos: <strong>{session.score}</strong></span>
                      <span>Racha: <strong>{session.maxStreak}</strong></span>
                      <span>Precisión: <strong>{session.accuracy}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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

          <p className="text-xs text-gray-400 mt-3">
            Consejo: puedes usar las teclas <span className="font-semibold">1-9</span> para seleccionar opciones rápidamente.
          </p>
        </div>
      </div>
    )
  }
  
  // Pantalla de juego - Responsive
  if (gameState === 'jugando') {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-large p-4 sm:p-6 lg:p-8 border border-gray-100">
        {/* Header con stats - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex gap-2 sm:gap-4 flex-1">
            <div className="flex-1 bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200 text-center">
              <div className="text-xs uppercase tracking-wide text-green-600 font-semibold mb-1">Puntos</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{score}</div>
            </div>
            <div className="flex-1 bg-orange-50 rounded-lg p-2 sm:p-3 border border-orange-200 text-center">
              <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">Racha</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{streak}</div>
            </div>
            <div className="flex-1 bg-emerald-50 rounded-lg p-2 sm:p-3 border border-emerald-200 text-center">
              <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-1">Nivel ECO</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">Lv. {ecoLevel}</div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200 min-w-[80px] sm:min-w-[100px] text-center">
            <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-gray-600">Tiempo</div>
          </div>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4 sm:mb-6">
          <div 
            className={`h-full transition-all duration-500 ${timeLeft <= 10 ? 'bg-gradient-to-r from-orange-400 via-red-500 to-red-600' : 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500'}`}
            style={{ width: `${tiempoPorcentaje}%` }}
          ></div>
        </div>

        {comboMultiplier && (
          <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 border border-yellow-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-yellow-800 mb-3 sm:mb-4 flex items-center justify-center gap-2 animate-pulse-soft">
            ⚡ Multiplicador activo: x{comboMultiplier}
          </div>
        )}

        {keyboardHintVisible && (
          <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-xs sm:text-sm mb-3 sm:mb-4 inline-flex items-center gap-2 shadow-xl">
            ⌨️ Usaste un atajo de teclado: números 1-9 corresponden a las tarjetas en orden.
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-600 mb-4">
          Rápido tip: cada racha de 5 respuestas correctas te suma <strong>+5 segundos</strong> y aumenta tu multiplicador.
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

          {(recordFlags.score || recordFlags.streak) && (
            <div className="bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-200 border border-emerald-300 rounded-xl px-4 py-3 mb-4 sm:mb-6 text-sm sm:text-base text-emerald-800 font-semibold">
              {recordFlags.score && recordFlags.streak
                ? '🌟 ¡Nuevo récord total y de racha! Sigue así, estás liderando el cambio.'
                : recordFlags.score
                ? '🌟 ¡Nuevo récord de puntaje! Tu clasificación fue excepcional.'
                : '💥 ¡Nueva racha histórica! Tienes reflejos de reciclador profesional.'}
            </div>
          )}

          {recentSessions.length > 0 && (
            <div className="mb-4 sm:mb-6 text-left">
              <h3 className="text-xs sm:text-sm uppercase tracking-wide text-gray-500 font-semibold mb-2">Historial reciente</h3>
              <div className="space-y-2">
                {recentSessions.map((session, index) => (
                  <div
                    key={`${session.timestamp}-res-${index}`}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-400 w-full sm:w-auto">
                      {new Date(session.timestamp).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className="text-gray-600">Puntos: <strong>{session.score}</strong></span>
                    <span className="text-gray-600">Racha: <strong>{session.maxStreak}</strong></span>
                    <span className="text-gray-600">Precisión: <strong>{session.accuracy}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
