# SEO launch setup

The default public origin is `https://travel-buddy-cms-xi.vercel.app`.
When a custom domain is connected and HTTPS is working, set the server-side
`SITE_URL=https://your-domain.example` in Vercel Production and redeploy.
Use only an HTTPS origin, without paths or credentials. Do not use a preview URL.

Implemented:
- `/robots.txt`: public crawling, CMS/API exclusions, sitemap reference. Preview deployments disallow crawling.
- `/sitemap.xml`: public static routes plus published, active attraction records in active cities. Last-modified dates come from the database, not the current request time.
- Canonicals and descriptions on public pages; pagination gets its own canonical. Search and filter combinations use `noindex, follow` and are excluded from the sitemap.
- `/share-image`: branded 1200 × 630 social image. Individual place pages use their own image when available.
- Preview metadata is `noindex`; existing CMS authentication and noindex response headers remain in place. Robots exclusions are not authentication.

Account steps still needed:
1. Copy `CMS_ADMIN_USERNAME` and `CMS_ADMIN_PASSWORD` from the ignored local `.env.local` into Vercel Production environment variables. Store the password securely; never commit it or prefix it with `NEXT_PUBLIC_`.
2. Deploy the code and verify anonymous CMS requests return 401, not 200 or 503. Check sign-in in a private browser window.
3. After choosing a domain, add both apex and www to Vercel, follow the DNS values shown for this project, redirect to the preferred hostname, set SITE_URL, and redeploy. Redirect the old production hostname while preserving paths; avoid accidentally redirecting preview deployments.
4. Verify a Domain property in Google Search Console using Google's DNS TXT record. Submit `/sitemap.xml`, then inspect the homepage and a place URL.

Future content work: the current city selector is cookie-based and Telugu is a
client-side language toggle. City-specific and translated search landing pages
need stable URLs and genuine translated content before adding hreflang. Do not
claim separate Telugu indexing from the existing toggle alone.

No ranking guarantees, invented reviews, or unsupported price/hours data have
been added. Place evidence checks remain independent of SEO metadata.
