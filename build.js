const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const outDir = path.join(root, 'dist');
const outDist = path.join(outDir, 'index.html');
const outRoot = path.join(root, 'index.html');
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

function assembleFromPartials() {
  let out = '';
  for (const p of partialOrder) {
    const ppath = path.join(partialDir, p);
    if (!fs.existsSync(ppath)) {
      console.warn('Partial missing:', ppath, ' — skipping');
      continue;
    }
    out += fs.readFileSync(ppath, 'utf8') + '\n';
  }
  return out;
}

function backupIfExists(target) {
  if (!fs.existsSync(target)) return;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const bak = target + '.bak.' + ts;
  fs.copyFileSync(target, bak);
  console.log('Backed up', target, '->', bak);
}

function build() {
  const cfg = loadConfig();

  // Assemble HTML from partials
  const assembled = replaceTokens(assembleFromPartials(), cfg);

  // Ensure output dir
  fs.mkdirSync(outDir, { recursive: true });

  // Backup existing root index.html before overwrite
  try {
    backupIfExists(outRoot);
  } catch (e) {
    console.warn('Backup failed:', e.message);
  }

  // Write both dist and root index.html (single-file canonical output)
  fs.writeFileSync(outDist, assembled, 'utf8');
  fs.writeFileSync(outRoot, assembled, 'utf8');

  // Copy site-audit if it exists
  const auditSrc = path.join(root, 'site-audit');
  const auditDist = path.join(outDir, 'site-audit');
  if (fs.existsSync(auditSrc)) {
    fs.mkdirSync(auditDist, { recursive: true });
    copyRecursiveSync(auditSrc, auditDist);
    console.log('Copied site-audit to dist');
  }

  console.log('Built single-file index.html at:', outRoot);
  console.log('Also wrote dist output at:', outDist);
}

function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (require.main === module) build();

module.exports = { build };
