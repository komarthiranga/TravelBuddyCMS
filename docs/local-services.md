# Eluru local services directory

The public `/services` route uses a separate `local_service` table. Hospitals,
schools and government offices are not tourist attractions. Links appear on the
home page, Help/Emergency pages and in the footer. The route is in the sitemap.

## Initial source review — 16 September 2026

Source: https://eluru.ap.gov.in/public-utilities/ including its public Load More
results. Two English/Telugu duplicates were merged. The reviewed manifest has
40 records: 35 distinct utility entries and five helplines. Of these, 34 are
published and six are held for further review.

Published coverage: four hospitals, three civic services, six post offices,
seven colleges, nine schools and five helplines. Eleven records cover Eluru city,
21 cover the wider district/nearby area, and two are national services. The
default city filter includes national services; it does not imply every district
institution is in Eluru city.

Five bank entries are held because of legacy/inconsistent information, including
a placeholder example.com link and conflicting PIN code. The electricity entry
is a Visakhapatnam office and needs coverage/provider confirmation. The source's
police link led to an empty NGOs category, so no police listings were invented.
Hospital phone numbers were absent and remain null. Maps links are address
searches, not verified entrance coordinates.

Helpline sources:

- https://eluru.ap.gov.in/helpline/ — district call centre, collectorate and 108.
- https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss — 112.
- https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1703201&lang=2&reg=48 — integrated railway helpline 139. Obsolete railway numbers were not imported.

Source review means the factual listing was found in the cited official source.
It is not a live phone test, inspection, safety certification or confirmation of
opening hours. No source prose, photographs or government logos were copied.
The district website's reproduction policy must be considered before adding
those materials: https://eluru.ap.gov.in/website-policies/.

## Import and maintenance

```sh
# Validate the reviewed manifest without changing the database
node scripts/services/import-eluru.mjs

# Create the table and insert missing records into the configured database
node --env-file=.env.local scripts/services/import-eluru.mjs --apply

# Test curation, filters and phone-link rules
node --test scripts/services/services.test.mjs
```

The transaction requires exactly one active Eluru, Andhra Pradesh city. A unique
city/source key makes reruns safe: existing records are never overwritten.
`import_hash` records the imported payload. Editing the JSON and rerunning does
**not** update existing records: subsequent corrections need an explicit reviewed
database update/migration using the source key. There is no service-editing CMS
screen yet. Never auto-publish questionable records or extend review dates
without checking the source again.

Records store source URL, review date, review due date, coverage and publication
status. Private review notes are excluded from the public query. The initial
review is due again on 16 October 2026. Expired records remain visible with a
review reminder, but their calling links are suppressed on the next page load.

The initial import was applied and rerun: 40 inserts on the first run, zero on
the second. Existing attraction data was not modified. Deploy the application
code to expose `/services` on Vercel; the deployment must use the same database
or run the import against its own configured database first.

This is a growing directory, not all Eluru information. Pharmacy listings,
current bank branches/ATMs, police contacts, transport stops/routes and reliable
opening hours still need source review before publication.
