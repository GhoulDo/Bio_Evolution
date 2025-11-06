# 📚 Documentación Técnica - Bio Evolution

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
3. [Gestión de Datos](#gestión-de-datos)
4. [Componentes y Funcionalidades](#componentes-y-funcionalidades)
5. [Flujos de Datos](#flujos-de-datos)
6. [Tecnologías Utilizadas](#tecnologías-utilizadas)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [APIs y Servicios Externos](#apis-y-servicios-externos)

---

## 🎯 Visión General

**Bio Evolution** es una aplicación web desarrollada en React que ayuda a los ciudadanos de Bogotá, Colombia, a:

- 📅 **Conocer los días y horarios** de recolección de residuos en su zona
- 🗺️ **Encontrar sitios de reciclaje** cercanos a su ubicación
- ♻️ **Aprender sobre separación correcta** de residuos
- 🚛 **Identificar el operador de aseo** responsable de su localidad
- 🎮 **Educarse mediante juegos interactivos** sobre reciclaje

### Características Principales

- ✅ Búsqueda de direcciones con geocodificación
- ✅ Geolocalización GPS
- ✅ Visualización interactiva de mapas
- ✅ Información detallada de operadores
- ✅ Sitios de reciclaje cercanos con filtros
- ✅ Juego educativo de clasificación
- ✅ Guía de separación de materiales
- ✅ Diseño responsive y moderno

---

## 🏗️ Arquitectura de la Aplicación

### Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.2.0 | Framework frontend |
| **Vite** | 5.0.8 | Build tool y dev server |
| **Zustand** | 4.4.7 | Gestión de estado global |
| **React Query** | 5.17.0 | Gestión de datos asíncronos y caché |
| **Leaflet** | 1.9.4 | Mapas interactivos |
| **Turf.js** | 6.5.0 | Operaciones geoespaciales |
| **Proj4** | 2.19.10 | Transformación de coordenadas |
| **Tailwind CSS** | 3.4.1 | Framework CSS utility-first |

### Patrón de Arquitectura

La aplicación sigue una arquitectura basada en componentes React con:

- **Separación de responsabilidades**: Componentes, hooks, utils, store
- **Estado global centralizado**: Zustand store
- **Gestión de datos asíncronos**: React Query
- **Hooks personalizados**: Lógica reutilizable
- **Utilidades modulares**: Funciones puras y helpers

---

## 📊 Gestión de Datos

### 1. Fuentes de Datos

#### **Datos Geoespaciales (GeoJSON)**

**macrobarr.geojson**
- **Descripción**: Zonas de recolección de residuos (macrorutas)
- **Formato**: GeoJSON FeatureCollection
- **Sistema de coordenadas**: Originalmente EPSG:3857, transformado a WGS84 (EPSG:4326)
- **Características**:
  - 119 polígonos (features)
  - Propiedades: LOCALIDAD, FRECUENCIA, JORNADA
  - Tamaño optimizado: ~33MB (reducido de 69MB)
- **Fuente**: UAESP/IDECA
- **Fecha**: 2021-11-30

**sitio_aprovechamiento_residuos.geojson**
- **Descripción**: Puntos de reciclaje y aprovechamiento
- **Formato**: GeoJSON FeatureCollection
- **Sistema de coordenadas**: WGS84 (EPSG:4326)
- **Características**:
  - 7 puntos (features)
  - Propiedades: nombre, dirección, localidad, materiales aceptados, horario
- **Fuente**: UAESP/IDECA
- **Fecha**: 2021-11-30

### 2. Procesamiento de Datos

#### **Carga y Transformación** (`src/utils/dataLoader.js`)

**Flujo de Procesamiento**:

```javascript
1. Carga de GeoJSON
   ↓
2. Detección de sistema de coordenadas
   ↓
3. Transformación a WGS84 (si es necesario)
   ↓
4. Validación de estructura
   ↓
5. Pre-procesamiento de propiedades
   ↓
6. Almacenamiento en store
```

**Funciones Principales**:

- `loadGeoJSON(filename)`: Carga archivo GeoJSON desde `/public/data/`
- `detectProjection(geojson)`: Detecta sistema de coordenadas (EPSG:3857, EPSG:4326, EPSG:9377)
- `transformGeometry(geometry, sourceProj, targetProj)`: Transforma coordenadas usando Proj4
- `preprocessMacrorutas(geojson)`: 
  - Normaliza nombres de localidades
  - Asigna operadores según localidad
  - Normaliza frecuencias y jornadas
  - Marca datos como procesados (`_processed: true`)
- `preprocessSitios(geojson)`:
  - Normaliza nombres de materiales
  - Crea arrays de materiales
  - Valida coordenadas
  - Calcula distancias

**Optimizaciones Implementadas**:

- ✅ Detección de datos ya procesados (evita re-procesamiento)
- ✅ Transformación de coordenadas solo cuando es necesario
- ✅ Simplificación de geometrías para reducir tamaño
- ✅ Índice espacial (R-tree) para búsquedas rápidas

### 3. Almacenamiento de Datos

#### **Estado Global (Zustand Store)**

**Archivo**: `src/store/useAppStore.js`

```javascript
Estado:
- macrorutas: GeoJSON de zonas de recolección
- sitiosAprovechamiento: GeoJSON de sitios de reciclaje
- userLocation: { lat, lng, address } - Ubicación del usuario
- userZona: { localidad, frecuencia, jornada, operador, ... } - Zona encontrada
- selectedSitio: Sitio de reciclaje seleccionado
- activeLayers: { macrorutas: boolean, sitios: boolean } - Capas visibles

Acciones:
- setMacrorutas(data)
- setSitiosAprovechamiento(data)
- setUserLocation(location)
- setUserZona(zona)
- setSelectedSitio(sitio)
- toggleLayer(layerName)
- resetUser()
```

#### **Caché de React Query**

**Configuración**:
- `staleTime`: 1 hora (macrorutas), 30 minutos (sitios)
- `gcTime`: 24 horas (macrorutas), 12 horas (sitios)
- `retry`: 2 intentos
- `refetchOnWindowFocus`: false

**Beneficios**:
- Evita recargas innecesarias
- Mejora rendimiento
- Reduce llamadas al servidor

### 4. Transformación de Coordenadas

#### **Sistemas de Coordenadas Soportados**

1. **EPSG:4326 (WGS84)**: Sistema geográfico estándar (lat/lng)
2. **EPSG:3857 (Web Mercator)**: Proyección web estándar
3. **EPSG:9377**: Sistema local de Bogotá

**Implementación**: `src/utils/coordinateTransform.js`

- Usa Proj4 para transformaciones
- Detecta automáticamente el sistema de origen
- Normaliza a WGS84 para uso en Leaflet

---

## 🧩 Componentes y Funcionalidades

### Componentes Principales

#### 1. **App.jsx** - Componente Raíz

**Responsabilidades**:
- Configuración de React Query Provider
- Gestión de vistas (mapa, operadores, educación)
- Pantallas de carga y error
- Layout principal responsive

**Vistas**:
- `mapa`: Vista principal con mapa y paneles
- `operadores`: Galería de operadores de aseo
- `educacion`: Juego educativo y guía de separación

#### 2. **AppHeader.jsx** - Encabezado

**Funcionalidades**:
- Logo y título de la aplicación
- Información de UAESP/IDECA
- Navegación entre vistas (tabs)
- Diseño responsive con efectos visuales

**Características**:
- Sticky header (fijo al hacer scroll)
- Efectos de glassmorphism
- Animaciones en botones activos
- Badge "PRO" para branding

#### 3. **MapView.jsx** - Mapa Interactivo

**Funcionalidades**:
- Inicialización de mapa Leaflet
- Renderizado de polígonos de macrorutas
- Marcadores de sitios de reciclaje
- Marcador de ubicación del usuario
- Leyenda interactiva (colapsable)
- Popups y tooltips informativos

**Características Técnicas**:
- `preferCanvas: true` para mejor rendimiento
- Estilos personalizados por operador
- Efectos hover con cambio de opacidad
- Zoom y pan automáticos
- Bounds ajustados al contenido

**Capas**:
- **Macrorutas**: Polígonos coloreados por operador (opacidad 0.08)
- **Sitios**: Marcadores verdes con iconos
- **Usuario**: Marcador rojo personalizado

#### 4. **SearchBar.jsx** - Búsqueda de Direcciones

**Funcionalidades**:
- Input de búsqueda con autocompletado
- Botón de geolocalización GPS
- Dropdown de resultados
- Validación de ubicación en Bogotá

**Tecnología**:
- API de Nominatim (OpenStreetMap)
- Debounce de 500ms para optimizar requests
- Filtrado por bounding box de Bogotá
- Manejo de errores de geocodificación

**Flujo**:
```
Usuario escribe → Debounce → Llamada API → Filtrado → Resultados → Selección → Actualización de ubicación
```

#### 5. **InfoPanel.jsx** - Panel de Información

**Funcionalidades**:
- Dashboard de recolección con estadísticas
- Información del operador asignado
- Localidad y zona de recolección
- Días de recolección (badges)
- Jornada de servicio
- Horarios estimados generados
- Guía de separación de materiales
- Información de sitio seleccionado

**Características**:
- Diseño tipo dashboard profesional
- Cards con gradientes y efectos visuales
- Estadísticas rápidas (días, horarios)
- Interactividad con materiales
- Responsive design

#### 6. **SitiosList.jsx** - Lista de Sitios Cercanos

**Funcionalidades**:
- Lista de sitios de reciclaje cercanos (radio 2km)
- Filtro por material aceptado
- Información de distancia
- Click para seleccionar sitio
- Badges de materiales
- Indicador de tipo de sitio

**Características**:
- Ordenamiento por distancia
- Scroll interno para listas largas
- Efectos hover
- Información de horarios

#### 7. **OperatorGallery.jsx** - Galería de Operadores

**Funcionalidades**:
- Grid de tarjetas de operadores
- Panel de detalles arrastrable
- Visualización de mapas de cobertura
- Tabla de frecuencias por localidad
- Modal de imagen en pantalla completa
- Zoom y arrastre de imágenes

**Características Avanzadas**:
- Panel arrastrable (drag & drop)
- Modal con zoom (50% - 300%)
- Arrastre de imagen en modal
- Tabs para alternar entre mapa y frecuencias
- Diseño responsive

#### 8. **RecyclingGame.jsx** - Juego Educativo

**Funcionalidades**:
- Juego de clasificación de residuos
- Temporizador de 60 segundos
- Sistema de puntos y rachas
- Feedback inmediato
- Pantalla de resultados
- Estadísticas de juego

**Mecánica**:
- Muestra imagen/descripción de residuo
- 4 opciones de materiales
- Puntos por respuesta correcta
- Bonus por rachas
- Penalización por errores

#### 9. **EducationPanel.jsx** - Panel Educativo

**Funcionalidades**:
- Guía de materiales reciclables
- Información detallada por material
- Tips de reciclaje
- Código de colores
- Categorías de materiales

#### 10. **LayerToggle.jsx** - Control de Capas

**Funcionalidades**:
- Toggle para mostrar/ocultar macrorutas
- Toggle para mostrar/ocultar sitios
- Indicadores visuales de estado
- Diseño compacto

#### 11. **TipsNotification.jsx** - Notificaciones

**Funcionalidades**:
- Notificaciones automáticas con tips
- Rotación de mensajes educativos
- Auto-cierre después de tiempo
- Diseño no intrusivo

---

## 🔄 Flujos de Datos

### Flujo 1: Carga Inicial de Datos

```
App.jsx monta
    ↓
useGeoData() hook se ejecuta
    ↓
React Query hace fetch de macrobarr.geojson
    ↓
dataLoader.loadGeoJSON() carga archivo
    ↓
Detecta sistema de coordenadas
    ↓
Transforma a WGS84 (si es necesario)
    ↓
preprocessMacrorutas() procesa propiedades
    ↓
Almacena en Zustand store (setMacrorutas)
    ↓
Mismo proceso para sitios de aprovechamiento
    ↓
Datos listos para usar
```

### Flujo 2: Búsqueda de Dirección

```
Usuario escribe en SearchBar
    ↓
Debounce de 500ms
    ↓
useGeocoding() llama a Nominatim API
    ↓
Filtra resultados dentro de Bogotá
    ↓
Muestra resultados en dropdown
    ↓
Usuario selecciona resultado
    ↓
setUserLocation() actualiza store
    ↓
useZonificacion() detecta zona
    ↓
findZona() usa spatial index
    ↓
Punto-en-polígono con Turf.js
    ↓
setUserZona() actualiza store
    ↓
InfoPanel muestra información
    ↓
MapView actualiza marcador
```

### Flujo 3: Búsqueda de Sitios Cercanos

```
userLocation actualizado
    ↓
useSitiosCercanos() hook se ejecuta
    ↓
Calcula distancia a cada sitio (Turf.js)
    ↓
Filtra sitios dentro de 2km
    ↓
Ordena por distancia
    ↓
SitiosList renderiza lista
    ↓
Usuario puede filtrar por material
    ↓
Usuario selecciona sitio
    ↓
setSelectedSitio() actualiza store
    ↓
InfoPanel muestra detalles
    ↓
MapView resalta marcador
```

### Flujo 4: Visualización en Mapa

```
MapView se monta
    ↓
Inicializa Leaflet map
    ↓
Efecto detecta cambios en macrorutas
    ↓
Renderiza polígonos con estilos por operador
    ↓
Efecto detecta cambios en sitios
    ↓
Renderiza marcadores verdes
    ↓
Efecto detecta userLocation
    ↓
Renderiza marcador rojo del usuario
    ↓
Usuario interactúa (hover, click)
    ↓
Muestra popups/tooltips
    ↓
Actualiza estilos en hover
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend Framework

**React 18.2.0**
- Hooks personalizados
- Context API (implícito en React Query)
- Componentes funcionales
- Estado local y global

**Vite 5.0.8**
- Build tool rápido
- Hot Module Replacement (HMR)
- Optimización de assets
- Code splitting automático

### Gestión de Estado

**Zustand 4.4.7**
- Store global ligero
- Acciones simples
- Sin boilerplate
- Integración fácil con React

**React Query 5.17.0**
- Caché inteligente
- Revalidación automática
- Estados de carga/error
- Optimistic updates

### Mapas y Geografía

**Leaflet 1.9.4**
- Mapas interactivos
- Múltiples capas
- Popups y tooltips
- Controles personalizados

**react-leaflet 4.2.1**
- Wrapper React para Leaflet
- Componentes declarativos
- Integración con React lifecycle

**Turf.js 6.5.0**
- Operaciones geoespaciales
- Punto-en-polígono
- Cálculo de distancias
- Buffers y áreas

**Proj4 2.19.10**
- Transformación de coordenadas
- Soporte múltiples sistemas
- Precisión alta

### Estilos

**Tailwind CSS 3.4.1**
- Utility-first CSS
- Diseño responsive
- Personalización extensa
- Optimización de producción

**CSS Personalizado**
- Animaciones keyframes
- Efectos glassmorphism
- Utilidades custom
- Estilos para Leaflet

### Utilidades

**Spatial Index (R-tree)**
- Implementación propia
- Búsqueda rápida de polígonos
- Optimización de punto-en-polígono
- Reducción de complejidad O(n) a O(log n)

---

## 📁 Estructura del Proyecto

```
Aplicacion/
├── assets/                          # Recursos fuente
│   ├── data/                        # Datos GeoJSON originales
│   │   ├── macrobarr.geojson        # Zonas de recolección
│   │   ├── sitio_aprovechamiento_residuos.geojson
│   │   └── Diccionario/            # Metadatos
│   ├── images/                      # Imágenes (logos)
│   └── maps/                        # Mapas de operadores
│
├── public/                           # Archivos públicos
│   ├── data/                        # Datos copiados (por script)
│   ├── maps/                        # Mapas de operadores
│   └── images/                      # Imágenes públicas
│
├── src/                              # Código fuente
│   ├── components/                  # Componentes React
│   │   ├── AppHeader.jsx            # Header con navegación
│   │   ├── MapView.jsx              # Mapa interactivo
│   │   ├── SearchBar.jsx            # Búsqueda de direcciones
│   │   ├── InfoPanel.jsx            # Panel de información
│   │   ├── LayerToggle.jsx          # Control de capas
│   │   ├── SitiosList.jsx           # Lista de sitios
│   │   ├── OperatorGallery.jsx      # Galería de operadores
│   │   ├── EducationPanel.jsx       # Panel educativo
│   │   ├── RecyclingGame.jsx        # Juego educativo
│   │   └── TipsNotification.jsx     # Notificaciones
│   │
│   ├── hooks/                       # Custom hooks
│   │   ├── useGeoData.js            # Carga de datos geoespaciales
│   │   ├── useGeocoding.js          # Geocodificación (Nominatim)
│   │   ├── useZonificacion.js       # Determinación de zona
│   │   └── useSitiosCercanos.js     # Sitios cercanos
│   │
│   ├── store/                       # Estado global
│   │   └── useAppStore.js           # Store de Zustand
│   │
│   ├── utils/                       # Utilidades
│   │   ├── constants.js             # Constantes y configuraciones
│   │   ├── dataLoader.js            # Carga y transformación de datos
│   │   ├── geoUtils.js              # Utilidades geoespaciales
│   │   ├── coordinateTransform.js   # Transformación de coordenadas
│   │   └── spatialIndex.js          # Índice espacial (R-tree)
│   │
│   ├── App.jsx                      # Componente raíz
│   ├── main.jsx                     # Punto de entrada
│   ├── index.css                    # Estilos globales
│   └── App.css                      # Estilos de aplicación
│
├── scripts/                          # Scripts de utilidad
│   ├── copy-data.js                 # Copia datos a public/
│   └── analyze-teusaquillo.js       # Análisis de datos
│
├── dist/                             # Build de producción
├── node_modules/                     # Dependencias
├── package.json                      # Configuración del proyecto
├── vite.config.js                    # Configuración de Vite
├── tailwind.config.js                # Configuración de Tailwind
├── postcss.config.js                 # Configuración de PostCSS
└── README.md                         # Documentación principal
```

---

## 🔌 APIs y Servicios Externos

### 1. Nominatim (OpenStreetMap)

**Propósito**: Geocodificación (dirección → coordenadas)

**Endpoint**: `https://nominatim.openstreetmap.org/search`

**Uso**:
- Búsqueda de direcciones
- Reverse geocoding (coordenadas → dirección)
- Filtrado por bounding box de Bogotá

**Limitaciones**:
- Rate limiting (1 request/segundo recomendado)
- Uso de User-Agent requerido
- Política de uso justo

**Implementación**: `src/hooks/useGeocoding.js`

### 2. Datos Estáticos (GeoJSON)

**Fuente**: Archivos locales en `/public/data/`

**Archivos**:
- `macrobarr.geojson`: Zonas de recolección
- `sitio_aprovechamiento_residuos.geojson`: Sitios de reciclaje

**Carga**: Mediante `fetch()` en `dataLoader.js`

**Procesamiento**: Transformación y pre-procesamiento en cliente

---

## 📈 Optimizaciones Implementadas

### 1. Rendimiento

- ✅ **Spatial Index (R-tree)**: Búsqueda O(log n) en lugar de O(n)
- ✅ **Detección de datos procesados**: Evita re-procesamiento
- ✅ **Caché de React Query**: Reduce recargas innecesarias
- ✅ **Lazy loading**: Componentes cargados bajo demanda
- ✅ **Debounce en búsqueda**: Reduce llamadas API
- ✅ **Canvas rendering**: Mejor rendimiento en mapas grandes

### 2. Optimización de Datos

- ✅ **Simplificación de geometrías**: Reducción de 69MB a 33MB
- ✅ **Transformación única**: Datos transformados una vez
- ✅ **Marcado de procesamiento**: `_processed: true`
- ✅ **Validación temprana**: Detecta errores antes de procesar

### 3. UX/UI

- ✅ **Diseño responsive**: Adaptado a móviles, tablets, desktop
- ✅ **Animaciones suaves**: Transiciones y efectos visuales
- ✅ **Feedback inmediato**: Loading states, errores claros
- ✅ **Accesibilidad**: Contraste, navegación por teclado

---

## 🔒 Seguridad y Privacidad

### Datos del Usuario

- ✅ **Sin almacenamiento persistente**: Datos solo en memoria
- ✅ **Sin tracking**: No se envían datos a terceros
- ✅ **Geolocalización opcional**: Requiere permiso del usuario
- ✅ **Datos públicos**: Solo usa datos abiertos de UAESP/IDECA

### APIs Externas

- ✅ **Rate limiting**: Respeta límites de Nominatim
- ✅ **User-Agent**: Identifica aplicación correctamente
- ✅ **Error handling**: Manejo robusto de errores

---

## 📝 Notas de Desarrollo

### Convenciones de Código

- **Componentes**: PascalCase (ej: `MapView.jsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useGeoData.js`)
- **Utilidades**: camelCase (ej: `dataLoader.js`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `OPERADORES_MAP`)

### Manejo de Errores

- Try-catch en operaciones críticas
- Logging en consola para debugging
- Mensajes de error amigables al usuario
- Fallbacks cuando es posible

### Testing

- Validación de datos en carga
- Verificación de coordenadas
- Pruebas de transformaciones
- Validación de GeoJSON

---

## 🚀 Próximas Mejoras Planificadas

Ver documento `SUGERENCIAS_MEJORAS.md` y `PLAN_IMPLEMENTACION_MEJORAS.md` para detalles completos.

**Prioridades**:
1. Sistema de recordatorios
2. Calculadora de impacto ambiental
3. API de residuos especiales
4. Sistema de logros y gamificación
5. PWA (Progressive Web App)

---

## 📞 Contacto y Soporte

**Desarrollado por**: Equipo Ghouldev

**Versión**: 1.0.0

**Última actualización**: 2025

---

**Nota**: Esta documentación se actualiza continuamente. Para la versión más reciente, consulta el repositorio del proyecto.

