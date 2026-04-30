/**
 * Express route for downloading application PDFs.
 * Protected by admin session cookie verification.
 */
import { Router } from "express";
import { getAdminFromRequest } from "./adminAuth";
import { getApplicationById } from "./db";
import { generateApplicationPdf } from "./pdfExport";

export const pdfRouter = Router();

pdfRouter.get("/api/admin/applications/:id/pdf", async (req, res) => {
  try {
    // Verify admin session
    const adminSession = await getAdminFromRequest(req);
    if (!adminSession) {
      res.status(401).json({ error: "Unauthorized — admin login required" });
      return;
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    // Fetch the application
    const app = await getApplicationById(id);
    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    // Generate PDF
    const pdfBuffer = await generateApplicationPdf(app);

    // Build filename
    const businessName = (app.legalBusinessName || app.dba || "Application")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_");
    const filename = `SmarterSwipe_Application_${businessName}_${id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[PDF Export] Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});
