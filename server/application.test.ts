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
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "eric@smarterswipe.com",
      name: "Eric Guzman",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
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

function createNonSmarterswipeUserContext(): TrpcContext {
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createNonWhitelistedSmarterswipeContext(): TrpcContext {
  return {
    user: {
      id: 3,
      openId: "other-ss-user",
      email: "random@smarterswipe.com",
      name: "Random Employee",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("admin access control - non-whitelisted @smarterswipe.com rejection", () => {
  it("rejects a non-whitelisted @smarterswipe.com user from application.list", async () => {
    const ctx = createNonWhitelistedSmarterswipeContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.application.list()).rejects.toThrow();
  });
});

describe("admin access control - non-@smarterswipe.com rejection", () => {
  it("rejects a signed-in non-@smarterswipe.com user from application.list", async () => {
    const ctx = createNonSmarterswipeUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.application.list()).rejects.toThrow();
  });

  it("rejects a signed-in non-@smarterswipe.com user from application.getById", async () => {
    const ctx = createNonSmarterswipeUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.application.getById({ id: 1 })).rejects.toThrow();
  });

  it("rejects a signed-in non-@smarterswipe.com user from application.updateStatus", async () => {
    const ctx = createNonSmarterswipeUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.application.updateStatus({ id: 1, status: "approved" })
    ).rejects.toThrow();
  });
});

describe("application.list", () => {
  it("requires admin role", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.application.list()).rejects.toThrow();
  });

  it("returns applications for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("application.getById", () => {
  it("requires admin role", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.application.getById({ id: 1 })).rejects.toThrow();
  });
});

describe("application.updateStatus", () => {
  it("requires admin role", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.application.updateStatus({ id: 1, status: "approved" })
    ).rejects.toThrow();
  });

  it("updates status for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.updateStatus({
      id: 1,
      status: "approved",
    });
    expect(result).toEqual({ success: true });
  });
});
