import { Router, Request, Response } from "express";
import { storagePut } from "./storage";

const uploadRouter = Router();

/**
 * POST /api/upload
 * Accepts a JSON body with:
 *   - fileName: string (original file name)
 *   - fileData: string (base64-encoded file content)
 *   - mimeType: string (e.g. "application/pdf")
 *
 * Returns { key, url } from S3 storage.
 */
uploadRouter.post("/api/upload", async (req: Request, res: Response) => {
  try {
    const { fileName, fileData, mimeType } = req.body;

    if (!fileName || !fileData || !mimeType) {
      res.status(400).json({ error: "Missing fileName, fileData, or mimeType" });
      return;
    }

    // Validate file size (base64 is ~33% larger than raw, so 15MB base64 ≈ 10MB raw)
    if (fileData.length > 15 * 1024 * 1024) {
      res.status(413).json({ error: "File too large. Maximum size is 10MB." });
      return;
    }

    // Validate mime type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(mimeType)) {
      res.status(400).json({
        error: `Unsupported file type: ${mimeType}. Allowed: ${allowedTypes.join(", ")}`,
      });
      return;
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(fileData, "base64");

    // Sanitize filename: replace spaces and special characters with underscores
    // This prevents CloudFront signed URL issues with encoded characters
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace any non-alphanumeric (except . _ -) with underscore
      .replace(/_+/g, "_"); // Collapse multiple underscores

    // Upload to S3 via storage helper
    const relKey = `applications/docs/${sanitizedFileName}`;
    const { key, url } = await storagePut(relKey, buffer, mimeType);

    res.json({ key, url });
  } catch (err: any) {
    console.error("[Upload] Error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

export { uploadRouter };
