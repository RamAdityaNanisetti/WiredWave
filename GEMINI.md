# WiredWave Site

Enterprise Infrastructure & Network Engineering static website.

## Project Architecture

This project uses a custom partial-based assembly system to generate a single-file static website.

### Structure
- `src/partials/`: Contains HTML fragments that make up the page.
- `src/config/site.json`: Global configuration and content tokens.
- `assets/`: Static assets (CSS, JS, Images).
- `build.js`: The build engine that assembles partials and replaces tokens.
- `index.html`: The generated canonical output (also found in `dist/`).

### Build Process
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

### Modifying Content
- **HTML Structure:** Edit files in `src/partials/`.
- **Global Data:** Edit `src/config/site.json`. Use `{{ token.path }}` in partials to reference data.
- **Styling:** Edit `assets/css/main.css`. The project uses Tailwind CSS utility classes.

### Commands
- `npm run build`: Rebuild the site.
- `npm run start`: Serve the `dist/` folder locally on port 8000.
- `npm run verify`: Check for differences between the root `index.html` and `dist/index.html`.

## Conventions
- **Partials:** Keep partials focused and modular.
- **Tokens:** Prefer using tokens in `site.json` for frequently changed text (emails, company name, etc.).
- **Backups:** The build script automatically creates timestamped backups of `index.html`. Clean these up periodically if they accumulate.
