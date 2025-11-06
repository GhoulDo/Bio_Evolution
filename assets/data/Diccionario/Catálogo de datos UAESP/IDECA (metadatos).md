# Diccionario / Catálogo de datos UAESP — IDECA (Metadatos

## Dataset 1: Macrorutas de Recolección

### 1. Encabezado del conjunto de datos
- Identificador: `macrobarr-uaesp-2021`
- Título: Macrorutas de Recolección de Residuos - Bogotá
- Resumen: Polígonos que definen zonas de recolección con operador asignado, frecuencia y jornada
- Responsable: UAESP - Unidad Administrativa Especial de Servicios Públicos
- Contacto: datos.abiertos@uaesp.gov.co
- Versión: v1.0
- Fecha de creación / actualización: 2021-11-30
- Licencia: CC BY 4.0
- Cobertura espacial: Bogotá D.C.
- Cobertura temporal: Vigente desde 2021
- Palabras clave: recolección, residuos, aseo, operadores, frecuencia, zonificación

### 2. Propósito y alcance
- Objetivo del dataset: Informar a ciudadanos sobre zonas de recolección, operadores responsables y frecuencias de paso
- Usuarios esperados: Ciudadanía, desarrolladores, UAESP, operadores de aseo
- Limitaciones y supuestos: Frecuencias pueden cambiar según necesidades operativas

### 3. Estructura de los datos (formato físico)
- Formatos disponibles: GeoJSON
- Codificación de caracteres: UTF-8
- Proyección: EPSG:4326 (WGS84)

### 4. Metadatos por campo

| Nombre campo | Etiqueta / título | Descripción | Tipo de dato | Formato / patrón | Longitud | Valores permitidos / dominio | Obligatorio | Fuente | Ejemplo | Notas |
|---|---|---|---|---|---|---|---|---|---|---|
| geometry | Geometría | Polígono de la zona de recolección | geometry | GeoJSON Polygon | N/A | Coordenadas válidas | Sí | IDECA/UAESP | {"type":"Polygon","coordinates":[...]} | EPSG:4326 |
| LOCALIDAD | Localidad | Nombre de la localidad | string | N/A | 50 | 20 localidades Bogotá | Sí | UAESP | CHAPINERO | - |
| FRECUENCIA | Frecuencia | Días de recolección | string | Patrón día-semana | 20 | Combinación Lun-Dom | Sí | UAESP | Mar - Jue - Sab | Separado por guiones |
| JORNADA | Jornada | Horario de recolección | string | N/A | 20 | Día, Noche, Mañana-Noche | Sí | UAESP | Día | Referencial |
| operador | Operador | Empresa de aseo responsable | string | N/A | 50 | 5 operadores activos | Condicional | UAESP | Promoambiental | Derivado de LOCALIDAD |

### 5. Calidad y validación
- Reglas de validación: geometrías válidas, sin superposición de polígonos, localidades existentes
- Índices de calidad: Completitud 100%, consistencia geográfica validada
- Procedimiento: Revisión cartográfica IDECA
---

## Dataset 2: Sitios de Aprovechamiento de Residuos

### 1. Encabezado del conjunto de datos
- Identificador: `sitios-aprovechamiento-uaesp-2024`
- Título: Estaciones de Clasificación y Aprovechamiento (ECA)
- Resumen: Ubicación de plantas de reciclaje, ECA y puntos de aprovechamiento con materiales aceptados
- Responsable: UAESP
- Contacto: datos.abiertos@uaesp.gov.co
- Versión: v2.0
- Fecha de actualización: 2024-01-15
- Licencia: CC BY 4.0
- Cobertura espacial: Bogotá D.C. y área metropolitana
- Palabras clave: reciclaje, aprovechamiento, ECA, materiales, economía circular

### 2. Propósito y alcance
- Objetivo del dataset: Facilitar el acceso ciudadano a puntos de reciclaje
- Usuarios esperados: Ciudadanía, recicladores, empresas
- Limitaciones: Horarios pueden variar, verificar antes de visitar

