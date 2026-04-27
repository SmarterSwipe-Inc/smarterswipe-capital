import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  createApplication: vi.fn().mockResolvedValue(42),
  listApplications: vi.fn().mockResolvedValue([]),
  getApplicationById: vi.fn().mockResolvedValue(undefined),
  updateApplicationStatus: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getDb: vi.fn(),
  getAdminByEmail: vi.fn(),
  upsertAdminCredential: vi.fn(),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock adminAuth module
vi.mock("./adminAuth", async () => {
  const actual = await vi.importActual("./adminAuth");
  return {
    ...actual,
    validateAdminLogin: vi.fn().mockImplementation(async (email: string, password: string) => {
      if (email === "eric@smarterswipe.com" && password === "correctpassword") {
        return {
          success: true,
          admin: { adminId: 1, email: "eric@smarterswipe.com", name: "Eric Guzman" },
        };
      }
      if (email === "random@gmail.com") {
        return { success: false, error: "Access denied" };
      }
      return { success: false, error: "Invalid password" };
    }),
    signAdminSession: vi.fn().mockResolvedValue("mock-admin-token"),
    seedAdminAccount: vi.fn().mockResolvedValue(undefined),
    isWhitelistedAdmin: (email: string) => {
      const whitelist = ["jonah@smarterswipe.com", "eric@smarterswipe.com", "billy@smarterswipe.com"];
      return whitelist.includes(email.toLowerCase().trim());
    },
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    adminSession: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminSessionContext(): TrpcContext {
  return {
    user: null,
    adminSession: {
      adminId: 1,
      email: "eric@smarterswipe.com",
      name: "Eric Guzman",
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createNoAdminSessionContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@gmail.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    adminSession: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("application.submit", () => {
  it("creates a new application and returns success with id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.submit({
      legalBusinessName: "Test Restaurant LLC",
      dba: "Test Bistro",
      amountRequested: "$50,000",
      ownerFirstName: "John",
      ownerLastName: "Doe",
      businessEmail: "john@testbistro.com",
      consentGiven: "true",
    });

    expect(result).toEqual({ success: true, id: 42 });
  });

  it("accepts an empty submission (all fields optional)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.submit({});
    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
  });
});

describe("admin access control - requires admin session", () => {
  it("rejects unauthenticated user from application.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.application.list()).rejects.toThrow("Admin login required");
  });

  it("rejects a Manus-authenticated user without admin session from application.list", async () => {
    const ctx = createNoAdminSessionContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.application.list()).rejects.toThrow("Admin login required");
  });

  it("rejects unauthenticated user from application.getById", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.application.getById({ id: 1 })).rejects.toThrow("Admin login required");
  });

  it("rejects unauthenticated user from application.updateStatus", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.application.updateStatus({ id: 1, status: "approved" })
    ).rejects.toThrow("Admin login required");
  });
});

describe("admin access - with valid admin session", () => {
  it("returns applications for admin session users", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("updates status for admin session users", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.updateStatus({
      id: 1,
      status: "approved",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("adminAuth.me", () => {
  it("returns null when no admin session", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.me();
    expect(result).toBeNull();
  });

  it("returns admin session when authenticated", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.me();
    expect(result).toEqual({
      adminId: 1,
      email: "eric@smarterswipe.com",
      name: "Eric Guzman",
    });
  });
});

describe("adminAuth.login", () => {
  it("succeeds with correct whitelisted email and password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.login({
      email: "eric@smarterswipe.com",
      password: "correctpassword",
    });
    expect(result.success).toBe(true);
    // Verify cookie was set
    expect(ctx.res.cookie).toHaveBeenCalledWith(
      "admin_session",
      "mock-admin-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    );
  });

  it("fails with non-whitelisted email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.login({
      email: "random@gmail.com",
      password: "anypassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Access denied");
    }
  });

  it("fails with wrong password for whitelisted email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.login({
      email: "eric@smarterswipe.com",
      password: "wrongpassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid password");
    }
  });
});

describe("adminAuth.setup", () => {
  it("rejects unauthenticated user from setting up accounts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.setup({
        email: "jonah@smarterswipe.com",
        password: "securepass123",
        name: "Jonah",
      })
    ).rejects.toThrow("Admin login required");
  });

  it("allows authenticated admin to set up a whitelisted account", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.setup({
      email: "jonah@smarterswipe.com",
      password: "securepass123",
      name: "Jonah",
    });
    expect(result.success).toBe(true);
  });

  it("rejects setup for non-whitelisted email even by admin", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.setup({
      email: "random@gmail.com",
      password: "securepass123",
      name: "Random Person",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminAuth.logout", () => {
  it("clears admin session cookie", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalledWith(
      "admin_session",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: -1,
      })
    );
  });
});
