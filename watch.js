const { build } = require('./build');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const assetsDir = path.join(__dirname, 'assets');

console.log('🚀 Starting watch mode...');

let buildTimeout;
function debouncedBuild() {
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    try {
      build();
      console.log('✅ Rebuild complete.');
    } catch (err) {
      console.error('❌ Build failed:', err);
    }
  }, 100);
}

function watchDir(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found, skipping watch: ${dir}`);
    return;
  }
  
  console.log(`👀 Watching ${path.basename(dir)} for changes...`);
  
  fs.watch(dir, { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith('.')) {
      console.log(`\n📄 File changed: ${filename} (${event})`);
      debouncedBuild();
    }
  });
}

// Initial build
try {
  build();
} catch (err) {
  console.error('❌ Initial build failed:', err);
}

// Watch src (content and config) and assets (styles/js)
watchDir(srcDir);
watchDir(assetsDir);
