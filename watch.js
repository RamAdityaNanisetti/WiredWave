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
      // Clear cache for build.js to ensure we use the latest logic
      const buildPath = path.resolve(__dirname, 'build.js');
      delete require.cache[buildPath];
      const { build } = require('./build');
      
      build();
      console.log('✅ Rebuild complete.');
    } catch (err) {
      console.error('❌ Build failed:', err);
    }
  }, 100);
}

function watchFile(file) {
  if (!fs.existsSync(file)) return;
  console.log(`👀 Watching ${path.basename(file)} for logic changes...`);
  fs.watch(file, (event) => {
    if (event === 'change') {
      console.log(`\n⚙️  Build logic changed: ${path.basename(file)}`);
      debouncedBuild();
    }
  });
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
  const { build } = require('./build');
  build();
} catch (err) {
  console.error('❌ Initial build failed:', err);
}

// Watch src (content and config), assets (styles/js), and build logic
watchDir(srcDir);
watchDir(assetsDir);
watchFile(path.join(__dirname, 'build.js'));
