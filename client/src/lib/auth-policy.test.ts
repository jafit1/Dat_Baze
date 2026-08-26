import { expect, it } from "vitest";
import { ALLOWED_LOGIN_EMAIL, ALLOWED_LOGIN_USERNAME, resolveLoginIdentifier } from "./auth-policy";

it("memetakan username/email yang diizinkan ke akun internal", () => {
  expect(ALLOWED_LOGIN_USERNAME).toBe("maxluno47");
  expect(resolveLoginIdentifier("MaxLuno47")).toBe(ALLOWED_LOGIN_EMAIL);
  expect(resolveLoginIdentifier("  maxluno47@gmail.COM ")).toBe(ALLOWED_LOGIN_EMAIL);
});

it("menolak identifier tidak dikenal", () => {
  expect(resolveLoginIdentifier("")).toBeNull();
  expect(resolveLoginIdentifier("admin")).toBeNull();
  expect(resolveLoginIdentifier("other@gmail.com")).toBeNull();
});