### 3. Estructura de los datos
- Formatos disponibles: GeoJSON
- Codificación: UTF-8
- Proyección: EPSG:4326

### 4. Metadatos por campo

| Nombre campo | Etiqueta / título | Descripción | Tipo de dato | Formato / patrón | Longitud | Valores permitidos | Obligatorio | Fuente | Ejemplo | Notas |
|---|---|---|---|---|---|---|---|---|---|---|
| geometry | Geometría | Punto del sitio | geometry | GeoJSON Point | N/A | Coordenadas válidas | Sí | GPS/UAESP | {"type":"Point","coordinates":[-74.05,4.66]} | EPSG:4326 |
| nombre | Nombre | Denominación del sitio | string | N/A | 100 | N/A | Sí | UAESP | ECA Kennedy | - |
| direccion | Dirección | Ubicación física | string | N/A | 150 | N/A | Sí | Catastro | Calle 1 # 2-3 | - |
| localidad | Localidad | Localidad de ubicación | string | N/A | 50 | 20 localidades | Sí | UAESP | KENNEDY | - |
| materiales | Materiales aceptados | Lista de residuos aprovechables | array/string | JSON array | N/A | papel,plástico,vidrio,metal,orgánico,RAEE | Sí | UAESP | ["papel","plástico"] | - |
| horario | Horario | Días y horas de atención | string | N/A | 100 | N/A | No | UAESP | Lun-Vie 8:00-16:00 | Puede variar |
| tipo | Tipo de sitio | Clasificación | string | N/A | 50 | ECA,Planta,Punto Verde | Sí | UAESP | ECA | - |
| telefono | Teléfono | Contacto | string | N/A | 20 | N/A | No | UAESP | 601 123 4567 | - |

### 6. Gestión y mantenimiento
- Frecuencia de actualización: Trimestral
- Responsable: Equipo de datos UAESP
- Historial de cambios:
  - 2024-01-15: Actualización de horarios y materiales
  - 2023-06-01: Adición de nuevos sitios zona sur

### 7. Acceso y uso
- Ruta local: `/assets/data/sitio_aprovechamiento_residuos.geojson`
- Ruta macrorutas: `/assets/data/macrobarr.geojson`
- API (fase 2): `/api/aprovechamiento?bbox=...&material=...`
- Restricciones: Atribución requerida

### 8. Anexos

**Glosario:**
- ECA: Estación de Clasificación y Aprovechamiento
- RAEE: Residuos de Aparatos Eléctricos y Electrónicos
- Macroruta: Zona definida para prestación del servicio de aseo

**Operadores vigentes:**
1. Promoambiental → `pro_ambiental.png`
2. LIME → `Lime.png`
3. Área Limpia → `Area_Limpia.png`
4. Bogotá Limpia → `bogota_limpia.png`
5. Ciudad Limpia → `ciudad_limpia.png`

**Mapeo Localidad → Operador:**
- CHAPINERO, SANTA FE, CANDELARIA, SAN CRISTOBAL, SUMAPAZ → Área Limpia
- CIUDAD BOLIVAR, BOSA, TUNJUELITO, ANTONIO NARIÑO, PUENTE ARANDA, LOS MÁRTIRES, TEUSAQUILLO, RAFAEL URIBE URIBE → Ciudad Limpia
- KENNEDY, FONTIBÓN → LIME
- ENGATIVÁ, BARRIOS UNIDOS → Bogotá Limpia
- SUBA → Promoambiental

**Instrucciones de uso para desarrollo:**
1. Cargar GeoJSON desde `/assets/data/` usando fetch
2. Usar `turf.booleanPointInPolygon()` para determinar zona del usuario
3. Filtrar sitios con `turf.distance()` radio < 1-2 km
4. Mapear operador a logo en `/assets/maps/{operador}.png`