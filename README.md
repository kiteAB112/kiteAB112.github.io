# Character Atlas

A static personal anime and character gallery designed for GitHub Pages.

This version has migrated the old `kiteAB112.github.io` Rikka page into a
cleaner atlas. 小鸟游六花 is the first complete character entry; the project is
structured so more characters and works can be added over time.

## Files

- `index.html` - page structure
- `styles.css` - visual design
- `app.js` - editable atlas data and rendering logic
- `assets/rikka/` - migrated local images from the old GitHub Pages project

## Local Preview

Open `index.html` directly in a browser.

For a local HTTP server:

```powershell
python -m http.server 4173
```

Then visit:

```text
http://127.0.0.1:4173
```

## Customize

Edit the `atlas.characters` and `atlas.works` data in `app.js`.

Each character can have:

- basic profile fields
- tags and stats
- quotes
- gallery images
- related work ids

Image URLs can be:

- remote image URLs
- files committed under an `assets/` directory
- images hosted by GitHub Pages

## GitHub Pages

After pushing this project to GitHub:

1. Open the repository settings.
2. Go to `Pages`.
3. Select `Deploy from a branch`.
4. Choose the `main` branch and `/root`.
5. Save and wait for the Pages URL.

## Notes

Avoid committing copyrighted image files unless you have the right to host them. For a public page, prefer your own artwork, screenshots you are allowed to use, or image links that are safe to publish.

Current migrated/collected image sets:

- `assets/rikka/` - migrated from the old local GitHub Pages project
- `assets/frieren/` - collected from the official anime character page for layout drafting; review rights before public publishing
- `assets/levi/` - collected from the official Attack on Titan Final Season character page for layout drafting; review rights before public publishing
