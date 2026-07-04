# Agents Guide

This is a static GitHub Pages project for a personal anime and character gallery.

## Project Shape

- No build step is required.
- Keep the app static unless the user asks for a framework.
- Main files: `index.html`, `styles.css`, `app.js`.
- Data lives in the `characters` and `series` arrays in `app.js`.

## Development

Open `index.html` directly, or serve the directory:

```powershell
python -m http.server 4173
```

## Conventions

- Keep the UI polished and responsive.
- Do not add paid services or API dependencies without explicit approval.
- Prefer local `assets/` files or stable remote URLs for images.
- Do not commit secrets, tokens, cookies, or private account data.
- Be careful with copyrighted images on public GitHub Pages sites.

## Deployment

This project is intended for GitHub Pages from the repository root on the `main` branch.
