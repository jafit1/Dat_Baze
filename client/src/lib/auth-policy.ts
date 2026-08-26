// Design philosophy: Minimalist Secure Workspace — access policy stays explicit and credentials never live in client code.
export const ALLOWED_LOGIN_EMAIL = "maxluno47@gmail.com";
export const ALLOWED_LOGIN_USERNAME = ALLOWED_LOGIN_EMAIL.split("@")[0].toLowerCase();
export const PROFILE_DOCUMENT_ID = "settings";

export function isAllowedLoginEmail(email: string) {
  return email.trim().toLowerCase() === ALLOWED_LOGIN_EMAIL;
}

// Maps a login identifier (username or full email) to the internal Firebase email without changing stored data.
export function resolveLoginIdentifier(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("@")) return isAllowedLoginEmail(value) ? ALLOWED_LOGIN_EMAIL : null;
  return value === ALLOWED_LOGIN_USERNAME ? ALLOWED_LOGIN_EMAIL : null;
}
