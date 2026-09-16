# Visitor UX review — 15 September 2026

## Changes

- Home: replaced the long category menu with four destinations (all places, food, stays, getting around). Kept detailed categories in search and listings.
- New-visitor choices fit in one row on mobile. Grocery/delivery records are excluded from these visitor recommendations using the existing pricing classification.
- Listings: search remains visible; secondary filters expand on request and stay open when a filter is active. Removed duplicate result counts and repeated opening-hours notices.
- Mobile navigation: Explore, Guide, My places, Help, in the same visual and keyboard order.
- Guide: one readable column instead of an empty preview panel; descriptions remain visible on mobile. Transport choices appear after a starting point is selected. Choosing transport focuses the route heading rather than restarting the page.
- Starting-point controls use an embedded layout in the guide, reducing nested boxes and repeated questions.
- Removed obsolete Telugu “coming soon” labels for Food, Hotels and Getting Around.

## Verification

Used an isolated agent-browser session against localhost:3000 with Chrome.

- Visually reviewed home, listings, guide and selected route at 390 × 844.
- Verified guide selection, city-centre starting point and car route. Focus reached “2. Your route” at approximately 24px from viewport top.
- Keyboard autocomplete: typed Buddha, ArrowDown, Enter; reached `/attractions?search=Buddha+Park`.
- Telugu guide at 320 × 740: no document horizontal overflow; no obsolete footer labels.
- Desktop listings at 1440 × 1000: inspected expanded filters, selected Restaurant, confirmed five matching cards and active filters visible; no horizontal overflow.
- No browser runtime errors reported during these checks.
- Production webpack build (including TypeScript), lint for changed components, and whitespace checks passed.

These are browser viewport checks, not certification on physical iOS/Android devices or a full accessibility audit. No database records or deployment settings were changed in this UX pass.

## Still pending before launch

1. CMS credentials: `CMS_ADMIN_USERNAME` and `CMS_ADMIN_PASSWORD` are absent from `.env.local`. Follow `docs/cms-access.md`; production values must be configured in Vercel too. CMS access intentionally fails closed without configuration.
2. Deploy the reviewed changes, then check public pages and protected CMS routes on that deployment.
3. Real-device PWA installation, offline recovery, location-denied flow, keyboard/screen-reader and zoom checks across the complete visitor journey.
4. Outstanding place evidence remains in `docs/data-reconciliation-2026-09-15.md`. Missing hours, fees and exact pins must remain unverified until supported; UX improvements do not verify venue data.

## Tradeoff

Secondary filters take one extra tap, in exchange for letting visitors reach the actual places sooner. All category, price and opening-hours controls remain available.
