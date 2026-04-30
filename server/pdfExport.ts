import PDFDocument from "pdfkit";

/**
 * Generates a professional PDF application form that looks like a fillable paper form.
 * Features: bordered section boxes, field label/value grid layout, underlined fields,
 * shaded section headers, and formal signature block.
 */
export function generateApplicationPdf(app: Record<string, any>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const LEFT = 50;
    const RIGHT = 562; // 612 - 50
    const CONTENT_WIDTH = RIGHT - LEFT; // 512
    const HALF_WIDTH = CONTENT_WIDTH / 2 - 8; // for two-column fields
    const MID_X = LEFT + CONTENT_WIDTH / 2 + 8; // start of right column

    // ─── Helpers ───

    function checkPageSpace(needed: number) {
      if (doc.y + needed > 720) {
        doc.addPage();
      }
    }

    // Shaded section header with border
    function sectionHeader(title: string) {
      checkPageSpace(40);
      doc.moveDown(0.6);
      const y = doc.y;
      // Shaded background bar
      doc.rect(LEFT, y, CONTENT_WIDTH, 22).fill("#1a2744");
      // White text on dark background
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff");
      doc.text(title, LEFT + 10, y + 5, { width: CONTENT_WIDTH - 20 });
      doc.fillColor("#000000");
      doc.y = y + 28;
    }

    // Single field: label on top, value below with underline
    function field(label: string, value: string | null | undefined, width?: number, x?: number) {
      const fieldX = x ?? LEFT + 10;
      const fieldWidth = width ?? CONTENT_WIDTH - 20;
      checkPageSpace(32);
      // Label
      doc.font("Helvetica").fontSize(8).fillColor("#555555");
      doc.text(label, fieldX, doc.y, { width: fieldWidth });
      const labelY = doc.y;
      // Value
      doc.font("Helvetica").fontSize(10).fillColor("#000000");
      const displayValue = value || "";
      doc.text(displayValue, fieldX, labelY, { width: fieldWidth });
      // Underline
      const lineY = doc.y + 2;
      doc.moveTo(fieldX, lineY).lineTo(fieldX + fieldWidth, lineY).lineWidth(0.5).strokeColor("#cccccc").stroke();
      doc.y = lineY + 8;
    }

    // Two fields side by side
    function fieldRow(label1: string, value1: string | null | undefined, label2: string, value2: string | null | undefined) {
      checkPageSpace(32);
      const startY = doc.y;
      // Left field
      doc.font("Helvetica").fontSize(8).fillColor("#555555");
      doc.text(label1, LEFT + 10, startY, { width: HALF_WIDTH });
      doc.font("Helvetica").fontSize(10).fillColor("#000000");
      doc.text(value1 || "", LEFT + 10, doc.y, { width: HALF_WIDTH });
      const leftEndY = doc.y + 2;
      doc.moveTo(LEFT + 10, leftEndY).lineTo(LEFT + 10 + HALF_WIDTH, leftEndY).lineWidth(0.5).strokeColor("#cccccc").stroke();

      // Right field
      doc.font("Helvetica").fontSize(8).fillColor("#555555");
      doc.text(label2, MID_X, startY, { width: HALF_WIDTH });
      doc.font("Helvetica").fontSize(10).fillColor("#000000");
      doc.text(value2 || "", MID_X, doc.y, { width: HALF_WIDTH });
      const rightEndY = doc.y + 2;
      doc.moveTo(MID_X, rightEndY).lineTo(MID_X + HALF_WIDTH, rightEndY).lineWidth(0.5).strokeColor("#cccccc").stroke();

      doc.y = Math.max(leftEndY, rightEndY) + 8;
    }

    // Three fields in a row
    function fieldRow3(
      label1: string, value1: string | null | undefined,
      label2: string, value2: string | null | undefined,
      label3: string, value3: string | null | undefined
    ) {
      checkPageSpace(32);
      const startY = doc.y;
      const thirdWidth = CONTENT_WIDTH / 3 - 12;
      const x1 = LEFT + 10;
      const x2 = LEFT + CONTENT_WIDTH / 3 + 4;
      const x3 = LEFT + (CONTENT_WIDTH * 2) / 3 + 4;

      [
        { label: label1, value: value1, x: x1 },
        { label: label2, value: value2, x: x2 },
        { label: label3, value: value3, x: x3 },
      ].forEach(({ label, value, x }) => {
        doc.font("Helvetica").fontSize(8).fillColor("#555555");
        doc.text(label, x, startY, { width: thirdWidth });
        doc.font("Helvetica").fontSize(10).fillColor("#000000");
        doc.text(value || "", x, startY + 10, { width: thirdWidth });
        const lineY = startY + 22;
        doc.moveTo(x, lineY).lineTo(x + thirdWidth, lineY).lineWidth(0.5).strokeColor("#cccccc").stroke();
      });

      doc.y = startY + 30;
    }

    // Section border box (draw after content)
    function sectionBox(startY: number) {
      const endY = doc.y + 4;
      doc.rect(LEFT, startY, CONTENT_WIDTH, endY - startY).lineWidth(0.75).strokeColor("#d0d5dd").stroke();
      doc.y = endY + 2;
    }

    // ─── HEADER ───
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1a2744");
    doc.text("SMARTERSWIPE", LEFT, 40, { align: "center", width: CONTENT_WIDTH });
    doc.font("Helvetica").fontSize(10).fillColor("#555555");
    doc.text("Business Funding Application", LEFT, doc.y, { align: "center", width: CONTENT_WIDTH });
    doc.moveDown(0.3);

    // Application ID and date
    const appId = app.id ? `#${app.id}` : "";
    const submitDate = app.submittedAt
      ? new Date(app.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "";
    doc.font("Helvetica").fontSize(9).fillColor("#888888");
    doc.text(`Application ${appId}    |    Submitted: ${submitDate}`, LEFT, doc.y, { align: "center", width: CONTENT_WIDTH });
    doc.moveDown(0.5);

    // Horizontal rule
    doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).lineWidth(1).strokeColor("#1a2744").stroke();
    doc.moveDown(0.5);

    // ═══════════ 1. BASIC BUSINESS INFORMATION ═══════════
    sectionHeader("1. BASIC BUSINESS INFORMATION");
    const sec1Start = doc.y;

    field("Legal Business Name", app.legalBusinessName);
    fieldRow("DBA (Doing Business As)", app.dba, "Business Structure", app.entityType);
    fieldRow("EIN / Federal Tax ID", app.federalTaxId, "Date Business Started", app.dateEstablished);
    fieldRow("Years/Months in Business", app.lengthOfOwnership, "Industry / NAICS Code", app.typeOfBusiness);
    fieldRow("Business Phone", app.businessPhone, "Business Email", app.businessEmail);
    field("Website", app.businessWebsite);
    field("Physical Address", app.businessAddress);
    field("Mailing Address (if different)", app.mailingAddress);

    sectionBox(sec1Start);

    // ═══════════ 2. FUNDING REQUEST ═══════════
    sectionHeader("2. FUNDING REQUEST DETAILS");
    const sec2Start = doc.y;

    fieldRow("Amount Requested", app.amountRequested ? `$${app.amountRequested.replace(/^\$/, "")}` : null, "Purpose of Funds", app.useOfFunds);
    field("Desired Term / Repayment Preference", app.urgency);

    sectionBox(sec2Start);

    // ═══════════ 3. OWNER / PRINCIPAL INFORMATION ═══════════
    sectionHeader("3. PRIMARY OWNER / PRINCIPAL INFORMATION");
    const sec3Start = doc.y;

    const ownerName = [app.ownerFirstName, app.ownerLastName].filter(Boolean).join(" ") || null;
    fieldRow("Full Legal Name", ownerName, "Title / Position", app.ownerTitle);

    // Format DOB
    const formattedDob = app.ownerDob
      ? app.ownerDob.replace(/^(\d{2})(\d{2})(\d{4})$/, "$1/$2/$3")
      : null;
    fieldRow3("Date of Birth", formattedDob, "% Ownership", app.ownershipPercentage, "SSN", app.ownerSsn);

    fieldRow("Personal Phone", app.ownerPhone, "Personal Email", app.ownerEmail);
    field("Home Address", app.ownerHomeAddress);

    checkPageSpace(20);
    doc.font("Helvetica-Oblique").fontSize(8).fillColor("#888888");
    doc.text("If there are additional owners with 20%+ ownership, provide the same information on a separate sheet.", LEFT + 10, doc.y, { width: CONTENT_WIDTH - 20 });
    doc.moveDown(0.3);

    sectionBox(sec3Start);

    // ═══════════ 4. FINANCIAL & BANKING INFORMATION ═══════════
    sectionHeader("4. FINANCIAL & BANKING INFORMATION");
    const sec4Start = doc.y;

    fieldRow("Primary Business Bank", app.bankName, "Account Type", app.accountType);
    fieldRow("Account Number", app.accountNumber, "Routing Number", app.routingNumber);
    field("Average Monthly Revenue (last 3 months)", app.avgMonthlyRevenue ? `$${app.avgMonthlyRevenue.replace(/^\$/, "")}` : null);

    // Outstanding debts table
    checkPageSpace(80);
    doc.moveDown(0.3);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#1a2744");
    doc.text("CURRENT OUTSTANDING BUSINESS DEBTS", LEFT + 10, doc.y, { width: CONTENT_WIDTH - 20 });
    doc.moveDown(0.3);

    // Table header
    const tableY = doc.y;
    const col1 = LEFT + 10;
    const col2 = LEFT + 200;
    const col3 = LEFT + 330;
    doc.rect(col1, tableY, CONTENT_WIDTH - 20, 16).fill("#f0f2f5");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333333");
    doc.text("Creditor", col1 + 4, tableY + 4);
    doc.text("Balance", col2 + 4, tableY + 4);
    doc.text("Monthly Payment", col3 + 4, tableY + 4);
    doc.y = tableY + 18;

    const debts = [
      { creditor: app.debt1Creditor, balance: app.debt1Balance, payment: app.debt1Payment },
      { creditor: app.debt2Creditor, balance: app.debt2Balance, payment: app.debt2Payment },
      { creditor: app.debt3Creditor, balance: app.debt3Balance, payment: app.debt3Payment },
    ];

    debts.forEach((debt) => {
      const rowY = doc.y;
      doc.font("Helvetica").fontSize(9).fillColor("#000000");
      doc.text(debt.creditor || "-", col1 + 4, rowY + 2, { width: 180 });
      doc.text(debt.balance || "-", col2 + 4, rowY + 2, { width: 120 });
      doc.text(debt.payment || "-", col3 + 4, rowY + 2, { width: 120 });
      doc.y = rowY + 16;
      // Row separator
      doc.moveTo(col1, doc.y).lineTo(LEFT + CONTENT_WIDTH - 10, doc.y).lineWidth(0.3).strokeColor("#e0e0e0").stroke();
    });

    doc.moveDown(0.4);
    fieldRow("Liens, Judgments, or Bankruptcies?", app.hasLiens || "No", "Explanation", app.liensExplanation);

    sectionBox(sec4Start);

    // ═══════════ 5. MERCHANT / PROCESSING INFORMATION ═══════════
    sectionHeader("5. MERCHANT / PROCESSING INFORMATION");
    const sec5Start = doc.y;

    fieldRow("Primary Processor", app.currentProcessor, "Merchant ID (MID)", app.merchantId);
    field("Average Monthly Processing Volume", app.monthlyCardVolume ? `$${app.monthlyCardVolume.replace(/^\$/, "")}` : null);

    sectionBox(sec5Start);

    // ═══════════ 6. REQUIRED DOCUMENTS ═══════════
    sectionHeader("6. REQUIRED DOCUMENTS CHECKLIST");
    const sec6Start = doc.y;

    const requiredDocs = [
      "Driver's License or State ID (Front & Back)",
      "Voided Business Check",
      "Bank Statements - Most Recent 3 Months",
      "Processing / Merchant Statements - Most Recent 3 Months",
    ];

    requiredDocs.forEach((docItem) => {
      checkPageSpace(18);
      doc.font("Helvetica").fontSize(10).fillColor("#000000");
      doc.text(`[ ]  ${docItem}`, LEFT + 10, doc.y, { width: CONTENT_WIDTH - 20 });
      doc.moveDown(0.3);
    });

    sectionBox(sec6Start);

    // ═══════════ 7. AUTHORIZATIONS & CERTIFICATIONS ═══════════
    sectionHeader("7. AUTHORIZATIONS & CERTIFICATIONS");
    const sec7Start = doc.y;

    doc.font("Helvetica").fontSize(9).fillColor("#000000");
    doc.text(
      "By signing below, the undersigned Applicant(s) certify and agree as follows:",
      LEFT + 10, doc.y, { width: CONTENT_WIDTH - 20 }
    );
    doc.moveDown(0.4);

    const authItems = [
      "All information and documents provided are true, complete, and accurate. Any false information may result in denial of funding.",
      "I/We authorize Smarter Swipe Inc to act as our funding broker and submit this application and all supporting documents to multiple banks, lenders, and funding partners to obtain commercial funding offers.",
      "I/We authorize Smarter Swipe Inc and its funding partners to perform a soft credit inquiry on the business and personal credit of the owner(s). This will not affect my/our credit score.",
      "I/We authorize Smarter Swipe Inc to verify all information with banks, processors, and other third parties, and to contact me/us regarding this application and any funding offers.",
      "I/We consent to electronic communications and agree that an electronic signature has the same legal effect as a handwritten signature.",
    ];

    authItems.forEach((item, i) => {
      checkPageSpace(30);
      doc.font("Helvetica").fontSize(9).fillColor("#333333");
      doc.text(`${i + 1}.  ${item}`, LEFT + 16, doc.y, { width: CONTENT_WIDTH - 32 });
      doc.moveDown(0.3);
    });

    // Consent checkbox
    doc.moveDown(0.3);
    const consentChecked = app.consentGiven === "true" ? "[X]" : "[ ]";
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");
    doc.text(`${consentChecked}  I have read and agree to the Authorizations & Certifications above.`, LEFT + 10, doc.y, { width: CONTENT_WIDTH - 20 });
    doc.moveDown(0.6);

    // Signature block
    checkPageSpace(60);
    const sigY = doc.y;

    // Signature line
    doc.moveTo(LEFT + 10, sigY + 20).lineTo(LEFT + 240, sigY + 20).lineWidth(0.75).strokeColor("#000000").stroke();
    doc.font("Helvetica").fontSize(8).fillColor("#555555");
    doc.text("Signature", LEFT + 10, sigY + 22);

    // Date line
    doc.moveTo(LEFT + 280, sigY + 20).lineTo(RIGHT - 10, sigY + 20).lineWidth(0.75).strokeColor("#000000").stroke();
    doc.text("Date", LEFT + 280, sigY + 22);

    doc.y = sigY + 40;

    // Printed name line
    const nameY = doc.y;
    const signerName = app.authorizedSignerName || ownerName || "";
    const signerTitle = app.authorizedSignerTitle || app.ownerTitle || "";

    doc.font("Helvetica").fontSize(10).fillColor("#000000");
    doc.text(signerName, LEFT + 10, nameY + 6);
    doc.moveTo(LEFT + 10, nameY + 20).lineTo(LEFT + 240, nameY + 20).lineWidth(0.75).strokeColor("#000000").stroke();
    doc.font("Helvetica").fontSize(8).fillColor("#555555");
    doc.text("Printed Name", LEFT + 10, nameY + 22);

    doc.font("Helvetica").fontSize(10).fillColor("#000000");
    doc.text(signerTitle, LEFT + 280, nameY + 6);
    doc.moveTo(LEFT + 280, nameY + 20).lineTo(RIGHT - 10, nameY + 20).lineWidth(0.75).strokeColor("#000000").stroke();
    doc.font("Helvetica").fontSize(8).fillColor("#555555");
    doc.text("Title", LEFT + 280, nameY + 22);

    doc.y = nameY + 38;
    sectionBox(sec7Start);

    // Footer
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(8).fillColor("#aaaaaa");
    doc.text("SmarterSwipe Inc. | Business Funding Application | Confidential", LEFT, doc.y, { align: "center", width: CONTENT_WIDTH });

    doc.end();
  });
}
