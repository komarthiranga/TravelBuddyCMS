# Travel Buddy UX revision

Implemented locally; not deployed.

## Changes

- Homepage prioritizes available places, search and help choosing a destination.
- City and English/Telugu controls remain available on narrow screens.
- Selected city scopes featured places, browsing categories and guided choices.
- Guide now follows place selection, transport selection and Maps handoff.
- Emergency call action appears before general help content.
- Directions use a native modal with explicit keyboard cycling, Escape dismissal and trigger focus restoration.
- Unknown opening hours are presented as unavailable; open-hours filtering happens before counting and pagination (India Standard Time).
- Straight-line distance and estimated travel time are distinguished from verified routes; no invented bus wait times.
- Routing failures return 503 instead of fabricated distance and duration. Latitude validation, upstream timeouts and supported-mode fallback are enforced.
- Mascot images use Next image optimization; continuous decorative movement is reduced.
- Location controls expose refresh, city-centre selection and clearing. Stored location expires after 15 minutes on restoration.
- Shared interface and help copy support Telugu. Editorial place names and descriptions retain their original language with an explicit translation notice.

## Validation

- TypeScript check passed.
- ESLint: no errors; three existing warnings in CMS Gallery, BuddyPathGuide and waypoints.
- `node --test scripts/test-directions.mjs`: four tests passed (invalid input, HTTP failures, network failures, incorrect mode fallback).
- `npm run build -- --webpack`: production build passed. Default Turbopack build was blocked by the environment's internal port-binding restriction.
- Chrome: inspected desktop and 320px / 400px responsive views, Telugu emergency help, destination-first guide, free/open filters, and directions keyboard focus / Escape behavior.
- Multi-city behavior is implemented but was not exercised with multiple published cities in the available dataset.

## Remaining decisions and constraints

- CMS authentication is not implemented. Choose an administrator sign-in method and configure authorized administrators before deploying a publicly writable CMS.
- Editorial Telugu descriptions require translation and review; the current database has no translated editorial fields.
- Emergency hospital/pharmacy directories and food/hotel/transport listings remain unfinished.
- Cookie-based city selection makes public pages request-rendered. This favors consistent selection; production performance still needs measurement on real devices and networks.
- Location permission-denial behavior and assistive technology beyond keyboard testing need a separate real-device accessibility pass.
- This is not a security certification or a full WCAG conformance audit.
