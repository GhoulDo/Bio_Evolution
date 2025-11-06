/**
 * @typedef {Object} Zonificacion
 * @property {string} operador - Nombre del operador
 * @property {string} zona_id - ID de la zona
 * @property {string} frecuencia - Días de recolección (ej: "Lun-Mie-Vie")
 * @property {string} jornada - Horario (Día/Noche/Mañana-Noche)
 * @property {string} localidad - Nombre de la localidad
 * @property {string} fuente - Origen del dato
 * @property {string} fecha_dato - Fecha de actualización
 */

/**
 * @typedef {Object} Ventana
 * @property {string} dia - Día de la semana
 * @property {string} hora_ini - Hora de inicio
 * @property {string} hora_fin - Hora de fin
 * @property {string} tipo - ordinarios|reciclables
 */

/**
 * @typedef {Object} Horarios
 * @property {Ventana[]} ventanas - Lista de ventanas horarias
 * @property {string} confianza - oficial|estimada
 * @property {string} fuente - Origen de los datos
 * @property {string} actualizado - Timestamp ISO
 */

/**
 * @typedef {Object} SitioAprovechamiento
 * @property {string} id - Identificador único
 * @property {string} nombre - Nombre del sitio
 * @property {string[]} materiales - Lista de materiales aceptados
 * @property {string} horario - Horario de atención
 * @property {number} lat - Latitud
 * @property {number} lng - Longitud
 * @property {string} direccion - Dirección física
 * @property {string} localidad - Localidad
 * @property {string} tipo - ECA|Planta|Punto Verde
 * @property {string} fuente - Origen del dato
 * @property {number} [dist_km] - Distancia calculada
 */

export const OPERADORES_MAP = {
  'CHAPINERO': 'Area_Limpia',
  'SANTA FE': 'Area_Limpia',
  'CANDELARIA': 'Area_Limpia',
  'SAN CRISTOBAL': 'Area_Limpia',
  'SUMAPAZ': 'Area_Limpia',
  'CIUDAD BOLIVAR': 'ciudad_limpia',
  'BOSA': 'ciudad_limpia',
  'TUNJUELITO': 'ciudad_limpia',
  'ANTONIO NARIÑO': 'ciudad_limpia',
  'PUENTE ARANDA': 'ciudad_limpia',
  'LOS MÁRTIRES': 'ciudad_limpia',
  'TEUSAQUILLO': 'ciudad_limpia',
  'RAFAEL URIBE URIBE': 'ciudad_limpia',
  'KENNEDY': 'Lime',
  'FONTIBÓN': 'Lime',
  'ENGATIVÁ': 'bogota_limpia',
  'BARRIOS UNIDOS': 'bogota_limpia',
  'SUBA': 'pro_ambiental'
}

export const MATERIALES_TIPS = {
  papel: 'Limpio y seco. Incluye: periódicos, revistas, cajas de cartón.',
  plastico: 'Enjuagado sin residuos. PET, PEAD, PP. Retire tapas.',
  vidrio: 'Limpio, sin tapas metálicas. Separe por color si es posible.',
  metal: 'Latas de aluminio y acero. Aplastar para ahorrar espacio.',
  organico: 'Restos de comida, cáscaras, restos de jardín. Compostable.',
  RAEE: 'Aparatos eléctricos y electrónicos. Llevar a puntos especializados.'
}
