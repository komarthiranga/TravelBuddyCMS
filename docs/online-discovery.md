# Online-first TravelBuddy

Public browsing no longer queries city, category, attraction, stay or service master tables. The CMS and its existing data remain untouched for archival use. Legacy attraction URLs redirect to online discovery; the old online preview API returns 410. Booking.com integration was set aside in favour of the requested discovery migration.

## How it works

1. Search a city with Google Places Autocomplete (New), restricted to India and cities. Searches submit explicitly rather than calling Google on every keystroke.
2. Resolve the selected city with Place Details; verify its country is India and it is a locality/administrative city. Only the place ID is remembered in local storage. Names and coordinates are fetched again after a reload.
3. Select Stay, Eat & drink, Get around, Everyday, Local help or Explore. Nearby Search returns up to 10 places within 15 km, filtered to India on the server. Service types come from Google's supported taxonomy, mapped to UI labels in code; result-category chips are derived from returned place types. There is no category table or exhaustive city category-count query.
4. Open a place to fetch ratings, hours, contact details and a photo reference. Press Show photo to load an image with contributor attribution. Google content is not persisted in our database or a server cache. No prefetch of place-detail links.
5. Use Google Maps links for directions. The online flow does not place Google results on the legacy Leaflet/OSM map. With permission, device coordinates can be used directly as the nearby-search centre. Existing granted permission automatically loads nearby places on entry; first-time visitors get an explicit location button. Coordinates stay in page memory, are sent to Google only for nearby searches, and are never saved in our database or browser storage. The retired location helper is no longer mounted, and its old browser cache is removed. Denial, timeouts and manual city selection remain supported.
6. Google sign-in via Auth.js enables saving and liking. PostgreSQL stores `traveller` profiles and `traveller_place` rows containing only the provider/place ID and user's saved/liked flags. Database writes derive ownership from the authenticated session, never a client-supplied user ID. Up to 500 places per user; updates are serialized per user.

Saved places load fresh details four at a time. Legacy browser-only saved CMS records remain in their original local storage key; they are not converted into guessed Google place IDs. Existing trip-planning components remain in the source but the public guide now uses online discovery. Hotel room rates and exact menu prices are outside this version.

## Environment and setup

Required server variables:

```dotenv
DATABASE_URL=...
GOOGLE_PLACES_API_KEY=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_SECRET=...
PLACES_DAILY_CALL_LIMIT=100
```

`AUTH_SECRET` is a cryptographically random session encryption secret, not the Google client secret. It has been generated locally without printing it. Configure a separate secret in your deployment environment. For production, set `AUTH_URL` to the canonical HTTPS origin, and `SITE_URL` to the same origin for metadata. Auth.js trusts the Vercel environment automatically; other reverse proxies must use the documented Auth.js trusted-host setup with a trusted proxy.

Run `npm run db:online` once per database. It transactionally creates only the two user-data tables, without modifying master tables. The migration has been applied to the currently configured development database.

Google OAuth Web application authorised redirect URIs:

- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

If the consent screen is in testing mode, add the intended Google accounts as test users. Google handles authentication/consent; no Google password is collected by this application. The production OAuth app must link the public privacy and terms pages and have accurate owner information.

## Costs and limits

No monthly rupee budget has been assumed or configured in Google Cloud. The application currently has:

- 100 outgoing Places requests per UTC day **per server process**, configurable with `PLACES_DAILY_CALL_LIMIT`; zero disables outgoing calls.
- 20 incoming discovery requests/minute per client IP as a burst backstop.
- 10 search results, detail requests only on opening a place, and photos only on request.
- Explicit field masks: search requests omit expensive ratings/contact details; details fetch those only when opened.
- No hidden fallback calls to another paid provider, no retries that silently multiply API calls.

These in-memory counters reset on restart and do not coordinate across serverless instances. They are development safeguards, **not a billing cap or public-production abuse protection**. Before public launch configure Google Cloud API quotas and a shared rate limiter/gateway. Use a dedicated, API-restricted server key. Start with a modest alert threshold such as ₹1,000 if acceptable, then review actual usage before choosing a monthly operating budget. Alerts-only budgets do not stop billing; they must not be described as a spending limit.

Google Places availability does not guarantee complete or real-time coverage. Missing photos/hours are shown as missing, without generated replacement facts. Results from different category searches may overlap.

## Verification

- `npm run test:online`: identifier/URL safety, daily limit, burst limit.
- With the dev server on port 3000: `npm run test:online:integration`. Creates isolated synthetic test profiles, tests session ownership, persistence and deletion, then removes only its own test rows. It does not call paid Google APIs or exercise Google's actual consent callback.
- `npx tsc --noEmit`, targeted ESLint, and `npm run build`.
- Live checks: Eluru city search, attraction and restaurant results, place details/photo with attribution, Google sign-in redirect. A real user must finish signing in to validate their Google account's consent and callback configuration.

## References

- [Places API documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies)
- [Google API usage and quotas](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Cloud Billing alerts](https://docs.cloud.google.com/billing/docs/how-to/budgets)
- [Auth.js Google provider](https://authjs.dev/getting-started/providers/google)
