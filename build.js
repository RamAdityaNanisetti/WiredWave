const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const outDir = path.join(root, 'dist');
const outIndex = path.join(outDir, 'index.html');
const configPath = path.join(root, 'src', 'config', 'site.json');
const partialDir = path.join(root, 'src', 'partials');

const partialOrder = [
  'head.html',
  'body-start.html',
  'nav.html',
  'hero.html',
  'tech_gallery.html',
  'solutions.html',
  'process.html',
  'footer.html',
  'scripts.html'
];

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.warn('site.json not found or invalid, proceeding with empty config');
    return {};
  }
}

function replaceTokens(html, cfg) {
  return html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    const parts = key.split('.');
    let v = cfg;
    for (const p of parts) {
      if (v && Object.prototype.hasOwnProperty.call(v, p)) v = v[p];
      else return '';
    }
    return String(v);
  });
}

function build() {
  const cfg = loadConfig();
  let out = '';

  for (const p of partialOrder) {
    const ppath = path.join(partialDir, p);
    if (!fs.existsSync(ppath)) {
      console.warn('Partial missing:', ppath, ' — skipping');
      continue;
    }
    out += fs.readFileSync(ppath, 'utf8') + '\n';
  }

  out = replaceTokens(out, cfg);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outIndex, out, 'utf8');
  console.log('Built from partials ->', outIndex);
}

if (require.main === module) build();

module.exports = { build };
