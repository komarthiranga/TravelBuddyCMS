# Travel Buddy visitor and data audit — 15 September 2026

## Scope and result

Reviewed the public deployment at https://travel-buddy-cms-xi.vercel.app, the local Chrome accessibility tree, published Neon records, application code, and selected online sources. This is an initial audit, not a security certification or complete mobile accessibility test. No production records were modified during this audit.

- 19 active published records, all with working detail pages (HTTP 200).
- 17 of 19 records have no opening/closing hours. EFOUR and Kolleru have hours stored; storage alone does not establish accuracy.
- 18 of 19 records have zero entry fee stored; Kolleru has ₹50. There is no structured, field-level verification evidence attached to these values.
- Home, explore, preselected guide, emergency, manifest and service worker return HTTP 200. Unknown attraction returns 404.
- Food, Hotels and Getting Around return HTTP 200 but display Coming soon.
- Public CMS /attraction returns HTTP 200 with edit links without authentication in the HTTP request. Code review also finds no authentication check in the attraction update action or CMS layout. No mutation/exploit was attempted.
- Ten existing provider/PWA tests passed; TypeScript check passed.
- One concurrent request sample took approximately 0.15–1.63 seconds for the initial route set. This is not a Core Web Vitals, mobile-network or load-test result.

## Fix order

| Priority | Finding | Visitor impact | Acceptance criterion |
|---|---|---|---|
| P0 | CMS has no demonstrated authentication/authorization boundary | Public data and images could be changed without an authorized editor | Protect CMS reads and every server mutation; unauthenticated direct action requests must fail before database/Cloudinary operations |
| P0 | Zero fees become green Free entry badges across restaurants, hotel and unverified places | Visitors may interpret this as free meals/stays or confirmed admission | Unknown is distinct from zero; food and accommodation use relevant pricing labels; only confirmed admission is included in Free entry filtering |
| P1 | No structured verification evidence | Published or photographed can be mistaken for checked | Badge is derived from current source-backed field checks, never publication state or image presence |
| P1 | Conflicting or incomplete place identity, hours and operating status | A newcomer may travel to the wrong location or a closed venue | Resolve flagged listings before promoting them; show specific pending details |
| P1 | Food/Hotels links lead to placeholders although listings exist | User thinks there are no places to eat or stay | Connect these entries to relevant published listings; remove unsupported personal endorsements |
| P1 | Guide directions depend on uncertain coordinates | A precise route can look more trustworthy than its source data | Clearly identify unconfirmed destination pins and route estimates; validate actual entrance for priority venues |
| P2 | Only a single daily opening/closing pair | Split temple hours, weekly closures and holidays cannot be represented accurately | Weekly hours with multiple intervals and exceptions; unknown hours must not imply closed |
| P2 | Directions endpoint lacks an application-level rate limit in reviewed code | Potential provider spend/availability risk | Add rate limits, request bounds and provider budget controls; check deployment firewall separately |
| P2 | Telugu content and interaction coverage incomplete | Language selection may suggest full translation | Test all key tasks in both languages; label content still awaiting translation |

## Proposed verification UX

Use icons **with visible text**, not colour alone:

- **ShieldCheck — Details verified:** identity, location and applicable displayed visiting details have recent evidence, with no unresolved conflict. This means information was checked; it is not a guarantee of personal safety, service quality or secure payments.
- **CircleHelp — Needs confirmation:** default when sufficient evidence is absent. This does not mean the venue is unsafe.
- **Info — Some details checked:** necessary for EFOUR and other partially checked listings. A binary badge would overstate confidence or hide useful progress.
- **TriangleAlert — Details conflict:** use inside the expanded evidence view for disputed fields; keep public copy calm and specific.

Place the status beneath the name in cards and near the heading on details/guide. Its button opens an accessible disclosure or dialog listing checked fields, pending fields, source links, check date and a Report incorrect information action. Avoid hover-only tooltips. Reuse the same status across all surfaces.

Example: **Some details checked** → “Address and hours checked against the venue website. Ride prices and entrance pin still need confirmation.”

Suggested data model: a `place_verification` table referencing attraction ID, with field name, checked value, status, source URL/type, checked_at, review_due_at, reviewer and notes. Keep multiple evidence records, including conflicts. Store photo identity/licence evidence separately. Changing a checked value invalidates its prior verification. Derive listing status rather than manually setting a green flag. Recheck volatile hours/prices more frequently than identity; review periods are editorial policy, not proof the value remains current.

## Online data review queue

Online directories are leads, not proof of current operation. Two OSM-derived sites are not independent corroboration. No record qualifies for a blanket verified shield from this audit alone.

