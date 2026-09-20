# Lux Store

Public Lux Store storefront managed by Lux Codex.

- `data/catalog.json` is the public catalog source of truth.
- `assets/` contains approved public storefront art.
- Lux Codex Kit Creator stages verified prompt kits into this catalog.
- GitHub Actions publishes the static site to GitHub Pages on every push to `main`.

The Codex store sync accepts Kit Creator contract-v2 packs only after both quality and verification status are PASS. Publishing remains traceable through Git history.