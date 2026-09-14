# Eluru import and launch status

Target interpreted as 20 total Eluru records, not 20 per category. Imported and
verified 20 new DRAFT records in Neon on 2026-09-14, with 20 distinct source links.
Google/Foursquare commercial API data was not copied into Neon.

Imported categories: 6 restaurants, 1 cafe, 1 quick-bites venue, 1 hotel, 2 parks,
8 religious places, and 1 attraction. Excluded the questionable "Telugu" entry.
No photos uploaded or records published. Unknown fees are NULL; the database
entry_fee column now permits NULL and place_source was created by the transaction.

## Tables

Keep city, category, attraction and attraction_image for the first release.
The existing category_type can distinguish attractions, restaurants and stays.
A generic place table rename can wait. Add place_source for source ID, license,
source URL, raw source record, import timestamp and repeat-import deduplication.
The importer creates this table transactionally. A matching Drizzle schema and
nullable-fee UI/form changes are still required before publishing imported data.

Do not store unknown fees as zero. The importer allows null entry_fee and inserts
null for all unverified fees. It does not infer hours, routes, ratings or photos.

## Import tool

`node --env-file=.env.local scripts/imports/eluru.mjs --file=/path/to/overpass.json`

Dry run validates a genuine Overpass JSON export, filters the Eluru bounding box,
checks basic names/types/coordinates, deduplicates source IDs and normalized names,
and lists 20 candidates. Fewer than 20 valid candidates aborts with no writes.

Add `--apply` after reviewing the dry run. Inserts drafts and categories in one
transaction, skips existing source IDs or exact-name matches, and preserves existing
records. Skipping existing records may mean fewer than 20 new inserts. No automatic
publishing. Cross-source spelling variants still require review. Bbox is an Eluru
area approximation, not the administrative boundary.

OpenStreetMap data requires attribution and ODbL compliance, including applicable
derivative-database sharing. Before publication add visible attribution, a license
link and access to the imported derivative extract. Foursquare OS data is another
option but now needs separate portal access; API keys do not unlock the download.

## Images

Use an explicitly labelled generic illustration ("Photo coming soon") rather than
an unrelated venue photograph. Existing no-photo placeholders avoid Cloudinary
uploads. No source photo needs to be copied. A shared designed placeholder can be
added later without changing place records.

## Public launch blockers

- CMS has no authentication; protect both admin reads and all server mutations.
  Do not rely on hiding links or layout-only checks. Alternatively disable CMS in
  production and keep the import tool private until proper auth is configured.
- Imported rows must stay drafts until source, duplicates and Eluru locality are
  reviewed. Emergency contacts need authoritative verification, not seed guesses.
- Food/hotel pages currently remain coming-soon; wire them to their category types
  before presenting imported restaurants/stays as usable public sections.
- Complete unknown-fee handling, source attribution and the ODbL extract.
- Visual mobile/keyboard checks and a final production build remain necessary.
- No deployment has been performed.

## Download completed (2026-09-14)

Downloaded 495 named map records to `data/imports/eluru-overpass.json` using a
simplified primary-server GET request and a meaningful application User-Agent.
The importer dry run succeeded and selected 20 candidates. This is structural
validation, not verification that each venue is suitable for publication.
For example, the attraction named "Telugu" is questionable; "Hospital Canteen"
and "Chapel" are generic names, and EFOUR has both node and way representations.
The subsequent authorized import excluded "Telugu" and saved 20 places as drafts.
Generic names and classifications still need local review before publication.

Repeat the download from the project root with:

```sh
node scripts/imports/download-eluru.mjs
node --env-file=.env.local scripts/imports/eluru.mjs --file=data/imports/eluru-overpass.json
```

The downloader has timeouts, an alternative server, and validates responses before
replacing the saved export. It never connects to Neon. Both scripts passed Node
syntax checks; the importer was also run successfully against the downloaded file.
