import { useState } from 'react'

const AppHeader = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('mapa')
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (onNavigate) {
      onNavigate(tab)
    }
  }
  
  return (
    <header className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 shadow-2xl sticky top-0 z-50 backdrop-blur-md bg-opacity-98 border-b-2 border-emerald-400/30">
      {/* Efecto de brillo superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {/* Logo y título mejorado - Más profesional */}
          <div className="flex items-center gap-3 sm:gap-4 group flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-2 border-2 border-white/30 shadow-lg">
                <img 
                  src="/images/Logo_Bio_Evolution.png" 
                  alt="Bio Evolution" 
                  className="h-10 w-10 sm:h-14 sm:w-14 object-contain transform transition-transform group-hover:scale-110 group-hover:rotate-3"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white drop-shadow-lg tracking-tight truncate">
                  Bio Evolution
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-500/30 rounded-md text-xs font-bold text-white border border-white/20">
                  PRO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-50 font-semibold hidden sm:block mt-0.5">
                Tu guía inteligente de reciclaje en Bogotá
              </p>
            </div>
          </div>
          
          {/* Información UAESP mejorada - Más destacada */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="glass-dark rounded-xl px-5 py-3 border-2 border-white/30 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-300 text-sm">📊</span>
                <p className="text-xs text-emerald-50 font-semibold uppercase tracking-wide">Datos Oficiales</p>
              </div>
              <p className="font-bold text-white text-sm leading-tight">UAESP - IDECA</p>
            </div>
          </div>
        </div>
        
        {/* Navegación mejorada - Estilo más profesional */}
        <nav className="flex gap-2 sm:gap-3 overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
          <button
            onClick={() => handleTabChange('mapa')}
            className={`group relative px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold transition-all duration-300 transform flex-shrink-0 whitespace-nowrap overflow-hidden ${
              activeTab === 'mapa'
                ? 'bg-white text-green-700 shadow-xl scale-105 ring-2 ring-white/50'
                : 'bg-white/15 text-white hover:bg-white/25 hover:scale-[1.02] backdrop-blur-sm border border-white/20'
            }`}
          >
            {/* Efecto de brillo en botón activo */}
            {activeTab === 'mapa' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            <span className="relative flex items-center gap-2">
              <span className="text-lg sm:text-xl">🗺️</span>
              <span className="text-sm sm:text-base font-semibold">Mapa Interactivo</span>
            </span>
          </button>
          
          <button
            onClick={() => handleTabChange('operadores')}
            className={`group relative px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold transition-all duration-300 transform flex-shrink-0 whitespace-nowrap overflow-hidden ${
              activeTab === 'operadores'
                ? 'bg-white text-green-700 shadow-xl scale-105 ring-2 ring-white/50'
                : 'bg-white/15 text-white hover:bg-white/25 hover:scale-[1.02] backdrop-blur-sm border border-white/20'
            }`}
          >
            {activeTab === 'operadores' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            <span className="relative flex items-center gap-2">
              <span className="text-lg sm:text-xl">🚛</span>
              <span className="text-sm sm:text-base font-semibold">Operadores</span>
            </span>
          </button>
          
          <button
            onClick={() => handleTabChange('educacion')}
            className={`group relative px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold transition-all duration-300 transform flex-shrink-0 whitespace-nowrap overflow-hidden ${
              activeTab === 'educacion'
                ? 'bg-white text-green-700 shadow-xl scale-105 ring-2 ring-white/50'
                : 'bg-white/15 text-white hover:bg-white/25 hover:scale-[1.02] backdrop-blur-sm border border-white/20'
            }`}
          >
            {activeTab === 'educacion' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            <span className="relative flex items-center gap-2">
              <span className="text-lg sm:text-xl">🎮</span>
              <span className="text-sm sm:text-base font-semibold">Aprende Jugando</span>
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}

export default AppHeader
