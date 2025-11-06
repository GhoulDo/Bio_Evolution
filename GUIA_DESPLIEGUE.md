# 🚀 Guía de Despliegue - Bio Evolution

## 📋 Índice
1. [Recomendaciones de Plataformas](#recomendaciones-de-plataformas)
2. [Comparación de Opciones](#comparación-de-opciones)
3. [Guías de Despliegue por Plataforma](#guías-de-despliegue-por-plataforma)
4. [Configuración Requerida](#configuración-requerida)
5. [Optimización para Producción](#optimización-para-producción)

---

## 🏆 Recomendaciones de Plataformas

### 🥇 **Opción 1: Vercel** (RECOMENDADO)

**¿Por qué Vercel?**
- ✅ **Optimizado para React/Vite**: Integración nativa perfecta
- ✅ **CDN global**: Distribución rápida en todo el mundo
- ✅ **HTTPS automático**: Certificados SSL gratuitos
- ✅ **Deploy automático**: Desde GitHub con cada push
- ✅ **Preview deployments**: URLs de preview para cada PR
- ✅ **Gratis para proyectos personales**: Generoso plan gratuito
- ✅ **Soporte para archivos grandes**: Maneja bien GeoJSON grandes
- ✅ **Configuración mínima**: Cero configuración necesaria

**Ideal para**: Proyectos React/Vite que necesitan despliegue rápido y fácil.

**Plan gratuito incluye**:
- 100GB de ancho de banda/mes
- Deploys ilimitados
- Dominio personalizado
- SSL automático

---

### 🥈 **Opción 2: Netlify**

**¿Por qué Netlify?**
- ✅ **Excelente para SPAs**: Optimizado para aplicaciones de una página
- ✅ **Deploy desde Git**: Integración con GitHub/GitLab/Bitbucket
- ✅ **Formularios y funciones**: Serverless functions incluidas
- ✅ **Split testing**: A/B testing incorporado
- ✅ **Gratis y generoso**: Plan gratuito muy completo

**Ideal para**: Proyectos que necesitan funciones serverless adicionales.

**Plan gratuito incluye**:
- 100GB de ancho de banda/mes
- 300 minutos de build time/mes
- SSL automático
- Deploys ilimitados

---

### 🥉 **Opción 3: Cloudflare Pages**

**¿Por qué Cloudflare Pages?**
- ✅ **CDN de Cloudflare**: La red más rápida del mundo
- ✅ **Gratis e ilimitado**: Ancho de banda ilimitado
- ✅ **Builds rápidos**: Infraestructura potente
- ✅ **Integración con Git**: Deploy automático
- ✅ **Worker Functions**: Funciones serverless incluidas

**Ideal para**: Proyectos que necesitan máximo rendimiento y escala.

**Plan gratuito incluye**:
- Ancho de banda ilimitado
- 500 builds/mes
- SSL automático
- Deploys ilimitados

---

### 📱 **Opción 4: GitHub Pages**

**¿Por qué GitHub Pages?**
- ✅ **Gratis**: 100% gratis para repos públicos
- ✅ **Integración nativa**: Si ya usas GitHub
- ✅ **Simple**: Muy fácil de configurar
- ⚠️ **Limitado**: Solo repos públicos (o GitHub Pro)
- ⚠️ **Sin builds automáticos**: Necesitas GitHub Actions

**Ideal para**: Proyectos open source o repositorios públicos.

---

## 📊 Comparación de Opciones

| Característica | Vercel | Netlify | Cloudflare Pages | GitHub Pages |
|----------------|--------|---------|------------------|--------------|
| **Facilidad de uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Velocidad de CDN** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Plan gratuito** | Generoso | Generoso | Muy generoso | Limitado |
| **Build automático** | ✅ | ✅ | ✅ | Con Actions |
| **Preview deployments** | ✅ | ✅ | ✅ | ❌ |
| **SSL automático** | ✅ | ✅ | ✅ | ✅ |
| **Dominio personalizado** | ✅ | ✅ | ✅ | ✅ |
| **Archivos grandes** | ✅ | ✅ | ✅ | ⚠️ |
| **Soporte React/Vite** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 Guías de Despliegue por Plataforma

### 1. Despliegue en Vercel (RECOMENDADO)

#### **Opción A: Desde GitHub (Recomendado)**

**Paso 1: Preparar el repositorio**
```bash
# Asegúrate de que tu código esté en GitHub
git add .
git commit -m "Preparar para deploy"
git push origin main
```

**Paso 2: Conectar con Vercel**
1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta (puedes usar GitHub)
3. Click en "Add New Project"
4. Selecciona tu repositorio de GitHub
5. Vercel detectará automáticamente que es un proyecto Vite

**Paso 3: Configuración del proyecto**
- **Framework Preset**: Vite (se detecta automáticamente)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `dist` (automático)
- **Install Command**: `npm install` (automático)

**Paso 4: Variables de entorno** (si las necesitas)
- No se requieren para este proyecto básico

**Paso 5: Deploy**
- Click en "Deploy"
- Vercel construirá y desplegará automáticamente
- Obtendrás una URL: `tu-proyecto.vercel.app`

**Paso 6: Dominio personalizado** (opcional)
- Ve a Settings → Domains
- Agrega tu dominio personalizado
- Configura los DNS según las instrucciones

#### **Opción B: Desde CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

### 2. Despliegue en Netlify

#### **Opción A: Arrastrar y Soltar (Más Fácil)**

**Paso 1: Construir el proyecto**
```bash
npm run build
```

**Paso 2: Desplegar**
1. Ve a [app.netlify.com](https://app.netlify.com)
2. Arrastra la carpeta `dist` a la zona de drop
3. ¡Listo! Netlify desplegará automáticamente

#### **Opción B: Desde GitHub**

**Paso 1: Preparar repositorio**
```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

**Paso 2: Conectar con Netlify**
1. Ve a [app.netlify.com](https://app.netlify.com)
2. Click en "Add new site" → "Import an existing project"
3. Conecta con GitHub
4. Selecciona tu repositorio

**Paso 3: Configuración de build**
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x o superior

**Paso 4: Deploy**
- Click en "Deploy site"
- Netlify construirá y desplegará

#### **Archivo de configuración (netlify.toml)**

Crea `netlify.toml` en la raíz del proyecto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### 3. Despliegue en Cloudflare Pages

#### **Desde GitHub**

**Paso 1: Preparar repositorio**
```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

**Paso 2: Conectar con Cloudflare**
1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Selecciona "Pages" en el menú lateral
3. Click en "Create a project"
4. Conecta con GitHub
5. Selecciona tu repositorio

**Paso 3: Configuración de build**
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 18.x

**Paso 4: Deploy**
- Click en "Save and Deploy"
- Cloudflare construirá y desplegará

---

### 4. Despliegue en GitHub Pages

#### **Usando GitHub Actions (Recomendado)**

**Paso 1: Crear workflow**

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

**Paso 2: Configurar GitHub Pages**
1. Ve a Settings → Pages en tu repositorio
2. Source: GitHub Actions
3. Guarda los cambios

**Paso 3: Configurar base en Vite**

Modifica `vite.config.js`:

```javascript
export default {
  base: '/nombre-del-repositorio/', // O '/' si es dominio personalizado
  // ... resto de la configuración
}
```

---

## ⚙️ Configuración Requerida

### 1. Verificar vite.config.js

Asegúrate de que `vite.config.js` esté configurado correctamente:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Opcional: desactivar para producción
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'geo-vendor': ['@turf/turf', 'proj4']
        }
      }
    }
  },
  // Para GitHub Pages, agregar base:
  // base: '/nombre-repo/'
})
```

### 2. Variables de Entorno (si las necesitas)

Crea `.env.production`:

```env
VITE_APP_NAME=Bio Evolution
VITE_API_BASE_URL=https://api.example.com
```

Y usa en el código:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

### 3. Rutas y SPA

Asegúrate de que todas las plataformas redirijan rutas a `index.html`:

**Vercel**: Automático
**Netlify**: Usar `netlify.toml` (ver arriba)
**Cloudflare Pages**: Automático
**GitHub Pages**: Configurar en Actions

---

## 🎯 Optimización para Producción

### 1. Build de Producción

```bash
# Construir para producción
npm run build

