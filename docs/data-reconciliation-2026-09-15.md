# Eluru reconciliation — 15 September 2026

Applied five reviewed record updates to configured Neon using `scripts/verification/reconcile-eluru.mjs --apply`. The script defaults to dry run, checks existing names/descriptions before overwriting, runs in a transaction, and saved previous records at `/tmp/travel-buddy-reconciliation-1789470981496.json`. All publication states, photos, map coordinates and fee values were preserved.

| Listing | Applied correction | Remaining uncertainty |
|---|---|---|
| Navayuga Fast Foods | Replaced placeholder street address with 662, 26th Division, near the overbridge, Narasimharao Pet, Eluru. Added name/address evidence from Zomato and an informative summary. | Entrance pin, opening hours and operational status not verified. Badge remains partial. |
| Milk n More | Category changed from Cafe to Milk & grocery delivery; summary explains delivery/pickup distinction. Product price wording and shopping icon added. | Official brand address in Denduluru is not substituted for the stored local outlet address. Pickup, walk-in access and outlet hours need confirmation. |
| Punnami | Summary asks visitors to confirm dine-in service; evidence records online-ordering uncertainty. | Search snippet described temporary closure, but direct page showed online ordering unavailable. Neither establishes physical closure or exact identity match. No closed flag set. |
| Brundavan Park | Summary and conflict evidence explain differing hours. | Mapcarta lists Monday–Saturday 7 AM–8 PM; Waze lists 5–10 PM. No hours selected arbitrarily. |
| Vihari Robo Restaurant | Summary and pending address note explain differing street descriptions. | Powerpet Station Road and Chunduri Vari Street may describe alternate approaches or separate entries; pin not independently matched. |

Sources checked:

- https://www.zomato.com/eluru/navayuga-fast-foods-eluru-locality/order
- https://www.swiggy.com/city/eluru/navayuga-fast-foods-nr-pet-powerpet-rest335594 (search result corroborates locality; direct page required JavaScript verification)
- https://milknmore.org/
- https://www.zomato.com/cs/eluru/punnami-unlimited-family-restaurant-eluru-locality/menu
- https://mapcarta.com/W675621766
- https://www.waze.com/id/live-map/directions/in/ap/eluru/brundavan-park?to=place.ChIJ4YHejLUUNjoRxsdHVsIQXJw
- https://fuddo.in/local/vihari-robo-restaurant-eluru?action=select_time&menu_page=true
- https://magicpin.in/Eluru/Eluru/Restaurant/Hotel-Adithya-Prince-International-Vihari-Robo-Restaurant/store/20175ac

The user replied “Same” to the temple photo/identity question. Kept the user-designated Kanakamahalakshmi and Maha Lakshmi photo matches; this is user confirmation, not independent map-pin verification. Grand Arya and the temple entrance addresses remain in the review queue; no address was guessed from a similarly named venue.

Verification disclosures now include applicable current pending/conflict notes with source links and dates. They never count as verified checks. Notes expire, and changing their associated field hides obsolete notes. English editorial notes are tagged `lang=en` in the Telugu interface. The new grocery category is excluded from admission filtering and uses Check product prices.

These database edits are immediately available to applications using this Neon branch. The updated badge-note/product-price UI requires deploying the local code. No deployment performed in this step.
