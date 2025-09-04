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

async function generateScreenshots() {
  console.log('Generating PWA screenshots...')
  
  // Generate desktop screenshot (placeholder)
  try {
    await sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 } // theme color
      }
    })
    .png()
    .composite([{
      input: Buffer.from(
        `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
            SvelteKit PWA Boilerplate
          </text>
        </svg>`
      ),
      gravity: 'center'
    }])
    .toFile(path.join(OUTPUT_DIR, 'screenshot-desktop.png'))
    
    console.log('✓ Generated desktop screenshot')
  } catch (error) {
    console.error('✗ Failed to generate desktop screenshot:', error.message)
    throw error
  }

  // Generate mobile screenshot (placeholder) 
  try {
    await sharp({
      create: {
        width: 375,
        height: 667,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 } // theme color
      }
    })
    .png()
    .composite([{
      input: Buffer.from(
        `<svg width="300" height="80" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">
            SvelteKit PWA
          </text>
        </svg>`
      ),
      gravity: 'center'
    }])
    .toFile(path.join(OUTPUT_DIR, 'screenshot-mobile.png'))
    
    console.log('✓ Generated mobile screenshot')
  } catch (error) {
    console.error('✗ Failed to generate mobile screenshot:', error.message)
    throw error
  }
}

async function updateManifest() {
  console.log('Updating manifest.json...')
  
  try {
    const manifestContent = await fs.readFile(MANIFEST_FILE, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    // Ensure PWA id is set
    if (!manifest.id) {
      manifest.id = '/'
    }
    
    // Update icons in manifest - separate any and maskable purposes
    manifest.icons = [
      {
        src: '/icons/manifest-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/manifest-icon-192.png',
        sizes: '192x192', 
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/manifest-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/manifest-icon-512.png',
        sizes: '512x512',
        type: 'image/png', 
        purpose: 'maskable'
      }
    ]

    // Add screenshots for PWA install dialog
    manifest.screenshots = [
      {
        src: '/icons/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Desktop view of SvelteKit PWA Boilerplate'
      },
      {
        src: '/icons/screenshot-mobile.png', 
        sizes: '375x667',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobile view of SvelteKit PWA Boilerplate'
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
    
    // Generate PWA screenshots
    await generateScreenshots()
    
    // Update manifest.json
    await updateManifest()
    
    // Update app.html
    await updateAppHtml()
    
    console.log('\n🎉 PWA icons and screenshots generated successfully!')
    console.log('\nGenerated files:')
    for (const { name } of ICON_SIZES) {
      console.log(`  - ${OUTPUT_DIR}/${name}.png`)
    }
    console.log(`  - ${OUTPUT_DIR}/screenshot-desktop.png`)
    console.log(`  - ${OUTPUT_DIR}/screenshot-mobile.png`)
    console.log(`  - Updated ${MANIFEST_FILE}`)
    console.log(`  - Updated src/app.html`)
    
  } catch (error) {
    console.error('\n💥 Failed to generate PWA icons:', error.message)
    process.exit(1)
  }
}

main()