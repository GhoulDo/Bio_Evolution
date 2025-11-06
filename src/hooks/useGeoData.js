import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import useAppStore from '../store/useAppStore'
import { 
  loadGeoJSON, 
  preprocessMacrorutas, 
  preprocessSitios, 
  validateGeoJSON 
} from '../utils/dataLoader'

/**
 * Hook principal para cargar y gestionar datos geoespaciales
 */
export const useGeoData = () => {
  const { setMacrorutas, setSitiosAprovechamiento } = useAppStore()
  
  // Query para macrorutas
  const macrorutasQuery = useQuery({
    queryKey: ['macrorutas'],
    queryFn: async () => {
      console.log('🔄 Cargando macrorutas...')
      
      try {
        const rawData = await loadGeoJSON('macrobarr.geojson')
        
        if (!validateGeoJSON(rawData, 'macrobarr.geojson')) {
          throw new Error('GeoJSON de macrorutas inválido')
        }
        
        // No pasar operadoresMap - la función lo creará normalizado internamente
        const processedData = preprocessMacrorutas(rawData)
        console.log('✅ Macrorutas procesadas:', processedData.features.length)
        return processedData
        
      } catch (error) {
        console.error('❌ Error procesando macrorutas:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24, // Nueva API de React Query
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
  
  // Query para sitios de aprovechamiento - usar archivo correcto
  const sitiosQuery = useQuery({
    queryKey: ['sitios-aprovechamiento'],
    queryFn: async () => {
      console.log('🔄 Cargando sitios de aprovechamiento...')
      
      try {
        // Intentar cargar el archivo principal primero
        const rawData = await loadGeoJSON('sitio_aprovechamiento_residuos.geojson')
        
        if (!validateGeoJSON(rawData, 'sitio_aprovechamiento_residuos.geojson')) {
          throw new Error('GeoJSON de sitios inválido')
        }
        
        const processedData = preprocessSitios(rawData)
        console.log('✅ Sitios procesados:', processedData.features.length)
        return processedData
        
      } catch (error) {
        console.error('❌ Error procesando sitios:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 12,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
  
  // Sincronizar con store
  useEffect(() => {
    if (macrorutasQuery.data && !macrorutasQuery.isError) {
      console.log('🔄 Actualizando store con macrorutas')
      setMacrorutas(macrorutasQuery.data)
    }
  }, [macrorutasQuery.data, macrorutasQuery.isError, setMacrorutas])
  
  useEffect(() => {
    if (sitiosQuery.data && !sitiosQuery.isError) {
      console.log('🔄 Actualizando store con sitios')
      setSitiosAprovechamiento(sitiosQuery.data)
    }
  }, [sitiosQuery.data, sitiosQuery.isError, setSitiosAprovechamiento])
  
  // Estados derivados
  const isLoading = macrorutasQuery.isLoading || sitiosQuery.isLoading
  const isError = macrorutasQuery.isError || sitiosQuery.isError
  const error = macrorutasQuery.error || sitiosQuery.error
  
  // Funciones de utilidad
  const refetch = () => {
    console.log('🔄 Recargando todos los datos...')
    macrorutasQuery.refetch()
    sitiosQuery.refetch()
  }
  
  const getLoadingStatus = () => {
    return {
      macrorutas: {
        loading: macrorutasQuery.isLoading,
        error: macrorutasQuery.isError,
        success: !!macrorutasQuery.data
      },
      sitios: {
        loading: sitiosQuery.isLoading,
        error: sitiosQuery.isError,
        success: !!sitiosQuery.data
      }
    }
  }
  
  return {
    // Datos
    macrorutas: macrorutasQuery.data,
    sitios: sitiosQuery.data,
    
    // Estados
    isLoading,
    isError,
    error,
    
    // Estados detallados
    macrorutasLoading: macrorutasQuery.isLoading,
    sitiosLoading: sitiosQuery.isLoading,
    macrorutasError: macrorutasQuery.isError,
    sitiosError: sitiosQuery.isError,
    
    // Funciones
    refetch,
    getLoadingStatus,
    
    // Queries individuales (para uso avanzado)
    macrorutasQuery,
    sitiosQuery
  }
}

export default useGeoData