| Listing | Finding and next check |
|---|---|
| Buddha Park | Place identity is described online; current admission, hours and entrance need confirmation. Existing photo does not verify those details. |
| Kolleru Bird Sanctuary | Government tourism confirms the sanctuary and birdwatching context. Stored ₹50 and 10 AM–6 PM were not verified by that source. Identify the intended visitor entrance (a wetland-wide coordinate is insufficient). |
| Venkateswara Swamy Temple, RR Pet | Keep pending; several similarly named temples appear online. Match RR Pet entrance before importing hours from any source. |
| Grand Aryas hotel | Google Hotels and business directory address point to 28-11-1 / TS 465/1, NR Pet. Candidate address requires matching the precise entrance. No verified room tariff. |
| Grand Aryas Food Court | Separate listing from the hotel; confirm dining entrance, hours and menu. Do not inherit hotel tariffs/hours. |
| U.S.Pizza.Co | No reliable exact-venue current source established in this pass. Avoid similarly named outlets in other towns. |
| Milk n More | Official brand site describes milk, meat and grocery delivery; local directory matches the stored KV Hospital Road address. Café classification needs review, not automatic acceptance. |
| Kanakamahalakshmi Devasthanam | Uploaded filename says Ambica Devi. Ambica has its own official temple website in Satrampadu. User designated the image, but independent identity match remains unresolved. Do not claim the image/site proves the Kanakamahalakshmi record. |
| Shivalayam, Vatluru | Map-derived name found; current visiting details and exact photo/location match remain pending. |
| Navayuga Fast Foods | Zomato and Swiggy corroborate Narasimharaopet near the overbridge. Good candidate for address review; menu prices are variable and not an admission fee. |
| Punnami Family Restaurant | Zomato's similarly named Punnami Unlimited listing says temporarily closed. Confirm it is the same venue and whether this means online ordering or physical closure before changing operational status. |
| EFOUR | Official website address/hours were checked in the preceding data update. Free entry and ₹400–₹600 combos came from user information, not confirmed official pricing. Partial verification only. |
| Vihari Robo Restaurant | Sources differ between Powerpet Station Road and Chunduri Vari Street/Old Bus Stand. Resolve branch/address/pin before a verified badge. |
| Siva Grand | An apparent official result is in Dindigul, not Eluru; rejected as evidence. Eluru identity/hours remain pending. |
| Brundavan Park | Mapcarta/Pacer list Mon–Sat 7 AM–8 PM; Waze lists evening hours 5–10 PM. Do not select one arbitrarily. |
| Laymens Evangelical Fellowship Church | Map-derived presence found; public service times/visitor access not verified. |
| El-Shaddai Prayer House | A local directory identifies Powerpet; similarly named ministry sites cannot be assumed to be this branch. Service times pending. |
| Maha Lakshmi Devi Temple | User supplied Sowbhagya Laxmi image; online references place Sowbhagya in Satrampadu/Vatluru, while stored record is Eluru–Kaikaluru Road. Identity/pin needs resolution. |
| Sai Baba Temple | User confirmed photo. Eastern Street listing differs from stored road wording; independently verify exact pin/address before status upgrade. |

## Sources reviewed

- EFOUR: https://www.efour-eluru.com/contact (client-rendered; earlier official public bundle review confirmed address and daily 9 AM–11 PM).
- Kolleru: https://www.incredibleindia.gov.in/en/festivals-and-events/andhra-pradesh/kolleru-bird-festival
- Milk n More: https://milknmore.org/
- Local Milk n More: https://www.justdial.com/Eluru/MnM-Milk-N-More-LLP-K-V-Hospital-Ramachandra-Rao-Peta/9999P8812-8812-210309123545-M6L3_BZDET
- Ambica temple: https://ambicatemple.com/contactus.htm
- Grand Arya: https://www.dnb.com/business-directory/company-profiles.hotel_grand_arya.9e4e085857b81b89c431738040f36bec.html
- Navayuga: https://www.zomato.com/eluru/navayuga-fast-foods-eluru-locality/order and https://www.swiggy.com/city/eluru/navayuga-fast-foods-nr-pet-powerpet-rest335594
- Punnami: https://www.zomato.com/cs/eluru/punnami-unlimited-family-restaurant-eluru-locality/menu
- Vihari: https://fuddo.in/local/vihari-robo-restaurant-eluru?action=select_time&menu_page=true and https://magicpin.in/Eluru/Eluru/Restaurant/Vihari-Robo-Restaurant/store/38c152
- Brundavan: https://mapcarta.com/W675621766 and https://www.waze.com/id/live-map/directions/in/ap/eluru/brundavan-park?to=place.ChIJ4YHejLUUNjoRxsdHVsIQXJw
- Sai Baba: https://www.justdial.com/Eluru/Shirdi-Sai-Baba-Temple-Eastern-Street/9999P8812-8812-171206042501-N6D3_BZDET
- Laymens: https://mapcarta.com/W683494761

## Remaining test coverage

Not yet validated hands-on: mobile widths and landscape, 200% zoom, keyboard search selection/Escape, saved-place persistence, location denied/unavailable, guide scrolling and focus, live route accuracy, screen-reader announcements, contrast, Telugu rendering, install/update on Android/iOS, offline on a physical phone, Core Web Vitals and load behaviour. Native Chrome exposed the local page accessibility tree, but browser-tab automation was unavailable; do not mark these tasks passed from code inspection.

Next execution sequence: (1) protect CMS, (2) add evidence-backed verification and correct pricing semantics, (3) resolve venue identity/operating-status conflicts, (4) connect incomplete navigation, (5) execute the remaining mobile/visitor regression matrix before release.
