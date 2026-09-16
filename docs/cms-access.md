# CMS administrator access

The CMS is for a single administrator. Public travel pages require no sign-in. Routes `/attraction`, `/category`, `/city` and their descendants use HTTP Basic authentication. Every CMS data function and server action independently checks credentials, including actions invoked outside the protected route.

## Configure

Set these **server-only** variables in `.env.local` and separately in each Vercel environment that needs CMS access:

```dotenv
CMS_ADMIN_USERNAME=editor
CMS_ADMIN_PASSWORD=<a randomly generated password of at least 32 characters>
```

Generate a password locally with `openssl rand -hex 32` and store it in a password manager. Do not use the literal placeholder, reuse an existing password, or prefix either variable with `NEXT_PUBLIC_`. Password must be 32–256 printable ASCII characters without spaces; username supports letters, digits, `.`, `_`, `@`, `-` (up to 100 characters).

Restart the local server after configuration. Add credentials to Vercel and redeploy to protect the live site; local changes do not update production. Without valid configuration, CMS routes return 503 and mutations are denied. There is deliberately no development bypass or default password.

Visit `/attraction` and enter the credentials in the browser's sign-in prompt. Use HTTPS on the deployed site: Basic authentication encodes credentials but does not encrypt them independently of TLS. Localhost HTTP is for local development only. Use a private browser window for CMS work; close it to discard browser-cached credentials. Rotating the configured password and redeploying revokes the previous credentials. This first-stage gate has no individual accounts, MFA or reliable in-app logout. Use a managed identity provider before adding multiple editors, and add deployment-level rate limiting for login attempts.

The proxy returns `private, no-store` and `noindex, nofollow` for CMS responses. The existing public PWA worker excludes CMS requests. Next.js Server Action origin protections remain enabled; do not broaden allowed origins without review. The guard ignores client-supplied role/authenticated headers.

## Checks

`node --test scripts/security/cms-auth.test.mjs` checks exact credentials, malformed input, weak/missing configuration, password rotation, forged role headers and all 34 CMS async entry points failing before access to dependencies. Run TypeScript and the production build as well.

HTTP regression: missing configuration → 503; configured but missing/wrong credentials → 401 with browser challenge; valid credentials → CMS page; public pages stay accessible; invalid direct mutations cannot reach the data layer. Do not submit destructive production forms to test access control.
