// Design philosophy: Minimalist Secure Workspace — access policy stays explicit and credentials never live in client code.
export const ALLOWED_LOGIN_EMAIL = "maxluno47@gmail.com";
export const PROFILE_DOCUMENT_ID = "settings";

export function isAllowedLoginEmail(email: string) {
  return email.trim().toLowerCase() === ALLOWED_LOGIN_EMAIL;
}

