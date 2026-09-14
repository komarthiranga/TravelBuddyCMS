# Online places pilot

Run `npm run places:compare` for a zero-request configuration check.
Run `npm run places:compare -- --run --photos` for the bounded live comparison.
Use `--provider=google` or `--provider=foursquare` to test one provider.
Use `--city="Eluru, Andhra Pradesh, India"` to specify the locality.
Run `npm run test:places` for mocked adapter/security tests with no API charges.

Keys live in `.env.local`: GOOGLE_PLACES_API_KEY and FOURSQUARE_API_KEY.
Never use NEXT_PUBLIC_ prefixes. `.env.local` is ignored by Git.
This is a Node-only evaluation tool, not a public app endpoint.

## Observed on 2026-09-14

Both place-search keys worked. Each query requested at most five results.

| Provider | Category | Returned | Address and coordinates | Photo metadata |
| --- | --- | --- | --- | --- |
| Google | Attractions | 5 | 5 | 5 available |
| Google | Restaurants | 5 | 5 | 5 available |
| Google | Hotels | 5 | 5 | 5 available |
| Foursquare | Attractions | 0 | 0 | Not tested |
| Foursquare | Restaurants | 5 | 5 | Photo probes failed |
| Foursquare | Hotels | 5 | 5 | Photo probes failed |

A diagnostic Foursquare photo request returned HTTP 429. This does not establish
whether the issue is account quota, endpoint access limits, or temporary rate
limiting. Check the provider console before making further photo calls. The
comparison now stops photo probing for that provider after the first error.

A separate Google test fetched a fresh photo reference and received HTTP 200,
image/jpeg from the image service. The response body was cancelled; no image was
saved. This confirms retrieval, not image relevance or visual quality.

The initial run made six searches and four Foursquare photo calls. Diagnostics
added one Foursquare search and photo call, plus one Google search, one details
request, and one photo request (followed by an image fetch). No raw result content,
photo URLs, or API keys were written to a report. No DB/Cloudinary writes occurred.

## Limits and next integration step

These are top-five text-search samples, not city coverage totals. Foursquare's
zero attraction results applies only to the query used. Relevance, duplicates,
closure status, local accuracy, and photo quality have not been manually scored.
The sample does not measure hours availability or Telugu coverage.

Recommend Google for the next live preview, keeping original CMS content separate.
Before public use, implement compliant Google Maps/photo author attribution,
no-store provider fetching, restricted server keys, rate/request budgets, and a
fallback when upstream services fail. Keep Google-derived results off the existing
Leaflet map; Google Places map displays have provider-specific requirements.
Do not save provider photos to Cloudinary or photo references to the database.
Only permitted identifiers and original editorial content should be persisted.

No fixed monetary estimate is asserted: Google search fields here trigger Text
Search Pro; detailed fields such as hours change the SKU. Foursquare search and
photo access depend on the account plan. Estimate costs with actual expected
searches, detail views, photo loads, and the current provider price sheets.

## Official references

- https://developers.google.com/maps/documentation/places/web-service/text-search
- https://developers.google.com/maps/documentation/places/web-service/place-photos
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://docs.foursquare.com/fsq-developers-places/reference/place-search
- https://docs.foursquare.com/fsq-developers-places/reference/response-fields
- https://docs.foursquare.com/fsq-developers-places/reference/place-photos
