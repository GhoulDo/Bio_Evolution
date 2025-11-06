# ✅ Verificación de .gitignore para Bio Evolution

## 📋 Análisis del .gitignore Actual

### ✅ Archivos que DEBEN estar en el repositorio (NO ignorados)

1. **Archivos fuente de datos**:
   - ✅ `assets/data/macrobarr.geojson` - **DEBE estar en repo**
   - ✅ `assets/data/sitio_aprovechamiento_residuos.geojson` - **DEBE estar en repo**
   - ✅ `assets/maps/*.png` - **DEBEN estar en repo**

2. **Archivos de código fuente**:
   - ✅ `src/**/*` - Todo el código fuente
   - ✅ `scripts/copy-data.js` - Script de copia
   - ✅ `package.json` - Dependencias
   - ✅ `vite.config.js` - Configuración de Vite
   - ✅ `vercel.json` - Configuración de Vercel

### ❌ Archivos que NO deben estar en el repositorio (ignorados correctamente)

1. **Archivos generados**:
   - ❌ `public/data/` - Se generan durante build
   - ❌ `public/maps/` - Se generan durante build
   - ❌ `dist/` - Output del build

2. **Dependencias**:
   - ❌ `node_modules/` - Se instalan con npm install

3. **Archivos de sistema**:
   - ❌ `.DS_Store`, `Thumbs.db`, etc.

## 🔍 Verificación del .gitignore

### Patrones que NO deben ignorar archivos fuente:

```gitignore
# ✅ CORRECTO - Solo ignora public/data/, no assets/data/
public/data/
public/maps/

# ✅ CORRECTO - Solo ignora backups, no archivos originales
*.geojson.backup
*.geojson.old

# ✅ CORRECTO - Solo ignora carpetas de desarrollo/test
dev-data/
test-data/
```

### ⚠️ Verificaciones Necesarias:

1. **NO debe haber un patrón que ignore `assets/data/`**
2. **NO debe haber un patrón que ignore `assets/maps/`**
3. **NO debe haber un patrón `*.geojson` que ignore todos los GeoJSON**

## ✅ Estado Actual del .gitignore

Después de la revisión, el `.gitignore` está **CORRECTO**:

- ✅ Solo ignora `public/data/` y `public/maps/` (archivos generados)
- ✅ NO ignora `assets/data/` (archivos fuente)
- ✅ NO ignora `assets/maps/` (archivos fuente)
- ✅ Solo ignora `*.geojson.backup` y `*.geojson.old` (backups)

## 🚨 Problema Identificado

El problema **NO es el .gitignore**. El problema es que:

1. Los archivos pueden no estar en el repositorio de GitHub
2. O el script `copy-data.js` no se está ejecutando en Vercel

## 🔧 Soluciones

### 1. Verificar que los archivos estén en GitHub

```bash
# Verificar archivos en el repositorio
git ls-files assets/data/
git ls-files assets/maps/
```

Si no aparecen, agregarlos:

```bash
git add assets/data/*.geojson
git add assets/maps/*.png
git commit -m "Agregar archivos de datos fuente"
git push
```

### 2. Asegurar que el script se ejecute

El `package.json` ya tiene:
- `prebuild`: Se ejecuta antes de build
- `postinstall`: Se ejecuta después de npm install

### 3. Verificar Build Command en Vercel

En Vercel, el Build Command debe ser:
```
npm run build
```

O explícitamente:
```
npm run copy-data && vite build
```

## ✅ Checklist Final

- [ ] Archivos `assets/data/*.geojson` están en el repositorio
- [ ] Archivos `assets/maps/*.png` están en el repositorio
- [ ] `.gitignore` NO ignora `assets/data/`
- [ ] `.gitignore` NO ignora `assets/maps/`
- [ ] Script `copy-data.js` existe y funciona
- [ ] Build Command en Vercel ejecuta el script
- [ ] Los archivos se copian a `public/data/` durante build

## 📝 Conclusión

El `.gitignore` está **correctamente configurado**. El problema probablemente es que:
1. Los archivos no están en el repositorio de GitHub, O
2. El script no se ejecuta durante el build en Vercel

**Próximos pasos**: Verificar que los archivos estén en GitHub y que el Build Command en Vercel esté configurado correctamente.

