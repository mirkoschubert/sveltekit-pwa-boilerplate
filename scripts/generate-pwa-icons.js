#!/usr/bin/env node

import { promises as fs } from 'fs'
import sharp from 'sharp'
import path from 'path'

const SOURCE_SVG = 'static/favicon.svg'
const OUTPUT_DIR = 'static/icons'
const MANIFEST_FILE = 'static/manifest.json'

const ICON_SIZES = [
  { name: 'apple-icon-180', size: 180, purpose: 'apple' },
  { name: 'manifest-icon-192', size: 192, purpose: 'any maskable' },
  { name: 'manifest-icon-512', size: 512, purpose: 'any maskable' }
]

async function ensureDirectory(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
  }
}

async function generateIcon(sourcePath, outputPath, size) {
  console.log(`Generating ${path.basename(outputPath)} (${size}x${size})...`)
  
  try {
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath)
    
    console.log(`✓ Generated ${path.basename(outputPath)}`)
  } catch (error) {
    console.error(`✗ Failed to generate ${path.basename(outputPath)}:`, error.message)
    throw error
  }
}

async function updateManifest() {
  console.log('Updating manifest.json...')
  
  try {
    const manifestContent = await fs.readFile(MANIFEST_FILE, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    // Update icons in manifest
    manifest.icons = [
      {
        src: '/icons/manifest-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/manifest-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
    
    await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n')
    console.log('✓ Updated manifest.json')
  } catch (error) {
    console.error('✗ Failed to update manifest.json:', error.message)
    throw error
  }
}

async function updateAppHtml() {
  console.log('Updating app.html...')
  
  try {
    const appHtmlPath = 'src/app.html'
    let htmlContent = await fs.readFile(appHtmlPath, 'utf-8')
    
    // Update apple-touch-icon link if it exists
    const appleIconRegex = /<link rel="apple-touch-icon" href="[^"]*"/
    const newAppleIconLink = '<link rel="apple-touch-icon" href="/icons/apple-icon-180.png"'
    
    if (appleIconRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(appleIconRegex, newAppleIconLink)
    } else {
      // Add apple-touch-icon if it doesn't exist
      const headCloseRegex = /(\s*)<\/head>/
      const appleIconTag = '    <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />\n$1</head>'
      htmlContent = htmlContent.replace(headCloseRegex, appleIconTag)
    }
    
    await fs.writeFile(appHtmlPath, htmlContent)
    console.log('✓ Updated app.html')
  } catch (error) {
    console.error('✗ Failed to update app.html:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Generating PWA icons with Sharp...\n')
  
  try {
    // Check if source SVG exists
    await fs.access(SOURCE_SVG)
    console.log(`✓ Found source file: ${SOURCE_SVG}`)
    
    // Ensure output directory exists
    await ensureDirectory(OUTPUT_DIR)
    console.log(`✓ Output directory ready: ${OUTPUT_DIR}`)
    
    // Generate all icon sizes
    for (const { name, size } of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `${name}.png`)
      await generateIcon(SOURCE_SVG, outputPath, size)
    }
    
    // Update manifest.json
    await updateManifest()
    
    // Update app.html
    await updateAppHtml()
    
    console.log('\n🎉 PWA icons generated successfully!')
    console.log('\nGenerated files:')
    for (const { name } of ICON_SIZES) {
      console.log(`  - ${OUTPUT_DIR}/${name}.png`)
    }
    console.log(`  - Updated ${MANIFEST_FILE}`)
    console.log(`  - Updated src/app.html`)
    
  } catch (error) {
    console.error('\n💥 Failed to generate PWA icons:', error.message)
    process.exit(1)
  }
}

main()