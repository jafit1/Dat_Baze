# Design Direction — Personal Account Vault

## Three possible directions

### Theme Name: Minimalist Secure Workspace
A bright, quiet workspace that makes sensitive actions feel deliberate through whitespace, soft depth, and a single electric-blue signal color.
**Probability:** 0.07

### Theme Name: Paperless Control Room
A more editorial interface inspired by filing systems, index cards, and annotated records, with warm paper tones and disciplined typography.
**Probability:** 0.03

### Theme Name: Blue Hour Sentinel
A dark, high-contrast security console with luminous blue states for users who prefer a more technical atmosphere.
**Probability:** 0.09

## Chosen approach: Minimalist Secure Workspace

### Design Movement
Contemporary Swiss product minimalism blended with calm privacy-tool ergonomics: structured, legible, and intentionally quiet rather than decorative.

### Core Principles
1. White space is a security affordance: sensitive controls are never visually crowded.
2. Blue is reserved for trust, active state, and deliberate action.
3. Soft depth replaces heavy borders; cards feel layered but never ornamental.
4. Every destructive or security-sensitive action exposes its consequence before completion.

### Color Philosophy
The canvas stays close to pure white so account data remains the visual focus. #1FACFF is the ownable signal for secure actions, focus, active navigation, and healthy vault state. Ink navy is used for primary reading; cool gray-blue supports metadata and structure. Warning colors appear only for lock, deletion, or export risk.

### Layout Paradigm
A persistent left navigation rail anchors the product on desktop, while content opens into a wide, asymmetric workspace: compact summary metrics on the left, a broad account collection on the right, and contextual drawers for editing. On mobile, the rail becomes a top bar and filters become horizontally scrollable controls.

### Signature Elements
- A slim blue security rail and small shield-key mark used as a persistent brand cue.
- Softly elevated account rows with service initials, tag pills, and copy actions revealed on hover/focus.
- A live vault-status capsule with a small lock pulse and auto-lock countdown.

### Interaction Philosophy
Interactions should feel reversible and explicit. Copy, reveal, lock, import, export, and delete actions give immediate visual confirmation with short, calm transitions. Sensitive values stay hidden by default, and keyboard focus is always visible.

### Animation
Use 160–220ms ease-out transitions for hover, drawers, and popovers. Account rows enter in a 40ms stagger only when first loaded. TOTP progress updates continuously but without layout jumps. The lock overlay fades and scales from 0.97 to 1. Reduced-motion users receive opacity-only transitions.

### Typography System
Use Manrope for headings and UI labels, paired with DM Sans for body copy and account metadata. Headings use medium or semibold weights with compact tracking; body text uses regular or medium weights and generous line-height. Sensitive values use a monospace fallback only when explicitly revealed.

### Brand Essence
A private, browser-first account vault for people who want password management to feel calm, transparent, and under their control — without sacrificing everyday speed.
**Personality:** calm, precise, protective.

### Brand Voice
Headlines are clear and quietly confident. CTAs describe the action instead of using vague growth language. Microcopy explains risk without alarmism.

Example lines:
- “Your vault is quiet, current, and ready.”
- “Export a protected copy before you make a major change.”

### Wordmark & Logo
Use the generated shield-key symbol as the mark. Pair it with the custom wordmark “vaultmark” in Manrope semibold with slightly expanded tracking and a deliberate lowercase form; never use the product name as an unstyled default heading.

### Signature Brand Color
**Vault Blue — #1FACFF.** It is bright enough to guide attention on white without feeling aggressive, and reserved enough to become a recognizable trust signal.

## Implementation Notes

- Generated visual fallbacks used by the auth and empty states are bundled under `client/public/assets/` as `vaultmark-logo.svg`, `vault-pattern.svg`, and `vault-empty-state.svg`, so the Vercel build does not require the Manus storage proxy.
- Firebase configuration is read from `VITE_FIREBASE_*` environment variables. Firebase Web API keys are identifiers, not encryption keys; the Master Password is never persisted or transmitted.
- Firestore document fields contain encrypted payloads only. Security Rules must enforce `request.auth.uid == userId`.
- The prototype UI includes a clear configuration state when Firebase variables are not yet provided, rather than pretending to be connected.

## Style Decisions

- Auth screens carry a visible shield-key wordmark, one slim Vault Blue security rail, and a calm encryption-status capsule.
- The vaultmark lockup uses lowercase Manrope semibold with deliberate tracking and is treated as a unified mark-plus-wordmark, not a generic label.
- Vault Blue #1FACFF appears only for trusted action, active security state, and verification cues.
- The auth surface repeats the shield-key, rail, and status-capsule language as one coherent Vaultmark signature; secondary copy stays neutral so Vault Blue remains a trusted signal.
- Auth screens keep the sign-in form as the primary task; the reassurance panel is quieter product evidence with restrained display type.
- Vault Blue stays concentrated in the primary action, rail, lock, status capsule, and verification cues; large surfaces remain white or cool-neutral.
- Security decoration uses a disciplined grid and record-like geometry instead of an atmospheric hero treatment.
