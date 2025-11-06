# ✅ SOLUCIÓN SIMPLE: Error 404 en Vercel

## 🔍 Problema

Los archivos dan 404 porque:
1. ✅ Los archivos están en tu computadora en `public/data/`
2. ❌ Pero NO están en el repositorio de GitHub
3. ❌ Cuando Vercel hace deploy desde GitHub, NO tiene los archivos

## ✅ Solución en 3 Pasos

### Paso 1: Ejecutar script de copia

```bash
npm run copy-data
```

Esto copia los archivos de `assets/` a `public/`:
- `assets/data/` → `public/data/`
- `assets/maps/` → `public/maps/`
- `assets/images/` → `public/images/`

### Paso 2: Agregar archivos al repositorio

```bash
# Agregar los archivos al repositorio (ahora no están ignorados)
git add public/data/
git add public/maps/
git add public/images/
git add .gitignore

# Commit
git commit -m "Fix: Agregar archivos de datos a public/ para Vercel"

# Push
git push
```

### Paso 3: Verificar en Vercel

Después del push, Vercel hará deploy automático. Los archivos estarán disponibles.

## 🎯 Por Qué Funciona

```
Antes (NO funcionaba):
- Archivos en public/ → Ignorados por .gitignore
- GitHub NO tiene los archivos
- Vercel clona GitHub → NO tiene archivos
- Resultado: 404 ❌

Después (FUNCIONA):
- Archivos en public/ → NO ignorados
- GitHub SÍ tiene los archivos
- Vercel clona GitHub → SÍ tiene archivos
- Vite copia public/ → dist/
- Resultado: Archivos disponibles ✅
```

## 📝 Comandos Rápidos

```bash
# Todo en uno:
npm run copy-data && git add public/ .gitignore && git commit -m "Fix: Agregar archivos de datos" && git push
```

Eso es todo. Después del push, espera 1-2 minutos para que Vercel haga el deploy y los archivos estarán disponibles.

