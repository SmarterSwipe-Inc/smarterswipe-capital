/**
 * Admin authentication module — separate from Manus OAuth.
 * Uses email/password with bcrypt hashing and a dedicated JWT cookie.
 */
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import { ADMIN_COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./_core/env";
import { getAdminByEmail, upsertAdminCredential } from "./db";

/** Whitelisted admin emails */
const ADMIN_EMAILS = [
  "jonah@smarterswipe.com",
  "eric@smarterswipe.com",
  "billy@smarterswipe.com",
];

export type AdminSessionPayload = {
  adminId: number;
  email: string;
  name: string;
};

function getAdminSecret() {
  // Use JWT_SECRET with a prefix to keep admin tokens distinct
  return new TextEncoder().encode("admin:" + ENV.cookieSecret);
}

/** Sign a new admin session JWT */
export async function signAdminSession(payload: AdminSessionPayload): Promise<string> {
  const issuedAt = Date.now();
  const expiresInMs = ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

  return new SignJWT({
    adminId: payload.adminId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getAdminSecret());
}

/** Verify an admin session JWT from the cookie */
export async function verifyAdminSession(
  cookieValue: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!cookieValue) return null;

  try {
    const { payload } = await jwtVerify(cookieValue, getAdminSecret(), {
      algorithms: ["HS256"],
    });
    const { adminId, email, name } = payload as Record<string, unknown>;

    if (typeof adminId !== "number" || typeof email !== "string" || typeof name !== "string") {
      return null;
    }

    return { adminId, email, name };
  } catch {
    return null;
  }
}

/** Extract admin session from a request */
export async function getAdminFromRequest(req: Request): Promise<AdminSessionPayload | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[ADMIN_COOKIE_NAME];
  return verifyAdminSession(token);
}

/** Validate admin login credentials */
export async function validateAdminLogin(
  email: string,
  password: string
): Promise<{ success: true; admin: AdminSessionPayload } | { success: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check whitelist
  if (!ADMIN_EMAILS.includes(normalizedEmail)) {
    return { success: false, error: "Access denied" };
  }

  const admin = await getAdminByEmail(normalizedEmail);
  if (!admin) {
    return { success: false, error: "Account not found. Please contact an administrator to set up your account." };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid password" };
  }

  return {
    success: true,
    admin: {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
}

/** Hash a password for storage */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Check if an email is in the admin whitelist */
export function isWhitelistedAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/** Seed initial admin accounts (call once to set up) */
export async function seedAdminAccount(
  email: string,
  password: string,
  name: string
): Promise<void> {
  if (!isWhitelistedAdmin(email)) {
    throw new Error(`Email ${email} is not in the admin whitelist`);
  }

  const passwordHash = await hashPassword(password);
  await upsertAdminCredential({ email, passwordHash, name });
}
