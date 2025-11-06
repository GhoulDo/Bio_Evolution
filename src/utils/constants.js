// Mapa de operadores - usando nombres normalizados (sin acentos, mayúsculas)
// La función normalizeLocalidad quita acentos, así que usamos nombres sin acentos aquí
export const OPERADORES_MAP = {
  'CHAPINERO': 'Area_Limpia',
  'USAQUEN': 'Area_Limpia', // Normalizado sin acento
  'SANTA FE': 'Area_Limpia',
  'LA CANDELARIA': 'Area_Limpia',
  'SAN CRISTOBAL': 'Area_Limpia',
  'SUMAPAZ': 'Area_Limpia',
  'USME': 'Area_Limpia', // Agregado - faltaba
  'CIUDAD BOLIVAR': 'ciudad_limpia',
  'BOSA': 'ciudad_limpia',
  'TUNJUELITO': 'ciudad_limpia',
  'ANTONIO NARINO': 'ciudad_limpia', // Normalizado sin ñ
  'PUENTE ARANDA': 'ciudad_limpia',
  'LOS MARTIRES': 'ciudad_limpia', // Normalizado sin acento
  'TEUSAQUILLO': 'ciudad_limpia',
  'RAFAEL URIBE URIBE': 'ciudad_limpia',
  'KENNEDY': 'Lime',
  'FONTIBON': 'Lime', // Normalizado sin acento
  'ENGATIVA': 'bogota_limpia', // Normalizado sin acento
  'BARRIOS UNIDOS': 'bogota_limpia',
  'SUBA': 'pro_ambiental'
}

export const OPERADORES_NOMBRES = {
  'Area_Limpia': 'Área Limpia',
  'ciudad_limpia': 'Ciudad Limpia',
  'Lime': 'LIME',
  'bogota_limpia': 'Bogotá Limpia',
  'pro_ambiental': 'Promoambiental',
  'desconocido': 'Operador No Identificado'
}

export const MATERIALES_INFO = {
  papel: {
    nombre: 'Papel y Cartón',
    icono: '📄',
    color: '#3B82F6',
    tips: 'Limpio y seco. Incluye: periódicos, revistas, cajas de cartón (aplastadas). No papel encerado o con grasa.'
  },
  plastico: {
    nombre: 'Plástico',
    icono: '♻️',
    color: '#10B981',
    tips: 'Enjuagado sin residuos. PET, PEAD, PP. Retire tapas y etiquetas. No mezclar con otros materiales.'
  },
  plástico: { // Variante con acento
    nombre: 'Plástico',
    icono: '♻️',
    color: '#10B981',
    tips: 'Enjuagado sin residuos. PET, PEAD, PP. Retire tapas y etiquetas. No mezclar con otros materiales.'
  },
  vidrio: {
    nombre: 'Vidrio',
    icono: '🍾',
    color: '#059669',
    tips: 'Limpio, sin tapas metálicas. Separe por color si es posible. Cuidado con vidrios rotos.'
  },
  metal: {
    nombre: 'Metal',
    icono: '🥫',
    color: '#6B7280',
    tips: 'Latas de aluminio y acero. Aplastar para ahorrar espacio. Retire etiquetas si es posible.'
  },
  organico: {
    nombre: 'Orgánico',
    icono: '🌱',
    color: '#84CC16',
    tips: 'Restos de comida, cáscaras, restos de jardín. Ideal para compostaje. Evitar carnes y lácteos.'
  },
  'orgánico': { // Variante con acento
    nombre: 'Orgánico',
    icono: '🌱',
    color: '#84CC16',
    tips: 'Restos de comida, cáscaras, restos de jardín. Ideal para compostaje. Evitar carnes y lácteos.'
  },
  cartón: {
    nombre: 'Cartón',
    icono: '📦',
    color: '#8B5CF6',
    tips: 'Aplastar las cajas. Retirar cintas adhesivas y grapas. Mantener seco y limpio.'
  },
  'cartón': { // Variante con acento
    nombre: 'Cartón',
    icono: '📦',
    color: '#8B5CF6',
    tips: 'Aplastar las cajas. Retirar cintas adhesivas y grapas. Mantener seco y limpio.'
  },
  RAEE: {
    nombre: 'Electrónicos (RAEE)',
    icono: '📱',
    color: '#EF4444',
    tips: 'Aparatos eléctricos y electrónicos. Llevar a puntos especializados. Contienen materiales peligrosos.'
  }
}

