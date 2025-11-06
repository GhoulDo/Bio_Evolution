import { useState, useRef, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppHeader from './components/AppHeader'
import SearchBar from './components/SearchBar'
import MapView from './components/MapView'
import InfoPanel from './components/InfoPanel'
import LayerToggle from './components/LayerToggle'
import OperatorGallery from './components/OperatorGallery'
import EducationPanel from './components/EducationPanel'
import SitiosList from './components/SitiosList'
import TipsNotification from './components/TipsNotification'
import RecyclingGame from './components/RecyclingGame'
import { useGeoData } from './hooks/useGeoData'
import { preprocessMacrorutas, preprocessSitios, loadAllData } from './utils/dataLoader'
import { OPERADORES_MAP } from './utils/constants'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

function AppContent() {
  const [activeView, setActiveView] = useState('mapa')
  const mapContainerRef = useRef(null)
  
  const { isLoading, isError, error } = useGeoData()
  
  const handleLocationSelected = (location) => {
    // El mapa se actualizará automáticamente por el store
    console.log('Ubicación seleccionada:', location)
  }
  
  // Pantalla de carga mejorada
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-12 shadow-large border border-white/50">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-20 w-20 border-[4px] border-green-200 border-t-green-600 mx-auto"></div>
          </div>
          <p className="text-2xl font-bold gradient-text mb-2">Cargando datos...</p>
          <p className="text-sm text-gray-600 mt-2">Preparando información de recolección</p>
        </div>
      </div>
    )
  }
  
  // Pantalla de error mejorada
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-large p-10 max-w-md border border-gray-200 animate-scale-in">
          <div className="text-7xl mb-6 text-center animate-bounce-subtle">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
            Error al cargar datos
          </h2>
          <p className="text-gray-700 mb-6 text-center leading-relaxed">
            {error?.message || 'No se pudieron cargar los datos de recolección'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-100">
      <AppHeader onNavigate={setActiveView} />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Vista de Mapa */}
        {activeView === 'mapa' && (
          <>
            {/* Barra de búsqueda */}
            <div className="mb-4 sm:mb-6">
              <SearchBar onLocationSelected={handleLocationSelected} />
            </div>
            
            {/* Layout responsive mejorado */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Columna izquierda: Mapa y controles */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
                <div ref={mapContainerRef} className="h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden shadow-large border border-gray-200 animate-fade-in">
                  <MapView />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="animate-slide-up">
                    <LayerToggle />
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <SitiosList />
                  </div>
                </div>
              </div>
              
              {/* Columna derecha: Panel de información */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24">
                  <InfoPanel />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Vista de Operadores */}
        {activeView === 'operadores' && (
          <OperatorGallery />
        )}
        
        {/* Vista de Educación - Reemplazar con el juego */}
        {activeView === 'educacion' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <RecyclingGame />
            </div>
            <div>
              <EducationPanel />
            </div>
          </div>
        )}
      </main>
      
      {/* Sistema de notificaciones con tips */}
      <TipsNotification />
      
      {/* Footer mejorado */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-16 py-12 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in">
              <h3 className="font-bold text-xl mb-4 gradient-text">Bio Evolution</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Aplicación desarrollada por Equipo Ghouldev para facilitar el acceso a información de recolección de residuos en Bogotá.
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-bold text-xl mb-4">Fuentes de Datos</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <span>UAESP - Unidad Administrativa Especial de Servicios Públicos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <span>IDECA - Infraestructura de Datos Espaciales</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <span>Datos actualizados: 2021-11-30</span>
                </li>
              </ul>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-bold text-xl mb-4">Contacto</h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Versión 1.0.0 - 2025
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Bio Evolution. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
