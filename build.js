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
  'who_we_serve.html',
  'core_services.html',
  'tech_gallery.html',
  'solutions.html',
  'process.html',
  'audit.html',
  'contact.html',
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

function build() {
  const cfg = loadConfig();

  // Assemble HTML from partials
  const assembled = replaceTokens(assembleFromPartials(), cfg);

  // Ensure output dir
  fs.mkdirSync(outDir, { recursive: true });

  // Write both dist and root index.html (single-file canonical output)
  fs.writeFileSync(outDist, assembled, 'utf8');
  fs.writeFileSync(outRoot, assembled, 'utf8');

  // Copy assets to dist to ensure complete distributable
  const assetsSrc = path.join(root, 'assets');
  const assetsDist = path.join(outDir, 'assets');
  if (fs.existsSync(assetsSrc)) {
    if (!fs.existsSync(assetsDist)) fs.mkdirSync(assetsDist, { recursive: true });
    copyRecursiveSync(assetsSrc, assetsDist);
    console.log('Copied assets to dist');
  }

  // Generate standalone audit page from the audit partial
  const auditPartialPath = path.join(partialDir, 'audit.html');
  if (fs.existsSync(auditPartialPath)) {
    const auditContent = replaceTokens(fs.readFileSync(auditPartialPath, 'utf8'), cfg);
    const standaloneAudit = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Audit | WiredWave</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { background-color: #0b1120; margin: 0; padding: 0; }
        img { max-width: 100%; height: auto; }
        /* Override relative paths for the subdirectory index.html */
        #site-audit a[href="site-audit/index.html"] { display: none; }
    </style>
</head>
<body class="min-h-screen">
    <div class="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
            <span class="text-white font-bold tracking-tight">WIREDWAVE <span class="text-blue-500">AUDIT</span></span>
            <a href="../index.html" class="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <i class="fas fa-arrow-left"></i> BACK TO SITE
            </a>
        </div>
    </div>
    ${auditContent.replace(/assets\/images\/audit\//g, '../assets/images/audit/')}
</body>
</html>`;
    const auditDistDir = path.join(outDir, 'site-audit');
    fs.mkdirSync(auditDistDir, { recursive: true });
    fs.writeFileSync(path.join(auditDistDir, 'index.html'), standaloneAudit, 'utf8');
    console.log('Generated standalone site-audit/index.html');
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
