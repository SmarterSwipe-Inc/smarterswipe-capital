/**
 * Express route for downloading application documents.
 * Protected by admin session cookie verification.
 *
 * Streams file content directly from S3/CloudFront instead of redirecting,
 * which fixes CloudFront signed URL issues with special characters (spaces)
 * in filenames. The Forge API returns presigned URLs with raw spaces in the
 * path, but standard HTTP clients encode them to %20, causing signature
 * mismatch. We use a raw TLS socket to send the request with unencoded paths.
 */
import { Router } from "express";
import * as tls from "tls";
import { getAdminFromRequest } from "./adminAuth";
import { ENV } from "./_core/env";

export const docRouter = Router();

/**
 * Fetch a URL using a raw TLS socket, preserving unencoded characters in the path.
 * This is necessary because CloudFront signed URLs have signatures computed for
 * paths with raw spaces, but fetch()/undici auto-encode spaces to %20.
 */
function rawHttpsGet(
  rawUrl: string,
): Promise<{ statusCode: number; headers: Record<string, string>; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const match = rawUrl.match(/^https:\/\/([^/]+)(\/.*)/);
    if (!match) {
      reject(new Error("Invalid URL"));
      return;
    }

    const hostname = match[1];
    const rawPath = match[2]; // Preserves raw spaces

    const socket = tls.connect(443, hostname, { servername: hostname }, () => {
      const request = `GET ${rawPath} HTTP/1.1\r\nHost: ${hostname}\r\nConnection: close\r\n\r\n`;
      socket.write(request);
    });

    const chunks: Buffer[] = [];
    socket.on("data", (chunk: Buffer) => chunks.push(chunk));
    socket.on("end", () => {
      const raw = Buffer.concat(chunks);
      const rawStr = raw.toString("latin1");

      // Parse HTTP response
      const headerEnd = rawStr.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        reject(new Error("Malformed HTTP response"));
        return;
      }

      const headerSection = rawStr.substring(0, headerEnd);
      const statusLine = headerSection.split("\r\n")[0];
      const statusCode = parseInt(statusLine.split(" ")[1], 10);

      // Parse headers
      const headers: Record<string, string> = {};
      const headerLines = headerSection.split("\r\n").slice(1);
      for (const line of headerLines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim().toLowerCase();
          const value = line.substring(colonIdx + 1).trim();
          headers[key] = value;
        }
      }

      // Extract body (everything after \r\n\r\n)
      const body = raw.subarray(headerEnd + 4);

      resolve({ statusCode, headers, body });
    });
    socket.on("error", reject);
    socket.setTimeout(30000, () => {
      socket.destroy();
      reject(new Error("Socket timeout"));
    });
  });
}

/**
 * GET /api/admin/documents?key=applications/docs/filename.pdf
 * Fetches the document from S3 via a fresh presigned URL and streams it to the client.
 */
docRouter.get("/api/admin/documents", async (req, res) => {
  try {
    // Verify admin session
    const adminSession = await getAdminFromRequest(req);
    if (!adminSession) {
      res.status(401).json({ error: "Unauthorized — admin login required" });
      return;
    }

    const storageKey = req.query.key as string;
    if (!storageKey) {
      res.status(400).json({ error: "Missing document key" });
      return;
    }

    // Strip /manus-storage/ prefix if present
    const cleanKey = storageKey.replace(/^\/manus-storage\//, "");

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).json({ error: "Storage not configured" });
      return;
    }

    // Get a fresh presigned GET URL from Forge
    const forgeUrl = new URL(
      "v1/storage/presign/get",
      ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
    );
    forgeUrl.searchParams.set("path", cleanKey);

    const forgeResp = await fetch(forgeUrl, {
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
    });

    if (!forgeResp.ok) {
      console.error(`[DocProxy] Forge presign error: ${forgeResp.status}`);
      res.status(502).json({ error: "Failed to get document URL" });
      return;
    }

    const { url: presignedUrl } = (await forgeResp.json()) as { url: string };
    if (!presignedUrl) {
      res.status(502).json({ error: "Empty presigned URL" });
      return;
    }

    // Use raw TLS socket to fetch the file, preserving unencoded spaces in the path
    const fileResult = await rawHttpsGet(presignedUrl);

    if (fileResult.statusCode !== 200) {
      console.error(
        `[DocProxy] S3 fetch error: ${fileResult.statusCode} for key: ${cleanKey}`,
      );
      res.status(502).json({ error: "Failed to fetch document" });
      return;
    }

    // Determine content type and filename
    const contentType = fileResult.headers["content-type"] || "application/octet-stream";

    // Extract original filename from the key
    const parts = cleanKey.split("/");
    const rawFilename = parts[parts.length - 1] || "document";
    // Remove the hash suffix added by storagePut (e.g., _abc12345 before extension)
    const displayFilename = rawFilename.replace(/_[a-f0-9]{8}(\.[^.]+)$/, "$1");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileResult.body.length);

    // Use inline for PDFs and images so they display in browser, attachment for others
    const isViewable = contentType.startsWith("image/") || contentType === "application/pdf";
    res.setHeader(
      "Content-Disposition",
      `${isViewable ? "inline" : "attachment"}; filename="${encodeURIComponent(displayFilename)}"`,
    );
    res.setHeader("Cache-Control", "private, no-cache");

    res.send(fileResult.body);
  } catch (err) {
    console.error("[DocProxy] Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to download document" });
    }
  }
});
