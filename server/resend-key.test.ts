import { describe, it, expect } from "vitest";

describe("Resend API key validation", () => {
  it("should be able to authenticate with Resend API", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeTruthy();

    // Call Resend's domains endpoint as a lightweight auth check
    const res = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // 200 = valid key, 401/403 = invalid key
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
    expect(res.ok).toBe(true);
  });
});
