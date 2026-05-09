WiredWave — repo structure and workflow

Overview
- index.html — original single-file site (v1). Keep as-is for reference.
- dist/index.html — built site (v2) assembled from partials; serve this in production.
- src/partials/ — HTML partials (head, nav, hero, gallery, process, footer, scripts).
- src/config/site.json — company/contact/site configuration (used as template tokens).
- build.js — Node build tool: reads partials + config and writes dist/index.html.
- assets/ — images, css, js (unchanged).

Workflow
1. Edit src/partials/*.html and src/config/site.json.
2. npm run build  (or node build.js) — outputs dist/index.html.
3. Verify: npm run verify (compares index.html with dist/index.html).
4. Serve: cd dist && python -m http.server 8000

Notes
- dist/index.html is the canonical v2 output. index.html remains v1 reference.
- Commits will be made only after your approval.
