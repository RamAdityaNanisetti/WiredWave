const { build } = require('./build');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const assetsDir = path.join(__dirname, 'assets');

console.log('🚀 Starting watch mode...');

function watchDir(dir) {
  fs.watch(dir, { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith('.')) {
      console.log(`\n📄 File changed: ${filename}`);
      try {
        build();
        console.log('✅ Rebuild complete.');
      } catch (err) {
        console.error('❌ Build failed:', err);
      }
    }
  });
}

// Initial build
build();

// Watch both src (content) and assets (styles/js)
watchDir(srcDir);
watchDir(assetsDir);

console.log(`👀 Watching ${srcDir} and ${assetsDir} for changes...`);
