# 🔧 Instrucciones para Solucionar Error 404 en Vercel

## ❌ Problema

Los archivos GeoJSON no se cargan en producción (error 404):
```
Failed to load resource: /data/macrobarr.geojson (404)
Failed to load resource: /data/sitio_aprovechamiento_residuos.geojson (404)
```

## ✅ Solución Completa

### Paso 1: Verificar que los archivos estén en el repositorio

**IMPORTANTE**: Los archivos deben estar en GitHub para que Vercel pueda acceder a ellos.

```bash
# 1. Verificar que los archivos existan localmente
ls assets/data/*.geojson
ls assets/maps/*.png

# 2. Verificar que estén en el repositorio
git status assets/data/ assets/maps/

# 3. Si NO están en el repositorio, agregarlos:
git add assets/data/*.geojson
git add assets/maps/*.png
git commit -m "Agregar archivos de datos fuente al repositorio"
git push
```

### Paso 2: Verificar .gitignore

El `.gitignore` está **correctamente configurado**:
- ✅ Solo ignora `public/data/` (archivos generados)
- ✅ Solo ignora `public/maps/` (archivos generados)
- ✅ NO ignora `assets/data/` (archivos fuente - DEBEN estar en repo)
- ✅ NO ignora `assets/maps/` (archivos fuente - DEBEN estar en repo)

### Paso 3: Configurar Vercel Correctamente

#### Opción A: Desde la interfaz web (RECOMENDADO)

1. Ve a tu proyecto en Vercel
2. **Settings** → **General** → **Build & Development Settings**
3. Configura:
   - **Build Command**: `npm run copy-data && vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: `18.x` (o déjalo en Auto)

4. **Guarda los cambios**

#### Opción B: Usar vercel.json (ya configurado)

El archivo `vercel.json` ya está configurado, pero Vercel puede ignorarlo si configuras manualmente en la interfaz.

### Paso 4: Verificar package.json

El `package.json` ya tiene los scripts necesarios:
```json
{
  "scripts": {
    "copy-data": "node scripts/copy-data.js",
    "build": "npm run copy-data && vite build",
    "prebuild": "npm run copy-data",
    "postinstall": "npm run copy-data"
  }
}
```

### Paso 5: Hacer un nuevo deploy

```bash
# Hacer un commit vacío para trigger un nuevo deploy
git commit --allow-empty -m "Trigger redeploy para probar fix"
git push
```

O desde Vercel:
- Ve a **Deployments**
- Click en **"..."** del último deploy
- Selecciona **"Redeploy"**

### Paso 6: Verificar logs de build

En Vercel:
1. Ve a **Deployments** → [Último deploy] → **Build Logs**
2. Busca estas líneas:
   ```
   📁 Directorio raíz: ...
   📊 Copiando archivos de datos...
   ✅ Copiado: macrobarr.geojson (XXXX KB)
   ✅ Copiado: sitio_aprovechamiento_residuos.geojson (XXXX KB)
   🗺️ Copiando imágenes de mapas...
   ✅ Copiado: Area_Limpia.png (XXXX KB)
   ...
   ✅ Proceso completado
   ```

Si NO ves estos mensajes, el script no se está ejecutando.

### Paso 7: Verificar archivos en producción

Después del deploy, verifica que los archivos sean accesibles:

```
https://tu-proyecto.vercel.app/data/macrobarr.geojson
https://tu-proyecto.vercel.app/data/sitio_aprovechamiento_residuos.geojson
https://tu-proyecto.vercel.app/maps/Area_Limpia.png
```

## 🔍 Troubleshooting

### Problema: Script no se ejecuta

**Solución**: Asegúrate de que el Build Command en Vercel sea:
```
npm run copy-data && vite build
```

### Problema: Archivos no están en el repositorio

**Solución**: 
```bash
# Verificar
git ls-files assets/data/

# Si no aparecen, agregarlos
git add assets/data/*.geojson assets/maps/*.png
git commit -m "Agregar archivos de datos"
git push
```

### Problema: Error "No existe: assets/data/macrobarr.geojson"

**Causa**: Los archivos no están en el repositorio de GitHub, por lo que Vercel no los tiene durante el build.

**Solución**: Asegúrate de hacer push de los archivos:
```bash
git add assets/
git commit -m "Agregar todos los archivos de assets"
git push
```

### Problema: Build funciona pero archivos siguen dando 404

**Causa**: Los archivos se copian pero Vite no los incluye en el build.

**Solución**: Verifica que `vite.config.js` tenga:
```javascript
publicDir: 'public',
```

Y que los archivos estén en `public/data/` después de ejecutar `copy-data.js`.

## ✅ Checklist Final

Antes de hacer deploy, verifica:

- [ ] Archivos `assets/data/*.geojson` existen localmente
- [ ] Archivos `assets/maps/*.png` existen localmente
- [ ] Archivos están en el repositorio de GitHub (verificar con `git ls-files`)
- [ ] `.gitignore` NO ignora `assets/data/` ni `assets/maps/`
- [ ] Script `copy-data.js` existe y funciona localmente
- [ ] `package.json` tiene scripts `copy-data` y `prebuild`
- [ ] Build Command en Vercel es: `npm run copy-data && vite build`
- [ ] `vite.config.js` tiene `publicDir: 'public'`

## 🚀 Comandos Rápidos

```bash
# 1. Verificar archivos locales
ls assets/data/*.geojson
ls assets/maps/*.png

# 2. Verificar que estén en git
git status assets/

# 3. Agregar si faltan
git add assets/data/*.geojson assets/maps/*.png

# 4. Commit y push
git commit -m "Asegurar archivos de datos en repositorio"
git push

# 5. Verificar build local
npm run build
ls dist/data/
ls dist/maps/
```

## 📝 Nota Importante

El `.gitignore` está **correctamente configurado**. El problema es que:
1. Los archivos pueden no estar en el repositorio de GitHub, O
2. El Build Command en Vercel no está ejecutando el script

**Solución**: Asegúrate de que los archivos estén en GitHub y que el Build Command ejecute `npm run copy-data && vite build`.

