const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const srcIndex = path.join(root, 'index.html');
const outDir = path.join(root, 'dist');
const outIndex = path.join(outDir, 'index.html');
const configPath = path.join(root, 'src', 'config', 'site.json');

function build() {
  if (!fs.existsSync(srcIndex)) {
    console.error('Source index.html not found at', srcIndex);
    process.exit(1);
  }

  const html = fs.readFileSync(srcIndex, 'utf8');

  // Load config (not strictly required for a byte-identical build)
  let cfg = {};
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    // ignore - config optional
  }

  // Future-proof: allow simple token replacement when template contains {{...}} tokens.
  const replaced = html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    const parts = key.split('.');
    let v = cfg;
    for (const p of parts) {
      if (v && Object.prototype.hasOwnProperty.call(v, p)) v = v[p];
      else return '';
    }
    return String(v);
  });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outIndex, replaced, 'utf8');
  console.log('Built', outIndex);
}

if (require.main === module) build();

module.exports = { build };
