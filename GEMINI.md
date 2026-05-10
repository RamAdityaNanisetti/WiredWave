# WiredWave Site

Enterprise Infrastructure & Network Engineering static website.

## Project Architecture

This project uses a custom partial-based assembly system to generate a single-file static website.

### Structure
- `src/partials/`: Contains HTML fragments that make up the page.
- `src/config/site.json`: Global configuration and content tokens.
- `assets/`: Static assets (CSS, JS, Images).
- `build.js`: The build engine that assembles partials and replaces tokens.
- `watch.js`: Development script that monitors changes and triggers rebuilds.
- `index.html`: The generated canonical output (also found in `dist/`).

### Build Process (don't run this unless i explicitly ask for it)
The build process (`npm run build`) performs the following steps:
1. Loads configuration from `src/config/site.json`.
2. Assembles partials from `src/partials/` in a specific order:
   - `head.html`
   - `body-start.html`
   - `nav.html`
   - `hero.html`
   - `tech_gallery.html`
   - `solutions.html`
   - `process.html`
   - `footer.html`
   - `scripts.html`
3. Replaces tokens in the form `{{ key.path }}` with values from `site.json`.
4. Backs up the existing root `index.html`.
5. Writes the final HTML to both `dist/index.html` and the root `index.html`.

## Development Workflows

### Live Development
The project uses a combination of `watch.js` and `browser-sync` for a seamless development experience.
- **`npm run dev`**: The recommended command for development. It starts the watch script and a live-reloading server on port 8000.
- **Auto-Rebuild**: Any changes to `src/` (partials, config) or `assets/` (styles, scripts) will automatically trigger a rebuild.
- **Live Reload**: Browser-Sync monitors `dist/index.html` and `assets/` to refresh the browser automatically upon changes.

### Modifying Content
- **HTML Structure:** Edit files in `src/partials/`.
- **Global Data:** Edit `src/config/site.json`. Use `{{ token.path }}` in partials to reference data.
- **Styling:** Edit `assets/css/main.css` or use Tailwind CSS utility classes directly in partials. The project includes Tailwind via CDN in `head.html`.

### Commands
- `npm run dev`: (Recommended) Start watch mode and live-reloading server.
- `npm run build`: Perform a one-time build of the site.
- `npm run watch`: Start only the watch script (no server).
- `npm run start`: Serve the `dist/` folder locally on port 8000 using browser-sync.
- `npm run verify`: Check for differences between the root `index.html` and `dist/index.html`.

## Conventions
- **Partials:** Keep partials focused and modular.
- **Tokens:** Prefer using tokens in `site.json` for frequently changed text (emails, company name, etc.).
- **Backups:** The build script automatically creates timestamped backups of `index.html`. Clean these up periodically if they accumulate.
