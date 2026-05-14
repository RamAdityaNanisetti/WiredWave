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
  'engineered_excellence.html',
  'process.html',
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

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEngineeredExcellenceCards(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.warn('engineering-excellence.json missing:', jsonPath);
    return '';
  }
  try {
    const items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!Array.isArray(items) || items.length === 0) return '';
    const imgBase = 'assets/images/engineered excellence/';
    return items
      .map((item, idx) => {
        const title = escapeHtml(item.title);
        const caption = escapeHtml(item.caption);
        const description = escapeHtml(item.description);
        const img = escapeHtml(item.image);
        return `
            <article class="ee-card shrink-0 w-[min(92vw,36rem)] snap-center flex flex-col bg-[#070b14] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/30" data-ee-index="${idx}" aria-roledescription="slide" aria-label="Slide ${idx + 1} of ${items.length}: ${title}">
                <header class="px-6 md:px-8 pt-6 md:pt-8 pb-3 text-left">
                    <h3 class="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">${title}</h3>
                    <p class="text-[11px] md:text-xs font-semibold text-blue-400/90 uppercase tracking-[0.18em] mt-2">${caption}</p>
                </header>
                <div class="relative w-full bg-slate-900/40 border-y border-white/5">
                    <img src="${imgBase}${img}" alt="" class="w-full h-48 sm:h-52 md:h-56 object-cover object-center block" width="640" height="320" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
                </div>
                <div class="px-6 md:px-8 py-5 md:py-6 flex-1 text-left">
                    <p class="text-sm md:text-[15px] text-slate-400 leading-relaxed">${description}</p>
                </div>
            </article>`;
      })
      .join('\n');
  } catch (e) {
    console.warn('engineering-excellence.json invalid:', e.message);
    return '';
  }
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
  const engExPath = path.join(root, 'src', 'config', 'engineering-excellence.json');
  cfg.engineered_excellence_cards = buildEngineeredExcellenceCards(engExPath);

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
    const auditRootDir = path.join(root, 'site-audit');
    fs.mkdirSync(auditRootDir, { recursive: true });
    fs.writeFileSync(path.join(auditRootDir, 'index.html'), standaloneAudit, 'utf8');
    console.log('Generated standalone site-audit/index.html (dist and root)');
  }

  // Generate standalone architecture blueprints page
  const blueprintPartialPath = path.join(partialDir, 'architecture-blueprints.html');
  if (fs.existsSync(blueprintPartialPath)) {
    const blueprintContent = replaceTokens(fs.readFileSync(blueprintPartialPath, 'utf8'), cfg);
    const standaloneBlueprint = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Architecture Blueprints | WiredWave</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { background-color: #0b1120; margin: 0; padding: 0; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body class="min-h-screen">
    <div class="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
            <span class="text-white font-bold tracking-tight">WIREDWAVE <span class="text-blue-500">BLUEPRINTS</span></span>
            <a href="../index.html" class="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <i class="fas fa-arrow-left"></i> BACK TO SITE
            </a>
        </div>
    </div>
    ${blueprintContent.replace(/assets\/images\/architecture\//g, '../assets/images/architecture/')}
</body>
</html>`;
    const blueprintDistDir = path.join(outDir, 'architecture-blueprints');
    fs.mkdirSync(blueprintDistDir, { recursive: true });
    fs.writeFileSync(path.join(blueprintDistDir, 'index.html'), standaloneBlueprint, 'utf8');
    const blueprintRootDir = path.join(root, 'architecture-blueprints');
    fs.mkdirSync(blueprintRootDir, { recursive: true });
    fs.writeFileSync(path.join(blueprintRootDir, 'index.html'), standaloneBlueprint, 'utf8');
    console.log('Generated standalone architecture-blueprints/index.html (dist and root)');
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
