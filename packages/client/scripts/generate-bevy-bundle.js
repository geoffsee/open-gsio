import { execSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  rmSync,
  cpSync,
  statSync,
} from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';

import { Logger } from 'tslog';
const logger = new Logger({
  stdio: 'inherit',
  prettyLogTimeZone: 'local',
  type: 'pretty',
  stylePrettyLogs: true,
  prefix: ['\n'],
  overwrite: true,
});

function main() {
  bundleCrate();
  cleanup();
  logger.info('🎉 yachtpit built successfully');
}

const getRepoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
const repoRoot = resolve(getRepoRoot);
const publicDir = resolve(repoRoot, 'packages/client/public');
const indexHtml = resolve(publicDir, 'index.html');

function bundleCrate() {
  // ───────────── Build yachtpit project ───────────────────────────────────
  logger.info('🔨 Building yachtpit...');

  logger.info(`📁 Repository root: ${repoRoot}`);

  // Check if submodules need to be initialized
  const yachtpitPath = resolve(repoRoot, 'crates/yachtpit');
  logger.info(`📁 Yachtpit path: ${yachtpitPath}`);

  if (!existsSync(yachtpitPath)) {
    logger.info('📦 Initializing submodules...');
    execSync('git submodule update --init --remote', { stdio: 'inherit' });
  } else {
    logger.info(`✅ Submodules already initialized at: ${yachtpitPath}`);
  }

  // Build the yachtpit project
  const buildCwd = resolve(repoRoot, 'crates/yachtpit/crates/yachtpit');
  logger.info(`🔨 Building in directory: ${buildCwd}`);

  try {
    execSync('trunk build --release', {
      cwd: buildCwd,
    });
    logger.info('✅ Yachtpit built');
  } catch (error) {
    console.error('❌ Failed to build yachtpit:', error.message);
    process.exit(1);
  }

  // ───────────── Copy assets to public directory ──────────────────────────
  const yachtpitDistDir = join(buildCwd, 'dist');

  logger.info(`📋 Copying assets to public directory...`);

  // Remove existing yachtpit assets from public directory
  const skipRemoveOldAssets = false;

  if (!skipRemoveOldAssets) {
    const existingAssets = readdirSync(publicDir).filter(
      file => file.startsWith('yachtpit') && (file.endsWith('.js') || file.endsWith('.wasm')),
    );

    existingAssets.forEach(asset => {
      const assetPath = join(publicDir, asset);
      rmSync(assetPath, { force: true });
      logger.info(`🗑️  Removed old asset: ${assetPath}`);
    });
  } else {
    logger.warn('SKIPPING REMOVING OLD ASSETS');
  }

  // Copy new assets from yachtpit/dist to public directory
  if (existsSync(yachtpitDistDir)) {
    logger.info(`📍Located yachtpit build: ${yachtpitDistDir}`);
    try {
      cpSync(yachtpitDistDir, publicDir, {
        recursive: true,
        force: true,
      });
      logger.info(`✅ Assets copied from ${yachtpitDistDir} to ${publicDir}`);
    } catch (error) {
      console.error('❌ Failed to copy assets:', error.message);
      process.exit(1);
    }
  } else {
    console.error(`❌ Yachtpit dist directory not found at: ${yachtpitDistDir}`);
    process.exit(1);
  }

  // ───────────── locate targets ───────────────────────────────────────────
  const dstPath = join(publicDir, 'yachtpit.html');

  // Regexes for the hashed filenames produced by most bundlers
  const JS_RE = /^yachtpit-[\da-f]{16}\.js$/i;
  const WASM_RE = /^yachtpit-[\da-f]{16}_bg\.wasm$/i;

  // Always perform renaming of bundle files
  const files = readdirSync(publicDir);

  // helper that doesn't explode if the target file is already present
  const safeRename = (from, to) => {
    if (!existsSync(from)) return;
    if (existsSync(to)) {
      logger.info(`ℹ️  ${to} already exists – removing and replacing.`);
      rmSync(to, { force: true });
    }
    renameSync(from, to);
    logger.info(`📝 Renamed: ${basename(from)} → ${basename(to)}`);
  };

  files.forEach(f => {
    const fullPath = join(publicDir, f);
    if (JS_RE.test(f)) safeRename(fullPath, join(publicDir, 'yachtpit.js'));
    if (WASM_RE.test(f)) safeRename(fullPath, join(publicDir, 'yachtpit_bg.wasm'));
  });

  // ───────────── patch markup inside HTML ─────────────────────────────────
  if (existsSync(indexHtml)) {
    logger.info(`📝 Patching HTML file: ${indexHtml}`);
    let html = readFileSync(indexHtml, 'utf8');

    html = html
      .replace(/yachtpit-[\da-f]{16}\.js/gi, 'yachtpit.js')
      .replace(/yachtpit-[\da-f]{16}_bg\.wasm/gi, 'yachtpit_bg.wasm');

    writeFileSync(indexHtml, html, 'utf8');

    // ───────────── rename HTML entrypoint ─────────────────────────────────
    if (basename(indexHtml) !== 'yachtpit.html') {
      logger.info(`📝 Renaming HTML file: ${indexHtml} → ${dstPath}`);
      // Remove existing yachtpit.html if it exists
      if (existsSync(dstPath)) {
        rmSync(dstPath, { force: true });
      }
      renameSync(indexHtml, dstPath);
    }
  } else {
    logger.info(`⚠️  ${indexHtml} not found – skipping HTML processing.`);
  }
  optimizeWasmSize();
}

function optimizeWasmSize() {
  logger.info('🔨 Checking WASM size...');

  const wasmPath = resolve(publicDir, 'yachtpit_bg.wasm');
  const fileSize = statSync(wasmPath).size;
  const sizeInMb = fileSize / (1024 * 1024);

  if (sizeInMb > 30) {
    logger.info(`WASM size is ${sizeInMb.toFixed(2)}MB, optimizing...`);
    execSync(`wasm-opt -Oz -o ${wasmPath} ${wasmPath}`, {
      encoding: 'utf-8',
    });
    logger.info(`✅ WASM size optimized`);
  } else {
    logger.info(
      `⏩ Skipping WASM optimization, size (${sizeInMb.toFixed(2)}MB) is under 30MB threshold`,
    );
  }
}

function cleanup() {
  logger.info('Running cleanup...');
  rmSync(indexHtml, { force: true });
  const creditsDir = resolve(`${repoRoot}/packages/client/public`, 'credits');
  rmSync(creditsDir, { force: true, recursive: true });
}

main();
