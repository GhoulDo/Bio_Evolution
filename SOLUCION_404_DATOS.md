# 🔧 Solución: Error 404 en Archivos GeoJSON en Vercel

## ❌ Problema

Los archivos GeoJSON no se están cargando en producción (Vercel), mostrando error 404:
```
Failed to load resource: /data/macrobarr.geojson (404)
Failed to load resource: /data/sitio_aprovechamiento_residuos.geojson (404)
```

## 🔍 Causa

Los archivos no se están copiando desde `assets/data/` a `public/data/` durante el build en Vercel.

## ✅ Solución

### Paso 1: Verificar que los archivos estén en el repositorio

Asegúrate de que estos archivos estén **commiteados** en GitHub:

```bash
# Verificar archivos en assets/data/
assets/data/macrobarr.geojson
assets/data/sitio_aprovechamiento_residuos.geojson
assets/maps/*.png
```

### Paso 2: Verificar que el script se ejecute

El `package.json` ya tiene configurado:
- `prebuild`: Se ejecuta antes de `build`
- `postinstall`: Se ejecuta después de `npm install` (en Vercel)

### Paso 3: Forzar la copia en Vercel

Si el problema persiste, hay dos opciones:

#### Opción A: Actualizar configuración de Vercel (RECOMENDADO)

1. Ve a tu proyecto en Vercel
2. Settings → General → Build & Development Settings
3. **Build Command**: Cambia a:
   ```
   npm run copy-data && npm run build
   ```
4. **Install Command**: Deja `npm install` (el `postinstall` se ejecutará automáticamente)

#### Opción B: Asegurar que los archivos se copien manualmente

Agrega un script adicional en `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run copy-data && vite build"
  }
}
```

Y en Vercel, cambia el Build Command a: `npm run vercel-build`

### Paso 4: Verificar logs de build

En Vercel, ve a:
1. Deployments → [Último deploy] → Build Logs
2. Busca la línea que dice: `📊 Copiando archivos de datos...`
3. Verifica que aparezcan mensajes como:
   ```
   ✅ Copiado: macrobarr.geojson (XXXX KB)
   ✅ Copiado: sitio_aprovechamiento_residuos.geojson (XXXX KB)
   ```

## 🔧 Pasos Inmediatos

### 1. Verificar archivos en GitHub

Asegúrate de que estos archivos estén en tu repositorio:

```bash
# En tu terminal local
git status
git add assets/data/*.geojson
git add assets/maps/*.png
git commit -m "Asegurar archivos de datos en repositorio"
git push
```

### 2. Verificar .gitignore

Asegúrate de que `.gitignore` NO ignore los archivos fuente:

```gitignore
# ✅ CORRECTO - Solo ignorar los copiados, no los originales
public/data/    # Ignorar (se regeneran)
public/maps/    # Ignorar (se regeneran)

# ✅ Los archivos en assets/ NO deben estar ignorados
# assets/data/*.geojson  <- NO poner esto
```

### 3. Re-deploy en Vercel

Después de hacer push:
1. Vercel detectará el cambio automáticamente
2. Hará un nuevo deploy
3. Verifica los logs para ver si el script se ejecuta

### 4. Verificar archivos en el deploy

Después del deploy, verifica que los archivos estén disponibles:
- `https://tu-proyecto.vercel.app/data/macrobarr.geojson`
- `https://tu-proyecto.vercel.app/data/sitio_aprovechamiento_residuos.geojson`

## 🐛 Troubleshooting

### Si el script no se ejecuta:

1. **Verifica que el script existe**: `scripts/copy-data.js`
2. **Verifica permisos**: El script debe ser ejecutable
3. **Verifica Node.js version**: Vercel usa Node 18.x por defecto (debería funcionar)

### Si los archivos no se copian:

1. **Verifica rutas**: El script usa rutas relativas, debería funcionar
2. **Verifica que assets/data/ existe**: Debe estar en el repositorio
3. **Verifica logs**: Busca errores en los logs de build

### Si los archivos se copian pero no están disponibles:

1. **Verifica publicDir en vite.config.js**: Debe ser `"public"`
2. **Verifica que Vite copie public/**: Debería copiar automáticamente
3. **Verifica la URL**: Debe ser `/data/archivo.geojson` (no `/public/data/`)

## ✅ Checklist Final

- [ ] Archivos `*.geojson` están en `assets/data/` y commiteados
- [ ] Archivos `*.png` están en `assets/maps/` y commiteados
- [ ] `.gitignore` NO ignora `assets/data/` ni `assets/maps/`
- [ ] Script `copy-data.js` existe y funciona
- [ ] `package.json` tiene script `copy-data`
- [ ] Build Command en Vercel ejecuta el script
- [ ] Logs de build muestran que se copian los archivos
- [ ] Archivos son accesibles en la URL de producción

## 🚀 Solución Rápida

Si necesitas una solución inmediata, puedes:

1. **Subir los archivos directamente a `public/data/`** (no recomendado para producción, pero funciona)
2. **O asegurar que el script se ejecute** siguiendo los pasos anteriores

## 📝 Nota Importante

Los archivos en `public/data/` están en `.gitignore` porque se regeneran. Esto es correcto. El problema es que deben generarse durante el build en Vercel.

