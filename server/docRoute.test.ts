import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock adminAuth
vi.mock("./adminAuth", () => ({
  getAdminFromRequest: vi.fn(),
}));

// Mock the env
vi.mock("./_core/env", () => ({
  ENV: {
    forgeApiUrl: "https://forge.example.com",
    forgeApiKey: "test-key",
  },
}));

import { docRouter } from "./docRoute";
import { getAdminFromRequest } from "./adminAuth";

const mockedGetAdmin = vi.mocked(getAdminFromRequest);

function createApp() {
  const app = express();
  app.use(docRouter);
  return app;
}

describe("/api/admin/documents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated as admin", async () => {
    mockedGetAdmin.mockResolvedValue(null);

    const app = createApp();
    const res = await request(app).get("/api/admin/documents?key=test/file.pdf");

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Unauthorized");
  });

  it("returns 400 when key parameter is missing", async () => {
    mockedGetAdmin.mockResolvedValue({ adminId: 1, email: "admin@test.com", name: "Admin" } as any);

    const app = createApp();
    const res = await request(app).get("/api/admin/documents");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing document key");
  });

  it("strips /manus-storage/ prefix from key", async () => {
    mockedGetAdmin.mockResolvedValue({ adminId: 1, email: "admin@test.com", name: "Admin" } as any);

    // Mock global fetch to capture what key is passed to Forge
    const originalFetch = globalThis.fetch;
    let capturedForgeUrl = "";
    globalThis.fetch = vi.fn().mockImplementation(async (url: any) => {
      capturedForgeUrl = url.toString();
      return {
        ok: false,
        status: 500,
        text: async () => "mock error",
      };
    });

    const app = createApp();
    await request(app).get(
      "/api/admin/documents?key=/manus-storage/applications/docs/test.pdf",
    );

    // The Forge URL should have the key without the /manus-storage/ prefix
    expect(capturedForgeUrl).toContain("path=applications");
    expect(capturedForgeUrl).not.toContain("manus-storage");

    globalThis.fetch = originalFetch;
  });

  it("handles key with spaces properly (URL-decoded by Express)", async () => {
    mockedGetAdmin.mockResolvedValue({ adminId: 1, email: "admin@test.com", name: "Admin" } as any);

    const originalFetch = globalThis.fetch;
    let capturedPath = "";
    globalThis.fetch = vi.fn().mockImplementation(async (url: any) => {
      capturedPath = new URL(url.toString()).searchParams.get("path") || "";
      return {
        ok: false,
        status: 500,
        text: async () => "mock error",
      };
    });

    const app = createApp();
    // Express will decode %20 to space in the query param
    await request(app).get(
      "/api/admin/documents?key=applications/docs/Feb%202026_13b22856.pdf",
    );

    // The path sent to Forge should contain the space (decoded)
    expect(capturedPath).toBe("applications/docs/Feb 2026_13b22856.pdf");

    globalThis.fetch = originalFetch;
  });

  it("returns 502 when Forge API fails", async () => {
    mockedGetAdmin.mockResolvedValue({ adminId: 1, email: "admin@test.com", name: "Admin" } as any);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    const app = createApp();
    const res = await request(app).get("/api/admin/documents?key=test/file.pdf");

    expect(res.status).toBe(502);
    expect(res.body.error).toContain("Failed to get document URL");

    globalThis.fetch = originalFetch;
  });
});
