# Food and Hotels browsing

`/food` and `/hotels` now use the shared `PlacesCollection` server component with the current city selection. They show only active published food/stay listings. The database applies the collection restriction before counts, pagination and autocomplete suggestions; changing a category query parameter cannot expose records from another collection. Grocery delivery is excluded from dining results.

The shared component preserves verification disclosures, pricing semantics, saved-place buttons, distance controls, search, category filters, empty states and pagination. Search form actions, autocomplete selection, reset and pagination keep the current route. Food and Hotels omit the admission fee filter. Open now continues to require verified opening hours and explains that unknown hours are excluded. Empty search results do not mean a venue is closed.

All places/Food/Hotels navigation is available across these listing pages. Mobile Explore stays active on both collections. Hotel copy explains that availability, room rates and booking need confirmation directly with the property. No booking or reservation integration was introduced. Getting Around remains a separate outstanding step.

No database changes are needed for this step. Deployment is required to replace the production placeholders. TypeScript, lint, production build and read-only HTTP regressions cover normal listings, search, empty states and cross-category filtering. Keyboard autocomplete interaction and mobile visual checks still need browser verification.
