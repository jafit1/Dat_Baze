# Vercel deployment

Vaultmark is configured as a static Vite application for Vercel. The build output is `dist/public`, and `vercel.json` provides the SPA fallback required by the Wouter client-side routes.

## Required Vercel environment variables

Create the following variables in the Vercel project settings for every environment that should access Firebase:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

These are browser configuration values, not a replacement for security controls. Keep Firebase Authentication enabled and deploy Firestore Security Rules that restrict reads and writes to the authenticated user's own document path.

After the first Vercel deployment, add the Vercel production and preview domains to Firebase Authentication's authorized domains. If a custom domain is added later, add that domain as well.

## Deployment settings

Vercel can import the repository directly from GitHub. The repository uses `pnpm-lock.yaml`, so Vercel should detect pnpm automatically. The explicit settings are:

```text
Build command: pnpm build
Output directory: dist/public
Install command: pnpm install --frozen-lockfile
```

The former Manus runtime, debug collector, and storage proxy are no longer part of the Vite configuration. The three original Manus storage image paths are preserved through Vercel rewrites to bundled SVG fallbacks under `client/public/assets/`, so the external build does not depend on the Manus storage proxy.
