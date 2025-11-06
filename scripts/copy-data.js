import { copyFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

console.log('📁 Directorio raíz:', rootDir)

const sourceDataDir = join(rootDir, 'assets', 'data')
const targetDataDir = join(rootDir, 'public', 'data')
const sourceMapsDir = join(rootDir, 'assets', 'maps')
const targetMapsDir = join(rootDir, 'public', 'maps')

// Crear carpetas destino
if (!existsSync(targetDataDir)) {
  mkdirSync(targetDataDir, { recursive: true })
  console.log('✅ Carpeta public/data creada')
} else {
  console.log('📁 Carpeta public/data ya existe')
}

if (!existsSync(targetMapsDir)) {
  mkdirSync(targetMapsDir, { recursive: true })
  console.log('✅ Carpeta public/maps creada')
} else {
  console.log('📁 Carpeta public/maps ya existe')
}

// Archivos de datos a copiar
const dataFiles = [
  'macrobarr.geojson',
  'sitio_aprovechamiento_residuos.geojson'
]

console.log('\n📊 Copiando archivos de datos...')
// Copiar archivos de datos
dataFiles.forEach(file => {
  const source = join(sourceDataDir, file)
  const target = join(targetDataDir, file)
  
  try {
    if (!existsSync(source)) {
      console.error(`❌ No existe: ${source}`)
      return
    }
    
    copyFileSync(source, target)
    
    const content = readFileSync(target, 'utf-8')
    const firstLine = content.split('\n')[0]
    
    if (firstLine.includes('{') || firstLine.includes('//')) {
      console.log(`✅ Copiado: ${file} (${(content.length / 1024).toFixed(2)} KB)`)
    } else {
      console.error(`⚠️ Archivo corrupto: ${file}`)
      console.log(`   Primera línea: ${firstLine.substring(0, 50)}...`)
    }
  } catch (error) {
    console.error(`❌ Error con ${file}:`, error.message)
  }
})

// Copiar imágenes de mapas
console.log('\n🗺️ Copiando imágenes de mapas...')
try {
  if (existsSync(sourceMapsDir)) {
    const mapFiles = readdirSync(sourceMapsDir).filter(f => f.endsWith('.png'))
    
    mapFiles.forEach(file => {
      const source = join(sourceMapsDir, file)
      const target = join(targetMapsDir, file)
      
      try {
        copyFileSync(source, target)
        const stats = statSync(target)
        console.log(`✅ Copiado: ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
      } catch (error) {
        console.error(`❌ Error copiando ${file}:`, error.message)
      }
    })
    
    if (mapFiles.length === 0) {
      console.log('⚠️ No se encontraron archivos PNG en assets/maps')
    }
  } else {
    console.log('⚠️ Carpeta assets/maps no existe')
  }
} catch (error) {
  console.error('❌ Error copiando mapas:', error.message)
}

console.log('\n✅ Proceso completado')