# Verificar el build
npm run preview
```

### 2. Optimizaciones Recomendadas

#### **Comprimir Assets**
- Vite ya comprime automáticamente
- Considera usar Brotli en el servidor (Vercel/Netlify lo hacen automáticamente)

#### **Lazy Loading**
- Vite ya hace code splitting automático
- Componentes grandes pueden cargarse con `React.lazy()`

#### **Cache Headers**
Configurar en `vercel.json` (Vercel):

```json
{
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### **Compresión de GeoJSON**
- Los archivos GeoJSON ya están optimizados
- Considera servir desde CDN para mejor rendimiento

---

## 🌐 Dominio Personalizado

### Configuración DNS

Para todas las plataformas, necesitarás:

1. **Registrar dominio** (si no lo tienes)
   - Namecheap, Google Domains, GoDaddy, etc.

2. **Configurar DNS**
   - Agregar registro CNAME o A según la plataforma
   - Vercel/Netlify/Cloudflare te darán instrucciones específicas

3. **SSL Automático**
   - Todas las plataformas ofrecen SSL automático
   - Se activa automáticamente al agregar dominio

---

## 📊 Recomendación Final

### 🏆 **Para Bio Evolution: VERCEL**

**Razones**:
1. ✅ **Mejor integración con React/Vite**
2. ✅ **Deploy más rápido y fácil**
3. ✅ **Preview deployments** para testing
4. ✅ **CDN global excelente**
5. ✅ **Plan gratuito generoso**
6. ✅ **Documentación excelente**
7. ✅ **Soporte para archivos grandes** (GeoJSON)

### Pasos Rápidos para Vercel:

```bash
# 1. Instalar Vercel CLI (opcional)
npm i -g vercel

# 2. Deploy
vercel

# O simplemente conecta GitHub en vercel.com
```

---

## 🔧 Troubleshooting

### Problema: Archivos GeoJSON no cargan

**Solución**:
- Verifica que estén en `/public/data/`
- Verifica las rutas en el código (`/data/...`)
- Asegúrate de que el script `copy-data.js` se ejecute antes del build

### Problema: Rutas no funcionan en producción

**Solución**:
- Configura redirects (todas las rutas a `/index.html`)
- Verifica la configuración de `base` en `vite.config.js`

### Problema: Build falla

**Solución**:
- Verifica Node.js version (18.x o superior)
- Limpia node_modules: `rm -rf node_modules && npm install`
- Verifica que todas las dependencias estén en `package.json`

---

## 📝 Checklist de Despliegue

- [ ] Código en GitHub/GitLab
- [ ] `package.json` tiene script `build`
- [ ] `vite.config.js` configurado correctamente
- [ ] Archivos en `/public/data/` están listos
- [ ] Script `copy-data.js` funciona
- [ ] Build local funciona (`npm run build`)
- [ ] Preview local funciona (`npm run preview`)
- [ ] Variables de entorno configuradas (si las hay)
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL activado
- [ ] Redirects configurados para SPA

---

## 🎉 ¡Listo para Desplegar!

Elige la plataforma que prefieras y sigue la guía correspondiente. **Recomendamos Vercel** por su facilidad y optimización para React/Vite.

**¿Necesitas ayuda con algún paso específico?** Consulta la documentación de cada plataforma o crea un issue en el repositorio.

---

**Última actualización**: 2025

