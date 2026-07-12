# Agents Guide

This repository is Wuhulahu2's public technical home and GitHub Pages user site.

## Purpose

The site presents technical projects, articles, reproducible lab records, concise notes, and the current learning focus. Keep it content-first, lightweight, and easy to maintain.

## Project shape

- Astro static site; no server, database, CMS, or third-party runtime dependency.
- Content lives in `src/content/{projects,articles,labs,notes}/` as Markdown or MDX.
- `src/pages/now.astro` is the hand-maintained current-status page.
- Shared UI belongs in `src/layouts/`, `src/components/`, and `src/styles/`.
- `astro.config.mjs` targets the GitHub user site at `https://kiteAB112.github.io`.

## Content conventions

- Use the frontmatter schema defined in `src/content.config.ts`.
- Keep drafts as `draft: true`; they must not be published accidentally.
- For projects and labs, prefer: problem, principles, environment/process, results, pitfalls, reproduction materials, and boundaries.
- Do not publish secrets, private data, unauthorized vulnerability details, copyrighted material without rights, or unsafe operational guidance.
- Avoid adding complex features until a concrete reading or maintenance need exists.

## Development

```powershell
npm install
npm run dev
npm run check
npm run build
```

Run `npm run check` and `npm run build` after meaningful changes.

## Deployment

- `.github/workflows/deploy.yml` deploys pushes to `main` through GitHub Actions.
- Do not commit, push, trigger deployments, change GitHub Pages settings, or rename the remote repository unless the user explicitly asks.
- The `kiteAB112.github.io` remote repository name is required for the GitHub user-site URL; local folder names may differ.
