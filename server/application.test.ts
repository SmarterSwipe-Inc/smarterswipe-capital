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
  getAdminByEmail: vi.fn().mockImplementation(async (email: string) => {
    if (email === "eric@smarterswipe.com") {
      return { id: 1, email: "eric@smarterswipe.com", name: "Eric Guzman", passwordHash: "$2a$12$mockhash" };
    }
    return undefined;
  }),
  upsertAdminCredential: vi.fn(),
  updateAdminPasswordHash: vi.fn().mockResolvedValue(undefined),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the email module
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: "mock-email-id" }),
}));

// Mock the email templates module
vi.mock("./emailTemplates", () => ({
  applicationConfirmationEmail: vi.fn().mockReturnValue({
    subject: "Application Received — Test Business",
    html: "<html>mock email</html>",
  }),
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
    hashPassword: vi.fn().mockResolvedValue("$2a$12$newmockhash"),
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

    expect(result).toEqual({ success: true, id: 42, emailSent: true });
  });

  it("accepts an empty submission (all fields optional)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.submit({});
    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
    expect(result.emailSent).toBe(false); // no email provided
  });

  it("sends confirmation email when ownerEmail is provided", async () => {
    const { sendEmail } = await import("./email");
    const { applicationConfirmationEmail } = await import("./emailTemplates");
    (sendEmail as ReturnType<typeof vi.fn>).mockClear();
    (applicationConfirmationEmail as ReturnType<typeof vi.fn>).mockClear();

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.application.submit({
      legalBusinessName: "Pizza Palace LLC",
      amountRequested: "$75,000",
      ownerFirstName: "Jane",
      ownerLastName: "Smith",
      ownerEmail: "jane@pizzapalace.com",
    });

    expect(applicationConfirmationEmail).toHaveBeenCalledWith({
      businessName: "Pizza Palace LLC",
      ownerName: "Jane Smith",
      amountRequested: "$75,000",
    });

    expect(sendEmail).toHaveBeenCalledWith({
      to: "jane@pizzapalace.com",
      subject: "Application Received — Test Business",
      html: "<html>mock email</html>",
      replyTo: "applications@smarterswipe.com",
    });
  });

  it("falls back to businessEmail when ownerEmail is not provided", async () => {
    const { sendEmail } = await import("./email");
    (sendEmail as ReturnType<typeof vi.fn>).mockClear();

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.application.submit({
      legalBusinessName: "Taco Town",
      businessEmail: "info@tacotown.com",
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "info@tacotown.com",
      })
    );
  });

  it("does not send email when no email is provided", async () => {
    const { sendEmail } = await import("./email");
    (sendEmail as ReturnType<typeof vi.fn>).mockClear();

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.submit({
      legalBusinessName: "No Email Corp",
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(result.emailSent).toBe(false);
  });

  it("still succeeds when email send fails", async () => {
    const { sendEmail } = await import("./email");
    (sendEmail as ReturnType<typeof vi.fn>).mockClear();
    (sendEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
      error: "Resend API error: 500",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.submit({
      legalBusinessName: "Fail Email Corp",
      ownerEmail: "fail@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
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

describe("adminAuth.changePassword", () => {
  it("rejects unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.changePassword({
        currentPassword: "oldpass",
        newPassword: "newpass123",
      })
    ).rejects.toThrow("Admin login required");
  });

  it("rejects when current password is wrong", async () => {
    // bcrypt.compare is called in the route — we need to mock it
    // Since the route uses bcrypt directly, and our mock getAdminByEmail returns a hash,
    // bcrypt.compare("wrongpass", "$2a$12$mockhash") will return false
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.changePassword({
      currentPassword: "wrongpassword",
      newPassword: "newpassword123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Current password is incorrect.");
    }
  });

  it("requires new password to be at least 8 characters", async () => {
    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.changePassword({
        currentPassword: "oldpass",
        newPassword: "short",
      })
    ).rejects.toThrow(); // Zod validation error
  });

  it("succeeds with correct current password and calls updateAdminPasswordHash", async () => {
    // Mock getAdminByEmail to return an admin with a known bcrypt hash
    // We'll use a real bcrypt hash of "correctpassword" so bcrypt.compare works
    const bcrypt = await import("bcryptjs");
    const realHash = await bcrypt.hash("correctpassword", 4); // low rounds for speed

    const { getAdminByEmail, updateAdminPasswordHash } = await import("./db");
    (getAdminByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      email: "eric@smarterswipe.com",
      name: "Eric Guzman",
      passwordHash: realHash,
    });

    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.changePassword({
      currentPassword: "correctpassword",
      newPassword: "newsecurepassword123",
    });

    expect(result.success).toBe(true);
    expect(updateAdminPasswordHash).toHaveBeenCalledWith(
      "eric@smarterswipe.com",
      "$2a$12$newmockhash"
    );
  });

  it("returns error when admin account not found in database", async () => {
    const { getAdminByEmail } = await import("./db");
    // Temporarily override to return undefined for this test
    (getAdminByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    const ctx = createAdminSessionContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.changePassword({
      currentPassword: "anypassword",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Admin account not found.");
    }
  });
});
