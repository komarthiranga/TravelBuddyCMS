# Travel Buddy PWA

The app manifest supports standalone home-screen installation with 192px, 512px,
and maskable icons. Installation guidance appears before the public-site footer
and hides when running standalone. Supported browsers can offer an install button;
iPhone/iPad users get Safari Share → Add to Home Screen instructions.

The service worker registers only in production over HTTPS (localhost also works).
It caches only `/offline.html`. Public document navigation uses the network and
falls back to that screen on network failure. API calls, CMS routes, mutations,
RSC navigation and venue responses are never cached by this worker. There are no
push notifications, background location tracking or downloaded offline maps.
An offline status banner explains the connection requirement within open pages.

Run `node --test scripts/pwa/service-worker.test.mjs` and
`npm run build -- --webpack` to validate. Manifest, icon dimensions, worker headers
and offline screen were checked through a local production server. Physical-device
installation, standalone display and airplane-mode behaviour still need testing
on Android Chrome and iOS Safari after HTTPS deployment. Nothing was deployed.
