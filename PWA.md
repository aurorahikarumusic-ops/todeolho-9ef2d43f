# PWA Documentation - Flora 40+

## Strategies
- **Assets (JS/CSS/HTML)**: Stale-while-revalidate.
- **Images (Unsplash)**: Cache-first (30 days).
- **Fonts**: Cache-first (1 year).
- **API**: Network-first with 10s timeout.

## How to Test
1. Run `npm run build` then `npm run preview`.
2. Open DevTools > Application > Service Workers.
3. Toggle "Offline" mode and refresh.

## Maintenance
To force an update for all users, change the `version` in `vite.config.ts` or simply push a new build (autoUpdate is enabled).
