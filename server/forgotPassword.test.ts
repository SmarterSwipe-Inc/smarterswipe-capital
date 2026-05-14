import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the email module
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-email-id" }),
}));

// Mock the db module
vi.mock("./db", () => ({
  getAdminByEmail: vi.fn().mockImplementation((email: string) => {
    if (email === "jonah@smarterswipe.com") {
      return Promise.resolve({
        id: 1,
        email: "jonah@smarterswipe.com",
        passwordHash: "$2b$12$mockhash",
        name: "Jonah",
      });
    }
    return Promise.resolve(undefined);
  }),
  updateAdminPasswordHash: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createApplication: vi.fn(),
  listApplications: vi.fn().mockResolvedValue([]),
  getApplicationById: vi.fn(),
  updateApplicationStatus: vi.fn(),
  upsertAdminCredential: vi.fn(),
}));

// Mock adminAuth
vi.mock("./adminAuth", () => ({
  validateAdminLogin: vi.fn().mockResolvedValue({
    success: false,
    error: "Invalid password",
  }),
  signAdminSession: vi.fn().mockResolvedValue("mock-admin-token"),
  seedAdminAccount: vi.fn().mockResolvedValue(undefined),
  hashPassword: vi.fn().mockResolvedValue("$2a$12$newmockhash"),
  isWhitelistedAdmin: (email: string) => {
    const whitelist = ["jonah@smarterswipe.com", "eric@smarterswipe.com", "billy@smarterswipe.com"];
    return whitelist.includes(email.toLowerCase().trim());
  },
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";
import type { inferRouterContext } from "@trpc/server";
import { sendEmail } from "./email";

type TrpcContext = inferRouterContext<typeof appRouter>;

function createPublicContext(): TrpcContext {
  return {
    req: { headers: { cookie: "" } } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
    user: null,
    adminSession: null,
  };
}

describe("adminAuth.forgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success for a whitelisted admin email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.forgotPassword({
      email: "jonah@smarterswipe.com",
      origin: "https://getapproved.smarterswipe.com",
    });

    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jonah@smarterswipe.com",
        subject: expect.stringContaining("Reset"),
      })
    );
  });

  it("returns success but does NOT send email for non-whitelisted email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.forgotPassword({
      email: "random@gmail.com",
      origin: "https://getapproved.smarterswipe.com",
    });

    // Always returns success to prevent email enumeration
    expect(result.success).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("includes a reset URL with a token in the email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.adminAuth.forgotPassword({
      email: "jonah@smarterswipe.com",
      origin: "https://getapproved.smarterswipe.com",
    });

    const emailCall = (sendEmail as any).mock.calls[0][0];
    expect(emailCall.html).toContain("https://getapproved.smarterswipe.com/admin/reset-password?token=");
  });

  it("falls back to default origin if untrusted origin is provided", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.adminAuth.forgotPassword({
      email: "jonah@smarterswipe.com",
      origin: "https://evil-attacker.com",
    });

    const emailCall = (sendEmail as any).mock.calls[0][0];
    // Should use the default allowed origin, not the attacker's
    expect(emailCall.html).toContain("https://getapproved.smarterswipe.com/admin/reset-password?token=");
    expect(emailCall.html).not.toContain("evil-attacker.com");
  });
});

describe("adminAuth.resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid/expired token", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.resetPassword({
      token: "invalid-token-string",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid or expired");
  });

  it("resets password with a valid token", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First, generate a valid token via forgotPassword
    await caller.adminAuth.forgotPassword({
      email: "jonah@smarterswipe.com",
      origin: "https://getapproved.smarterswipe.com",
    });

    // Extract the token from the email HTML
    const emailCall = (sendEmail as any).mock.calls[0][0];
    const tokenMatch = emailCall.html.match(/token=([^"&]+)/);
    expect(tokenMatch).toBeTruthy();
    const token = decodeURIComponent(tokenMatch![1]);

    // Now reset the password
    const { updateAdminPasswordHash } = await import("./db");
    const result = await caller.adminAuth.resetPassword({
      token,
      newPassword: "mynewpassword123",
    });

    expect(result.success).toBe(true);
    expect(updateAdminPasswordHash).toHaveBeenCalledWith(
      "jonah@smarterswipe.com",
      "$2a$12$newmockhash"
    );
  });
});
