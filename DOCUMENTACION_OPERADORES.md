# 📋 Documentación - Sección de Operadores

**Fecha:** 2025-01-27  
**Versión:** 1.1.0

---

## 🎯 Mejoras Implementadas

### **Componente OperatorGallery Actualizado**

Se ha mejorado completamente la sección de operadores para mostrar:

1. ✅ **Mapas completos de cada operador** (no solo logos)
2. ✅ **Información detallada de frecuencias y jornadas** por localidad
3. ✅ **Sistema de tabs** para alternar entre mapa y frecuencias
4. ✅ **Vista previa mejorada** de cada operador
5. ✅ **Información basada en los mapas oficiales** de UAESP

---

## 📊 Información de Operadores

### **1. Área Limpia** (Area_Limpia.png)

**Localidades:**
- CHAPINERO
- SANTA FE
- SAN CRISTÓBAL
- LA CANDELARIA
- SUMAPAZ
- USAQUÉN

**Frecuencias principales:**
- Lun - Mie - Vie (Lunes, Miércoles, Viernes)
- Mar - Jue - Sab (Martes, Jueves, Sábado)
- Lun a Dom (Lunes a Domingo) - Solo en algunas zonas
- 1 VEZ CADA 15 (Sumapaz)

**Jornadas:**
- Día
- Noche
- Día - Noche (combinado)

---

### **2. Ciudad Limpia** (ciudad_limpia.png)

**Localidades:**
- CIUDAD BOLÍVAR
- BOSA
- TUNJUELITO
- ANTONIO NARIÑO
- PUENTE ARANDA
- LOS MÁRTIRES
- TEUSAQUILLO
- RAFAEL URIBE URIBE

**Frecuencias principales:**
- Lun - Mie - Vie
- Mar - Jue - Sab
- Jue - Sab (Jueves, Sábado)
- Lun a Dom

**Jornadas:**
- Día
- Noche
- Mañana
- Mañana - Tarde - Noche

---

### **3. LIME** (Lime.png)

**Localidades:**
- KENNEDY
- FONTIBÓN

**Frecuencias principales:**
- Lun - Mie - Vie
- Mar - Jue - Sab
- Lun a Sab (Lunes a Sábado)

**Jornadas:**
- Día
- Noche
- Tarde

**Nota:** Kennedy tiene la mayor variedad de frecuencias y jornadas.

---

### **4. Bogotá Limpia** (bogota_limpia.png)

**Localidades:**
- ENGATIVÁ
- BARRIOS UNIDOS

**Frecuencias principales:**
- Lun a Sab (Lunes a Sábado)
- Mar - Jue - Sab

**Jornadas:**
- Día
- Noche

---

### **5. Promoambiental** (pro_ambiental.png)

**Localidades:**
- SUBA

**Frecuencias principales:**
- Lun - Mie - Vie
- Mar - Jue - Sab

**Jornadas:**
- Día
- Noche

---

## 🎨 Características del Componente

### **Vista de Tarjetas**
- Grid responsive (1 columna móvil, 2 tablet, 3 desktop)
- Vista previa de localidades
- Botón para ver detalles completos
- Colores distintivos por operador

### **Panel de Detalles**
- **Tab Mapa:** Muestra el mapa completo de cobertura del operador
- **Tab Frecuencias:** Tabla detallada con todas las frecuencias y jornadas por localidad
- Leyenda de colores del mapa
- Información descriptiva del operador

### **Interactividad**
- Click en tarjeta para ver detalles
- Tabs para alternar entre mapa y frecuencias
- Botón para cerrar panel de detalles
- Hover effects y transiciones suaves

---

## 📁 Archivos Modificados

1. **`src/components/OperatorGallery.jsx`**
   - Componente completamente reescrito
   - Sistema de tabs implementado
   - Información detallada de frecuencias
   - Visualización de mapas completos

2. **`scripts/copy-data.js`**
   - Actualizado para copiar imágenes de mapas
   - Copia automática de todos los PNG en assets/maps

---

## 🗺️ Estructura de Mapas

Los mapas muestran:
- **Zonas de recolección** coloreadas según frecuencia
- **Localidades** etiquetadas
- **Leyenda** de colores (convenciones)
- **Contexto geográfico** de Bogotá

### **Convenciones de Colores (Leyenda)**

Según los mapas analizados:
- **Azul oscuro:** Lun - Mie - Vie
- **Verde:** Mar - Jue - Sab
- **Amarillo/Naranja:** Lun a Sab
- **Púrpura:** Lun a Dom
- **Rojo:** Jue - Sab (en algunos casos)

---

## ✅ Validación

- ✅ Todas las imágenes están en `public/maps/`
- ✅ Rutas correctas en el componente
- ✅ Información de frecuencias basada en mapas oficiales
- ✅ Componente responsive y accesible
- ✅ Manejo de errores para imágenes faltantes

---

## 🚀 Uso

1. **Navegar a la sección "Operadores"** desde el menú principal
2. **Ver tarjetas** de cada operador con vista previa
3. **Click en tarjeta o botón** para ver detalles completos
4. **Alternar entre tabs** para ver mapa o frecuencias
5. **Cerrar panel** con botón X

---

## 📝 Notas Técnicas

- Las imágenes se sirven desde `/maps/` (public/maps)
- Los mapas son PNG de alta resolución
- La información de frecuencias está hardcodeada basada en los mapas oficiales
- El componente es completamente funcional y no requiere datos externos adicionales

---

**Versión:** 1.1.0  
**Fecha:** 2025-01-27

