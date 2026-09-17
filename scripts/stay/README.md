# Stay directory

`/hotels` reads published rows from the `stay` table, scoped to the selected city.
The initial three Eluru properties were checked online on 17 September 2026.
Sources, phone numbers, addresses, coordinate provenance and review dates are
stored with each record and exposed in the card's source disclosure.

## Database setup

Run before deploying the page to a different database:

```sh
node --env-file=.env.local scripts/stay/import.mjs
node --env-file=.env.local scripts/stay/import.mjs --apply
```

The import validates the seed, creates the table/index in a transaction and
inserts only missing `(city_id, slug)` records. Re-running does not overwrite
editorial changes. `schema.sql` is the versioned table definition. The import
requires exactly one active Eluru, Andhra Pradesh city record.

Supported kinds: `hotel`, `oyo`, `hostel`, `room`. Only hotels have seed data;
OYO affiliations and other accommodation listings have not been verified.
Publishing more records is currently a database operation; no Stay CMS editor
is included in this first slice.

## Location and routes

The existing location store requests browser permission and refreshes cached
locations. City-centre distances are an explicitly selected fallback. Nearest
sorting uses straight-line distance; each card labels this separately from
route kilometres. Coordinates for Adithya are the hotel's embedded map reference
point; the user is prompted to confirm its entrance in Maps.

Cards use `/api/directions`. With a configured Google Maps Directions key and
provider coverage, walking and transit routes can be returned. The existing OSRM
fallback supports driving only. Without walking/transit coverage the card says
“Check in Maps” and links to the correct travel mode rather than inventing a
route. Auto uses driving distance and duration, not an auto-specific route or
fare. Times are approximate; no live traffic or fare promise is made.

## Checks performed

- TypeScript and focused ESLint checks.
- Existing direction-handler tests (invalid input and upstream failures).
- Browser checks at desktop and 390px mobile widths, with no overflow or errors.
- Database-backed rendering of all three hotels, name search, empty states,
  city-centre fallback, simulated browser location, nearest sorting, and map
  links carrying the selected origin.

## Dates and guests

Home and `/hotels` accept `checkin`, `checkout`, `guests`, and `rooms` query
parameters. Defaults are today's date in Asia/Kolkata, tomorrow, one adult and
one room. The shared form supports 1–16 adults, up to one room per adult,
check-in within a year and stays of 1–30 nights. Children and longer stays are
referred to the property until an occupancy-aware provider is connected.

Selections persist in shareable URLs and the home/directory cross-links.
Invalid URL values normalise to valid defaults; browser form validation also
rejects invalid date ranges. Availability is not inferred from these selections.
Cards show price unavailable for the selected dates. Per-person pricing is
explained as total quoted stay cost divided by nights and adults; no historical
rate is substituted for a current offer.

Run `node --test scripts/stay/search.test.mjs` for calendar, timezone, validation
and URL round-trip tests.

## Custom calendar and Food handoff

Stay date fields use an in-app range calendar on both `/` and `/hotels`.
Past arrivals and departures beyond 30 nights are disabled. Arrow keys move
between days; Home/End move within the week. Apply dates updates the draft;
Search stays commits dates and guests to the URL. Closing discards calendar edits.

Food is available at `/food` and through the site-wide Stay · Eat · Travel · Essentials · Explore · Get help navigation. It reuses
published food attractions, existing verification evidence and the shared location
and directions services. No new database table or import is needed. Category and
name/area filters operate on the selected city's listings. Prices, dietary claims
and live opening status are not inferred from the legacy admission-fee field.
