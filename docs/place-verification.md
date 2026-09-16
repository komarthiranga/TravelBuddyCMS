# Place verification and pricing

The public UI derives status from `place_verification`, not publication status, photos, descriptions or a zero fee. Run `node --env-file=.env.local scripts/verification/setup.mjs` once per database before deploying this code. The script is idempotent and adds a table/index; it does not rewrite place fees or publication status. It has been run against the configured Neon database.

Each review stores attraction ID, field, exact reviewed JSON value, status, HTTPS source URL, reviewer, checked date, review due date and notes. Supported fields: name (string), address (string), coordinates ([latitude, longitude] strings), hours ([opening, closing] HH:MM:SS strings), admission ([fee, currency] strings). Null/missing hours or admission cannot be verified. Keep review history; a newer pending/conflict record supersedes older evidence. Dates are checked at page request time. Changing a field makes its old evidence inapplicable; expiry also removes the check. Existing open pages update on refresh/navigation.

Public states:

- ShieldCheck: Details verified — all required fields currently match evidence.
- Info: Some details checked — at least one current matching check.
- CircleHelp: Needs confirmation — no applicable current checks.

Required fields are name, address, map pin and hours, plus admission for sightseeing/worship venues. Food and accommodation never use admission as menu/room pricing. The badge explains source links, check dates and pending fields. It explicitly does not guarantee venue safety. Editorial prose and images still need separate review; a badge must not be interpreted as endorsement of every descriptive claim.

Only EFOUR address and daily hours have been seeded, from the official public website reviewed on 14 September 2026. They expire on 14 October 2026. The entry price and coordinates remain unverified; no venue was given a blanket green shield. Other listings remain pending. No image licence claims are inferred.

Prices: restaurants/cafés/quick bites show Menu prices vary; hotels show Check room rates; other places show Entry fee not confirmed until admission evidence matches. This applies to detail display and structured-data `isAccessibleForFree`, as well as cards. Free entry filtering requires matching, unexpired admission evidence and excludes food/stay categories. Open now filtering likewise requires current hours evidence. Both filters use the same newest-review precedence as the display. Holiday exceptions and weekly/split hours remain a later improvement.

Review records currently require an administrator-run SQL/script update; an authenticated CMS evidence editor is not part of this step. Do not simply copy a current DB field into verified evidence: check the source and record the value the source actually supports. The new table is queried in one batch per set of displayed places; no provider API requests are made for badges.

Tests: `node --test scripts/verification/model.test.mjs`. Covers unknown versus zero, partial/full/expired checks, changed fields, newer conflicts, food/stay pricing and unsafe sources. Production HTTP checks cover detail/card/filter integration. Native disclosure interactions, mobile and Telugu visual review still need a browser check.
