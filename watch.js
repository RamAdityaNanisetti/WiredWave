const { build } = require('./build');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const assetsDir = path.join(__dirname, 'assets');
const auditDir = path.join(__dirname, 'site-audit');

console.log('🚀 Starting watch mode...');

function watchDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith('.')) {
      console.log(`\n📄 File changed in ${path.basename(dir)}: ${filename}`);
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

// Watch src (content), assets (styles/js), and site-audit
watchDir(srcDir);
watchDir(assetsDir);
watchDir(auditDir);

console.log(`👀 Watching src, assets, and site-audit for changes...`);
