#!/usr/bin/env node
/**
 * Image Optimization Script
 * Optimizes all images in the public directory for web performance
 * - Converts to WebP with fallbacks
 * - Compresses JPG/PNG files
 * - Generates responsive image sizes
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '../public');
const ASSETS_DIR = join(PUBLIC_DIR, 'assets');

// Optimization settings
const OPTIMIZATION_CONFIG = {
  jpg: {
    quality: 82,
    progressive: true,
    mozjpeg: true
  },
  png: {
    quality: 85,
    compressionLevel: 9,
    palette: true
  },
  webp: {
    quality: 80,
    effort: 6
  }
};

// Image sizes for responsive images
const RESPONSIVE_SIZES = {
  'hero-bg.jpg': [640, 1024, 1920, 2560],
  'smartflow-logo.png': [200, 400],
  'SmartFlo-Logo.png': [200, 400]
};

async function getFilesRecursively(dir) {
  const files = [];
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      files.push(...await getFilesRecursively(fullPath));
    } else if (/\.(jpg|jpeg|png)$/i.test(item)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeImage(imagePath) {
  try {
    const ext = extname(imagePath).toLowerCase();
    const fileName = basename(imagePath, ext);
    const dir = dirname(imagePath);

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`\n📸 Optimizing: ${basename(imagePath)}`);
    console.log(`   Original size: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Optimize original format
    if (ext === '.jpg' || ext === '.jpeg') {
      const optimizedPath = join(dir, `${fileName}${ext}`);
      await image
        .jpeg(OPTIMIZATION_CONFIG.jpg)
        .toFile(optimizedPath + '.tmp');

      // Replace original with optimized
      await sharp(optimizedPath + '.tmp').toFile(optimizedPath);
      console.log(`   ✓ Optimized JPG`);
    } else if (ext === '.png') {
      const optimizedPath = join(dir, `${fileName}${ext}`);
      await image
        .png(OPTIMIZATION_CONFIG.png)
        .toFile(optimizedPath + '.tmp');

      await sharp(optimizedPath + '.tmp').toFile(optimizedPath);
      console.log(`   ✓ Optimized PNG`);
    }

    // Generate WebP version
    const webpPath = join(dir, `${fileName}.webp`);
    await image
      .webp(OPTIMIZATION_CONFIG.webp)
      .toFile(webpPath);
    console.log(`   ✓ Generated WebP version`);

    // Generate responsive sizes if configured
    const imageKey = basename(imagePath);
    if (RESPONSIVE_SIZES[imageKey]) {
      console.log(`   📐 Generating responsive sizes...`);

      for (const width of RESPONSIVE_SIZES[imageKey]) {
        // Original format
        const responsivePath = join(dir, `${fileName}-${width}w${ext}`);
        await sharp(imagePath)
          .resize(width, null, { withoutEnlargement: true })
          [ext === '.png' ? 'png' : 'jpeg'](ext === '.png' ? OPTIMIZATION_CONFIG.png : OPTIMIZATION_CONFIG.jpg)
          .toFile(responsivePath);

        // WebP format
        const responsiveWebpPath = join(dir, `${fileName}-${width}w.webp`);
        await sharp(imagePath)
          .resize(width, null, { withoutEnlargement: true })
          .webp(OPTIMIZATION_CONFIG.webp)
          .toFile(responsiveWebpPath);

        console.log(`      ✓ ${width}w (${ext.slice(1)} + webp)`);
      }
    }

    console.log(`   ✅ Complete!`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error optimizing ${imagePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 SmartFlow Image Optimization\n');
  console.log('=================================\n');

  try {
    const images = await getFilesRecursively(ASSETS_DIR);
    console.log(`Found ${images.length} images to optimize\n`);

    let optimized = 0;
    let failed = 0;

    for (const imagePath of images) {
      const success = await optimizeImage(imagePath);
      if (success) {
        optimized++;
      } else {
        failed++;
      }
    }

    console.log('\n=================================');
    console.log(`\n✨ Optimization Complete!`);
    console.log(`   ✅ Optimized: ${optimized}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`\nNext steps:`);
    console.log(`   1. Update HTML to use WebP with fallbacks`);
    console.log(`   2. Implement responsive images with srcset`);
    console.log(`   3. Add lazy loading attributes`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
