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

## Allowed account and first-password policy

The client access policy allows only `maxluno47@gmail.com`. Do not place the initial password in this repository, Vercel environment variables, or frontend code because all `VITE_*` values are visible in the browser. Create or reset the Firebase Authentication user manually in Firebase Console with the initial password agreed by the administrator, then sign in once. Vaultmark creates `users/{uid}/profile/settings` with `mustChangePassword: true` and blocks vault access until the user chooses a new password of at least eight characters. After the change succeeds, the profile flag is set to `false`.

For a production-grade policy, disable public email/password registration in Firebase Authentication and keep the allowlist in sync with the Firebase user records. The frontend allowlist is a UX and access gate; Firebase Authentication and Firestore Rules remain the authoritative security controls.

After the first Vercel deployment, add the Vercel production and preview domains to Firebase Authentication's authorized domains. If a custom domain is added later, add that domain as well.

## Firebase Authentication preflight

Before testing the login form, open **Firebase Console → Security → Authentication → Sign-in method**, enable **Email/password**, and save the provider. Then open **Authentication → Settings → Authorized domains** and add every host used to open the app, including `dat-baze.vercel.app`, any Vercel preview host used for testing, and `localhost` for local development. If Email/password is disabled or the project has no active Authentication configuration, Firebase can return `auth/configuration-not-found`; Vaultmark surfaces that condition instead of attempting a local or demo login.

The client code calls `signInWithEmailAndPassword` and `createUserWithEmailAndPassword` only after Firebase is initialized. A failed Firebase configuration never unlocks the vault.

## Cloud Firestore preflight

Before the first login or registration, open **Firebase Console → Build → Firestore Database** for project `dat-baze` and create/enable the database if it does not exist. Also verify that **Cloud Firestore API** is enabled for the same Google Cloud project. If the API is disabled, Firebase Authentication can still create a session but reads of `users/{uid}/profile/settings` fail with `Failed to get document because the client is offline`. Vaultmark keeps the vault locked, times out the request after 12 seconds, and shows a retry screen instead of bypassing the policy.

After enabling Firestore, publish the accompanying `firestore.rules`, reload `https://dat-baze.vercel.app`, and retry. The first successful session creates the user-owned `users/{uid}/profile/settings` document; no password, master key, or vault ciphertext is written to that document.

## Google Sign-In, profile, and audit log

For Google Sign-In, enable **Google** in **Firebase Console → Authentication → Sign-in method** after completing the Google Auth Platform branding flow. The application still enforces the `maxluno47@gmail.com` allowlist after the popup returns, so a Google account outside the allowlist is signed out and cannot open the vault. Keep `dat-baze.vercel.app` and every preview hostname used for testing in Authorized domains.

The profile surface reads Firebase account metadata and the user-owned `users/{uid}/profile/settings` document. Login and logout records are written only to `users/{uid}/activity/{eventId}` and contain event type, provider method, timestamp, user agent, and email; they never contain passwords, master keys, or vault ciphertext. Deploy the accompanying `firestore.rules` after enabling the feature. The rules allow the authenticated owner to read their own activity and create validated `login`/`logout` records, while updates and deletes are denied.

## Deployment settings

Vercel can import the repository directly from GitHub. The repository uses `pnpm-lock.yaml`, so Vercel should detect pnpm automatically. The explicit settings are:

```text
Build command: pnpm build
Output directory: dist/public
Install command: pnpm install --frozen-lockfile
```

The former Manus runtime, debug collector, and storage proxy are no longer part of the Vite configuration. The three original Manus storage image paths are preserved through Vercel rewrites to bundled SVG fallbacks under `client/public/assets/`, so the external build does not depend on the Manus storage proxy.
