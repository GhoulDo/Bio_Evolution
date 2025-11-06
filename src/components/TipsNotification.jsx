import { useState, useEffect } from 'react'
import { TIPS_RECICLAJE } from '../utils/constants'

const TipsNotification = () => {
  const [currentTip, setCurrentTip] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  useEffect(() => {
    // Mostrar un tip aleatorio cada 3 minutos
    const showTip = () => {
      if (isDismissed) return
      
      const randomTip = TIPS_RECICLAJE[Math.floor(Math.random() * TIPS_RECICLAJE.length)]
      setCurrentTip(randomTip)
      setIsVisible(true)
      
      // Auto-ocultar después de 10 segundos
      setTimeout(() => {
        setIsVisible(false)
      }, 10000)
    }
    
    // Mostrar primer tip después de 30 segundos
    const initialTimeout = setTimeout(showTip, 30000)
    
    // Mostrar tips cada 3 minutos
    const interval = setInterval(showTip, 180000)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [isDismissed])
  
  const handleDismiss = () => {
    setIsVisible(false)
  }
  
  const handleDismissAll = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }
  
  if (!isVisible || !currentTip) return null
  
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[2000] animate-slideInUp">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{currentTip.icono}</div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">💡 Tip Ecológico</h4>
            <p className="text-sm leading-relaxed">{currentTip.texto}</p>
            {currentTip.categoria && (
              <span className="inline-block mt-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
                {currentTip.categoria}
              </span>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismissAll}
            className="text-xs text-white hover:text-gray-200 underline"
          >
            No mostrar más tips
          </button>
        </div>
      </div>
    </div>
  )
}

export default TipsNotification
