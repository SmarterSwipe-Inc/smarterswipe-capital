import PDFDocument from "pdfkit";

/**
 * Generates a PDF application form matching the reference format:
 * Clean black-and-white, numbered sections, bullet points, fill-in lines,
 * full authorization text, and signature block.
 */
export function generateApplicationPdf(app: Record<string, any>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = 612 - 72 - 72; // letter width minus margins
    const bulletX = 72 + 18; // indent for bullet items

    // Helper: check if we need a new page
    function checkPageSpace(needed: number) {
      if (doc.y + needed > 700) {
        doc.addPage();
      }
    }

    // Helper: section header (bold, underlined, numbered)
    function sectionHeader(text: string) {
      checkPageSpace(60);
      doc.moveDown(0.8);
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#000000").text(text, 72);
      // Underline
      const textWidth = doc.widthOfString(text);
      const y = doc.y;
      doc.moveTo(72, y).lineTo(72 + textWidth, y).lineWidth(0.5).strokeColor("#000000").stroke();
      doc.moveDown(0.6);
    }

    // Helper: bullet field with label and value/blank line
    function bulletField(label: string, value: string | null | undefined, hint?: string) {
      checkPageSpace(20);
      const displayValue = value || "________________";
      const hintText = hint ? ` ${hint}` : "";
      doc.font("Helvetica").fontSize(11).fillColor("#000000");
      doc.text(`-  ${label}: ${displayValue}${hintText}`, bulletX, undefined, {
        width: pageWidth - 18,
      });
      doc.moveDown(0.3);
    }

    // ═══════════ 1. Basic Business Information ═══════════
    sectionHeader("1. Basic Business Information");

    bulletField("Legal Business Name", app.legalBusinessName);
    bulletField("DBA (if any)", app.dba);
    bulletField("Business Structure", app.entityType, "(Sole Prop / LLC / Corporation / Partnership / Other)");
    bulletField("EIN / Federal Tax ID", app.federalTaxId);
    bulletField("Date Business Started (MM/YYYY)", app.dateEstablished);
    bulletField("Years/Months in Business", app.lengthOfOwnership);
    bulletField("Industry / NAICS Code or Description", app.typeOfBusiness, "(e.g. Restaurant, Retail, E-commerce)");
    bulletField("Website (if any)", app.businessWebsite);
    bulletField("Business Phone", app.businessPhone);
    bulletField("Business Email", app.businessEmail);
    bulletField("Physical Address", app.businessAddress);
    bulletField("Mailing Address (if different)", app.mailingAddress);

    // ═══════════ 2. Funding Request Details ═══════════
    sectionHeader("2. Funding Request Details");

    bulletField("Amount Requested ($)", app.amountRequested);
    bulletField("Purpose of Funds", app.useOfFunds, "(e.g. Working Capital, Inventory, Marketing, Equipment, Debt Consolidation)");
    bulletField("Desired Term or Repayment Preference (if known)", app.urgency);

    // ═══════════ 3. Primary Owner / Principal Information ═══════════
    sectionHeader("3. Primary Owner / Principal Information");

    const ownerName = [app.ownerFirstName, app.ownerLastName].filter(Boolean).join(" ") || null;
    bulletField("Full Legal Name", ownerName);
    bulletField("Title / Position", app.ownerTitle);
    bulletField("% Ownership", app.ownershipPercentage);
    bulletField("Date of Birth (MM/DD/YYYY)", app.ownerDob);

    // SSN - full value
    bulletField("Social Security Number (SSN)", app.ownerSsn, "(Required for credit review)");

    bulletField("Personal Phone", app.ownerPhone);
    bulletField("Personal Email", app.ownerEmail);
    bulletField("Home Address", app.ownerHomeAddress);

    checkPageSpace(30);
    doc.moveDown(0.3);
    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("#000000")
      .text(
        "(If there are additional owners with 20%+ ownership, please provide the same information on a separate sheet.)",
        72,
        undefined,
        { width: pageWidth }
      );
    doc.moveDown(0.3);

    // ═══════════ 4. Financial & Banking Information ═══════════
    sectionHeader("4. Financial & Banking Information");

    bulletField("Primary Business Bank Name", app.bankName);
    bulletField("Account Type", app.accountType, "(Checking / Savings)");

    // Account number - full value
    bulletField("Account Number", app.accountNumber);

    // Routing number - full value
    bulletField("Routing Number", app.routingNumber);

    bulletField("Average Monthly Deposits / Revenue (last 3 months)", app.avgMonthlyRevenue ? `$${app.avgMonthlyRevenue.replace(/^\$/, "")}` : null);

    // Current Outstanding Business Debts
    checkPageSpace(80);
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000").text("Current Outstanding Business Debts (list all):", 72);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11).text("Creditor | Balance | Monthly Payment", 72);
    doc.moveDown(0.3);

    // Debt rows
    const debts = [
      { creditor: app.debt1Creditor, balance: app.debt1Balance, payment: app.debt1Payment },
      { creditor: app.debt2Creditor, balance: app.debt2Balance, payment: app.debt2Payment },
      { creditor: app.debt3Creditor, balance: app.debt3Balance, payment: app.debt3Payment },
    ];

    debts.forEach((debt, i) => {
      const creditor = debt.creditor || "________________";
      const balance = debt.balance || "$________";
      const payment = debt.payment || "$________";
      doc.font("Helvetica").fontSize(11).text(`${i + 1}.  ${creditor} | ${balance} | ${payment}`, bulletX);
      doc.moveDown(0.2);
    });

    doc.moveDown(0.3);
    const liensChecked = app.hasLiens === "Yes" ? "Yes" : app.hasLiens === "No" ? "No" : "☐ No ☐ Yes";
    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        `-  Any liens, judgments, or bankruptcies (business or personal)? ${liensChecked} - Please explain:`,
        bulletX,
        undefined,
        { width: pageWidth - 18 }
      );
    if (app.liensExplanation) {
      doc.text(`     ${app.liensExplanation}`, bulletX);
    } else {
      doc.text("     ________________________________", bulletX);
    }
    doc.moveDown(0.3);

    // ═══════════ 5. Merchant / Processing Information ═══════════
    sectionHeader("5. Merchant / Processing Information");

    bulletField("Primary Processor (Square, Stripe, Chase, etc.)", app.currentProcessor);
    bulletField("Merchant ID (MID) if known", app.merchantId);
    bulletField("Average Monthly Credit Card / Processing Volume", app.monthlyCardVolume ? `$${app.monthlyCardVolume.replace(/^\$/, "")}` : null);

    // ═══════════ 6. Required Documents ═══════════
    checkPageSpace(120);
    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#000000").text("6. Required Documents", 72);
    // Underline
    const docHeaderWidth = doc.widthOfString("6. Required Documents");
    const docHeaderY = doc.y;
    doc.moveTo(72, docHeaderY).lineTo(72 + docHeaderWidth, docHeaderY).lineWidth(0.5).strokeColor("#000000").stroke();
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11).text("Please attach the following files:", 72);
    doc.moveDown(0.3);

    const requiredDocs = [
      "Driver's License or State ID (Front & Back)",
      "Voided Business Check",
      "Bank Statements – Most Recent 3 Months • Bank Statement – Month 1 (Most Recent) • Bank Statement – Month 2 • Bank Statement – Month 3",
      "Processing / Merchant Statements – Most Recent 3 Months • Processing Statement – Month 1 (Most Recent) • Processing Statement – Month 2 • Processing Statement – Month 3",
    ];

    requiredDocs.forEach((docItem) => {
      checkPageSpace(30);
      doc.font("Helvetica").fontSize(11).text(`-  ${docItem}`, bulletX, undefined, { width: pageWidth - 18 });
      doc.moveDown(0.3);
    });

    // ═══════════ 7. Authorizations & Certifications ═══════════
    checkPageSpace(100);
    sectionHeader("7. Authorizations & Certifications");

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000").text("7. Consent & Authorizations", 72);
    doc.moveDown(0.4);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text("By clicking the checkbox below and submitting this application, you agree to the following:", 72, undefined, {
        width: pageWidth,
      });
    doc.moveDown(0.4);

    const consentChecked = app.consentGiven === "true" ? "☑" : "☐";
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(`${consentChecked} I have read and agree to the Authorizations & Certifications`, 72, undefined, {
        width: pageWidth,
      });
    doc.moveDown(0.4);

    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Full Authorizations & Certifications:", 72, undefined, {
        width: pageWidth,
      });
    doc.moveDown(0.4);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        "By submitting this application to Smarter Swipe Inc, the undersigned Applicant(s) certify and agree as follows:",
        72 + 36,
        undefined,
        { width: pageWidth - 36 }
      );
    doc.moveDown(0.4);

    const authItems = [
      "All information and documents provided are true, complete, and accurate. Any false information may result in denial of funding.",
      "I/We authorize Smarter Swipe Inc to act as our funding broker and submit this application and all supporting documents to multiple banks, lenders, and funding partners to obtain commercial funding offers.",
      "I/We authorize Smarter Swipe Inc and its funding partners to perform a soft credit inquiry on the business and personal credit of the owner(s). This will not affect my/our credit score.",
      "I/We authorize Smarter Swipe Inc to verify all information with banks, processors, and other third parties, and to contact me/us regarding this application and any funding offers.",
      "I/We consent to electronic communications and agree that an electronic signature has the same legal effect as a handwritten signature.",
    ];

    authItems.forEach((item) => {
      checkPageSpace(50);
      doc.font("Helvetica").fontSize(10).text(`-  ${item}`, 72 + 36, undefined, { width: pageWidth - 36 });
      doc.moveDown(0.4);
    });

    // Signature block
    checkPageSpace(80);
    doc.moveDown(0.8);

    const signerName = app.authorizedSignerName || "________________________________";
    const signerTitle = app.authorizedSignerTitle || "________________";
    const submitDate = app.submittedAt
      ? new Date(app.submittedAt).toLocaleDateString("en-US")
      : "________________";

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000");
    doc.text("Signature: ________________________________", 72, undefined, { continued: false });
    doc.moveDown(0.1);
    doc.text(`          Date: ${submitDate}`, 72 + 300, undefined, { continued: false });
    doc.moveDown(0.6);

    // Reset position for printed name line
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text(`Printed Name: ${signerName}`, 72, undefined, { continued: false });
    doc.moveDown(0.1);
    doc.text(`          Title: ${signerTitle}`, 72 + 300, undefined, { continued: false });

    doc.end();
  });
}
