import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getAdminFromRequest, type AdminSessionPayload } from "../adminAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminSession: AdminSessionPayload | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminSession: AdminSessionPayload | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  try {
    adminSession = await getAdminFromRequest(opts.req);
  } catch {
    adminSession = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminSession,
  };
}
