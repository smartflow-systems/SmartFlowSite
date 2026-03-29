#!/usr/bin/env node
/**
 * Production Optimization Script
 * Optimizes all assets for production deployment
 */

import { execSync } from 'child_process';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { minify as terserMinify } from 'terser';
import CleanCSS from 'clean-css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT_DIR, 'public');

const cssMinifier = new CleanCSS({
  level: 2,
  compatibility: 'ie11'
});

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (e) {
    // Directory exists
  }
}

async function minifyJavaScript(inputPath, outputPath) {
  try {
    const code = await readFile(inputPath, 'utf-8');
    const result = await terserMinify(code, {
      compress: {
        dead_code: true,
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        keep_classnames: true,
        keep_fnames: false,
        passes: 2
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: false
      },
      format: {
        comments: false
      }
    });

    if (result.error) {
      throw result.error;
    }

    await writeFile(outputPath, result.code);

    const originalSize = code.length;
    const minifiedSize = result.code.length;
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    return { originalSize, minifiedSize, savings };
  } catch (error) {
    console.error(`   ❌ Error minifying ${basename(inputPath)}:`, error.message);
    // Copy original file if minification fails
    await copyFile(inputPath, outputPath);
    return null;
  }
}

async function minifyCSS(inputPath, outputPath) {
  try {
    const css = await readFile(inputPath, 'utf-8');
    const result = cssMinifier.minify(css);

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.join(', '));
    }

    await writeFile(outputPath, result.styles);

    const originalSize = css.length;
    const minifiedSize = result.styles.length;
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    return { originalSize, minifiedSize, savings };
  } catch (error) {
    console.error(`   ❌ Error minifying ${basename(inputPath)}:`, error.message);
    await copyFile(inputPath, outputPath);
    return null;
  }
}

async function processJSFiles() {
  console.log('\n📦 Minifying JavaScript files...\n');

  const jsFiles = [
    'app.js',
    'sfs-powerhouse.js',
    'sfs-ultimate.js',
    'circuit-flow.js'
  ];

  let totalOriginal = 0;
  let totalMinified = 0;
  let processed = 0;

  for (const file of jsFiles) {
    const inputPath = join(ROOT_DIR, file);
    const outputPath = join(ROOT_DIR, file.replace('.js', '.min.js'));

    try {
      const result = await minifyJavaScript(inputPath, outputPath);
      if (result) {
        console.log(`   ✓ ${file}: ${result.originalSize} → ${result.minifiedSize} bytes (${result.savings}% smaller)`);
        totalOriginal += result.originalSize;
        totalMinified += result.minifiedSize;
        processed++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  }

  const totalSavings = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);
  console.log(`\n   📊 Total JS: ${totalOriginal} → ${totalMinified} bytes (${totalSavings}% reduction)`);
  return processed;
}

async function processCSSFiles() {
  console.log('\n🎨 Minifying CSS files...\n');

  const cssFiles = [
    'public/styles.css',
    'public/sfs-components.css',
    'public/sfs-powerhouse.css',
    'public/sfs-responsive.css',
    'public/sfs-ultimate.css'
  ];

  let totalOriginal = 0;
  let totalMinified = 0;
  let processed = 0;

  for (const file of cssFiles) {
    const inputPath = join(ROOT_DIR, file);
    const outputPath = join(ROOT_DIR, file.replace('.css', '.min.css'));

    try {
      const result = await minifyCSS(inputPath, outputPath);
      if (result) {
        console.log(`   ✓ ${basename(file)}: ${result.originalSize} → ${result.minifiedSize} bytes (${result.savings}% smaller)`);
        totalOriginal += result.originalSize;
        totalMinified += result.minifiedSize;
        processed++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  }

  const totalSavings = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);
  console.log(`\n   📊 Total CSS: ${totalOriginal} → ${totalMinified} bytes (${totalSavings}% reduction)`);
  return processed;
}

async function generateServiceWorker() {
  console.log('\n🔧 Generating Service Worker...\n');

  const swContent = `// SmartFlow Service Worker
// Version: ${new Date().toISOString()}

const CACHE_NAME = 'smartflow-v1-${Date.now()}';
const RUNTIME_CACHE = 'smartflow-runtime';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.min.css',
  '/sfs-components.min.css',
  '/sfs-powerhouse.min.css',
  '/sfs-responsive.min.css',
  '/sfs-ultimate.min.css',
  '/app.min.js',
  '/sfs-powerhouse.min.js',
  '/sfs-ultimate.min.js',
  '/assets/hero-bg-1024w.webp',
  '/assets/smartflow-logo-200w.webp',
  '/assets/favicon.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache images and static assets
        if (event.request.url.match(/\\.(jpg|jpeg|png|webp|gif|css|js)$/)) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

  await writeFile(join(PUBLIC_DIR, 'sw.js'), swContent);
  console.log('   ✓ Service worker generated: public/sw.js');
}

async function main() {
  console.log('🚀 SmartFlow Production Optimization\n');
  console.log('====================================\n');

  const startTime = Date.now();

  try {
    // 1. Minify JavaScript
    const jsProcessed = await processJSFiles();

    // 2. Minify CSS
    const cssProcessed = await processCSSFiles();

    // 3. Generate Service Worker
    await generateServiceWorker();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n====================================');
    console.log('\n✨ Optimization Complete!\n');
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📦 JS files minified: ${jsProcessed}`);
    console.log(`   🎨 CSS files minified: ${cssProcessed}`);
    console.log(`   🔧 Service worker: ✓`);
    console.log('\n📝 Next steps:');
    console.log('   1. Update HTML to use .min.js and .min.css files');
    console.log('   2. Run: npm run optimize:images');
    console.log('   3. Test service worker registration');
    console.log('   4. Deploy to production\n');

  } catch (error) {
    console.error('\n❌ Optimization failed:', error.message);
    process.exit(1);
  }
}

main();
