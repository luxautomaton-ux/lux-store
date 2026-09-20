# Lux Store

Public retail storefront for the Lux ecosystem, managed by Lux Codex and hosted on GitHub Pages.

## Customer surfaces

- Home merchandising
- Shop / collections with filters and sorting
- Product detail pages
- Prelaunch saved-items bag
- Learn with Lux editorial guides
- Help Center / FAQ

## Publishing model

`data/catalog.json` is the Store catalog. Lux Codex Kit Creator can publish new contract-v2 Prompt Kits through `sync-lux-store.mjs --publish` only after the required quality and Lux Verify gates pass.

## Commerce status

Public browsing is live. Pricing, payment, checkout and fulfillment remain intentionally disabled until commercial terms and fulfillment are commissioned. The bag stores items locally for comparison and does not place an order.

## Deployment

GitHub Actions validates `app.js` and the catalog, then publishes all HTML pages plus `assets/` and `data/` to GitHub Pages.