export const BOGOTA_CENTER = [4.6097, -74.0817]
export const BOGOTA_BOUNDS = {
  north: 4.9,
  south: 4.4,
  east: -73.8,
  west: -74.3
}

export const DEFAULT_ZOOM = 11
export const SEARCH_RADIUS_KM = 2
export const MAX_SEARCH_RESULTS = 10

export const GEOCODING_CONFIG = {
  nominatim: {
    url: 'https://nominatim.openstreetmap.org/search',
    params: {
      format: 'json',
      limit: MAX_SEARCH_RESULTS,
      countrycodes: 'co',
      viewbox: `${BOGOTA_BOUNDS.west},${BOGOTA_BOUNDS.south},${BOGOTA_BOUNDS.east},${BOGOTA_BOUNDS.north}`,
      bounded: 1,
      addressdetails: 1
    },
    headers: {
      'User-Agent': 'BioEvolution-UAESP/1.0 (https://github.com/ghouldev)'
    }
  }
}

export const MAP_CONFIG = {
  attributionControl: true,
  zoomControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  maxZoom: 18,
  minZoom: 9,
  maxBounds: [
    [BOGOTA_BOUNDS.south - 0.1, BOGOTA_BOUNDS.west - 0.1],
    [BOGOTA_BOUNDS.north + 0.1, BOGOTA_BOUNDS.east + 0.1]
  ]
}

// Configuración de colores por operador
export const OPERADOR_COLORS = {
  'Area_Limpia': '#3B82F6',      // Azul
  'ciudad_limpia': '#10B981',     // Verde
  'Lime': '#F59E0B',             // Amarillo/Naranja
  'bogota_limpia': '#8B5CF6',    // Púrpura
  'pro_ambiental': '#EF4444',    // Rojo
  'desconocido': '#6B7280'       // Gris
}

// Configuración de tipos de sitio
export const TIPOS_SITIO = {
  'ECA': {
    nombre: 'Estación de Clasificación y Aprovechamiento',
    icono: '🏭',
    color: '#059669'
  },
  'Punto Verde': {
    nombre: 'Punto Verde de Reciclaje',
    icono: '♻️',
    color: '#84CC16'
  },
  'Punto de Reciclaje': {
    nombre: 'Punto de Reciclaje',
    icono: '🗂️',
    color: '#10B981'
  }
}

// Patrones de frecuencia comunes
export const FRECUENCIA_PATTERNS = {
  'lunes-miercoles-viernes': ['Lunes', 'Miércoles', 'Viernes'],
  'martes-jueves-sabado': ['Martes', 'Jueves', 'Sábado'],
  'lunes-miercoles': ['Lunes', 'Miércoles'],
  'martes-jueves': ['Martes', 'Jueves']
}

export const DIAS_SEMANA = {
  'lun': 'Lunes',
  'mar': 'Martes', 
  'mie': 'Miércoles',
  'jue': 'Jueves',
  'vie': 'Viernes',
  'sab': 'Sábado',
  'dom': 'Domingo'
}

// Tips de reciclaje para notificaciones
export const TIPS_RECICLAJE = [
  {
    icono: '♻️',
    texto: 'Separa tus residuos en 3 categorías: aprovechables (blancos), no aprovechables (negros) y orgánicos (verdes).',
    categoria: 'Separación'
  },
  {
    icono: '🧼',
    texto: 'Lava y seca los envases antes de reciclarlos. Los residuos de comida pueden contaminar todo el material reciclable.',
    categoria: 'Preparación'
  },
  {
    icono: '📦',
    texto: 'Aplasta las cajas de cartón y botellas plásticas para ahorrar espacio y facilitar el transporte.',
    categoria: 'Espacio'
  },
  {
    icono: '🔌',
    texto: 'Los aparatos electrónicos deben llevarse a puntos especializados (ECA). Nunca los mezcles con otros residuos.',
    categoria: 'RAEE'
  },
  {
    icono: '🌱',
    texto: 'Los residuos orgánicos pueden convertirse en compost. Es un excelente abono para plantas.',
    categoria: 'Compostaje'
  },
  {
    icono: '🔴',
    texto: 'Las tapas de las botellas deben separarse del envase. Son de diferente tipo de plástico.',
    categoria: 'Plásticos'
  },
  {
    icono: '📰',
    texto: 'El papel y cartón sucio o con grasa NO se puede reciclar. Va en residuos no aprovechables.',
    categoria: 'Papel'
  },
  {
    icono: '🍾',
    texto: 'El vidrio puede reciclarse infinitas veces sin perder calidad. ¡Es uno de los mejores materiales!',
    categoria: 'Vidrio'
  },
  {
    icono: '🛍️',
    texto: 'Reutiliza las bolsas plásticas varias veces antes de reciclarlas. Reducir es mejor que reciclar.',
    categoria: 'Reducción'
  },
  {
    icono: '⏰',
    texto: 'Saca tus residuos en el horario indicado. Así evitas multas y ayudas a mantener limpia tu cuadra.',
    categoria: 'Horarios'
  },
  {
    icono: '🚫',
    texto: 'Nunca mezcles residuos peligrosos (pilas, medicamentos, químicos) con los residuos comunes.',
    categoria: 'Peligrosos'
  },
  {
    icono: '🥫',
    texto: 'Las latas de aluminio son muy valiosas. Aplástalas para ahorrar espacio y recíclalas siempre.',
    categoria: 'Metales'
  },
  {
    icono: '💡',
    texto: 'Un solo bombillo LED mal desechado puede contaminar hasta 5,000 litros de agua. Llévalos a puntos limpios.',
    categoria: 'RAEE'
  },
  {
    icono: '🌍',
    texto: 'Reciclar 1 tonelada de papel salva 17 árboles y ahorra 26,000 litros de agua.',
    categoria: 'Impacto'
  },
  {
    icono: '♻️',
    texto: 'El plástico tarda hasta 500 años en degradarse. ¡Cada esfuerzo por reciclarlo cuenta!',
    categoria: 'Impacto'
  }
]

// Mapeo de IDs de localidad a nombres (según POT Bogotá)
export const LOCALIDAD_ID_MAP = {
  '1': 'USAQUÉN',
  '2': 'CHAPINERO',
  '3': 'SANTA FE',
  '4': 'SAN CRISTÓBAL',
  '5': 'USME',
  '6': 'TUNJUELITO',
  '7': 'BOSA',
  '8': 'KENNEDY',
  '9': 'FONTIBÓN',
  '10': 'ENGATIVÁ',
  '11': 'SUBA',
  '12': 'BARRIOS UNIDOS',
  '13': 'TEUSAQUILLO',
  '14': 'LOS MÁRTIRES',
  '15': 'ANTONIO NARIÑO',
  '16': 'PUENTE ARANDA',
  '17': 'LA CANDELARIA',
  '18': 'RAFAEL URIBE URIBE',
  '19': 'CIUDAD BOLÍVAR',
  '20': 'SUMAPAZ'
}

// Mapeo inverso: nombre a ID
export const LOCALIDAD_NAME_TO_ID = Object.entries(LOCALIDAD_ID_MAP).reduce((acc, [id, name]) => {
  acc[name] = id
  return acc
}, {})
