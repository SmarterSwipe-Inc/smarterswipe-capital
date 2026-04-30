import PDFDocument from "pdfkit";

interface ApplicationData {
  id: number;
  status: string;
  submittedAt: Date | string;

  // Business
  legalBusinessName?: string | null;
  dba?: string | null;
  entityType?: string | null;
  federalTaxId?: string | null;
  dateEstablished?: string | null;
  lengthOfOwnership?: string | null;
  typeOfBusiness?: string | null;
  businessWebsite?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  mailingAddress?: string | null;

  // Funding
  amountRequested?: string | null;
  useOfFunds?: string | null;
  urgency?: string | null;
  existingAdvances?: string | null;
  existingAdvanceDetails?: string | null;

  // Owner
  ownerFirstName?: string | null;
  ownerLastName?: string | null;
  ownerTitle?: string | null;
  ownershipPercentage?: string | null;
  ownerSsn?: string | null;
  ownerDob?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  ownerHomeAddress?: string | null;

  // Banking
  bankName?: string | null;
  accountType?: string | null;
  accountNumber?: string | null;
  routingNumber?: string | null;
  avgMonthlyRevenue?: string | null;
  avgMonthlyDeposits?: string | null;

  // Debt
  debt1Creditor?: string | null;
  debt1Balance?: string | null;
  debt1Payment?: string | null;
  debt2Creditor?: string | null;
  debt2Balance?: string | null;
  debt2Payment?: string | null;
  debt3Creditor?: string | null;
  debt3Balance?: string | null;
  debt3Payment?: string | null;
  hasLiens?: string | null;
  liensExplanation?: string | null;

  // Processing
  currentProcessor?: string | null;
  merchantId?: string | null;
  monthlyCardVolume?: string | null;
  avgTicketSize?: string | null;
  chargebackHistory?: string | null;

  // Documents
  documents?: unknown;

  // Authorization
  authorizedSignerName?: string | null;
  authorizedSignerTitle?: string | null;
  consentGiven?: string | null;
}

function val(v: string | null | undefined): string {
  return v || "—";
}

export function generateApplicationPdf(app: ApplicationData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const BLUE = "#2951D5";
    const DARK = "#0B1120";
    const GRAY = "#6b7280";
    const pageWidth = 512; // 612 - 50 - 50

    // ─── Header ───
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor(BLUE)
      .text("SMARTERSWIPE CAPITAL", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(GRAY)
      .text("Funding Application", { align: "center" });
    doc.moveDown(0.5);

    // Status bar
    const statusDate =
      app.submittedAt instanceof Date
        ? app.submittedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : new Date(app.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    doc
      .fontSize(9)
      .fillColor(GRAY)
      .text(`Application #${app.id}  |  Status: ${app.status.toUpperCase()}  |  Submitted: ${statusDate}`, {
        align: "center",
      });

    doc.moveDown(1);
    drawLine(doc, pageWidth);
    doc.moveDown(0.5);

    // ─── Section 1: Business Information ───
    sectionHeader(doc, "1. BUSINESS INFORMATION");
    fieldRow(doc, "Legal Business Name", val(app.legalBusinessName));
    fieldRow(doc, "DBA", val(app.dba));
    fieldRow(doc, "Entity Type", val(app.entityType));
    fieldRow(doc, "Federal Tax ID", val(app.federalTaxId));
    fieldRow(doc, "Date Established", val(app.dateEstablished));
    fieldRow(doc, "Length of Ownership", val(app.lengthOfOwnership));
    fieldRow(doc, "Type of Business", val(app.typeOfBusiness));
    fieldRow(doc, "Website", val(app.businessWebsite));
    fieldRow(doc, "Phone", val(app.businessPhone));
    fieldRow(doc, "Email", val(app.businessEmail));
    fieldRow(doc, "Business Address", val(app.businessAddress));
    fieldRow(doc, "Mailing Address", val(app.mailingAddress));
    doc.moveDown(0.5);

    // ─── Section 2: Funding Request ───
    sectionHeader(doc, "2. FUNDING REQUEST");
    fieldRow(doc, "Amount Requested", val(app.amountRequested));
    fieldRow(doc, "Use of Funds", val(app.useOfFunds));
    fieldRow(doc, "Urgency", val(app.urgency));
    fieldRow(doc, "Existing Advances", val(app.existingAdvances));
    if (app.existingAdvanceDetails) {
      fieldRow(doc, "Advance Details", val(app.existingAdvanceDetails));
    }
    doc.moveDown(0.5);

    // ─── Section 3: Owner Information ───
    sectionHeader(doc, "3. OWNER / PRINCIPAL INFORMATION");
    fieldRow(doc, "Name", `${val(app.ownerFirstName)} ${val(app.ownerLastName)}`.trim());
    fieldRow(doc, "Title", val(app.ownerTitle));
    fieldRow(doc, "Ownership %", val(app.ownershipPercentage));
    fieldRow(doc, "SSN", app.ownerSsn ? `***-**-${app.ownerSsn.replace(/\D/g, "").slice(-4)}` : "—");
    fieldRow(doc, "Date of Birth", val(app.ownerDob));
    fieldRow(doc, "Phone", val(app.ownerPhone));
    fieldRow(doc, "Email", val(app.ownerEmail));
    fieldRow(doc, "Home Address", val(app.ownerHomeAddress));
    doc.moveDown(0.5);

    // ─── Section 4: Financial & Banking ───
    sectionHeader(doc, "4. FINANCIAL & BANKING");
    fieldRow(doc, "Bank Name", val(app.bankName));
    fieldRow(doc, "Account Type", val(app.accountType));
    fieldRow(doc, "Account #", app.accountNumber ? `****${app.accountNumber.slice(-4)}` : "—");
    fieldRow(doc, "Routing #", app.routingNumber ? `****${app.routingNumber.slice(-4)}` : "—");
    fieldRow(doc, "Avg Monthly Revenue", val(app.avgMonthlyRevenue));
    fieldRow(doc, "Avg Monthly Deposits", val(app.avgMonthlyDeposits));
    doc.moveDown(0.3);

    // Debts
    if (app.debt1Creditor || app.debt2Creditor || app.debt3Creditor) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(DARK).text("Existing Debts:");
      doc.moveDown(0.2);
      if (app.debt1Creditor) {
        fieldRow(doc, "  Debt 1", `${val(app.debt1Creditor)} — Balance: ${val(app.debt1Balance)}, Payment: ${val(app.debt1Payment)}`);
      }
      if (app.debt2Creditor) {
        fieldRow(doc, "  Debt 2", `${val(app.debt2Creditor)} — Balance: ${val(app.debt2Balance)}, Payment: ${val(app.debt2Payment)}`);
      }
      if (app.debt3Creditor) {
        fieldRow(doc, "  Debt 3", `${val(app.debt3Creditor)} — Balance: ${val(app.debt3Balance)}, Payment: ${val(app.debt3Payment)}`);
      }
    }
    fieldRow(doc, "Has Liens", val(app.hasLiens));
    if (app.liensExplanation) {
      fieldRow(doc, "Liens Explanation", val(app.liensExplanation));
    }
    doc.moveDown(0.5);

    // ─── Section 5: Merchant / Processing ───
    sectionHeader(doc, "5. MERCHANT / PROCESSING INFO");
    fieldRow(doc, "Current Processor", val(app.currentProcessor));
    fieldRow(doc, "Merchant ID", val(app.merchantId));
    fieldRow(doc, "Monthly Card Volume", val(app.monthlyCardVolume));
    fieldRow(doc, "Avg Ticket Size", val(app.avgTicketSize));
    fieldRow(doc, "Chargeback History", val(app.chargebackHistory));
    doc.moveDown(0.5);

    // ─── Section 6: Documents ───
    sectionHeader(doc, "6. UPLOADED DOCUMENTS");
    if (app.documents && Array.isArray(app.documents) && app.documents.length > 0) {
      const docs = app.documents as string[];
      docs.forEach((d, i) => {
        const filename = d.split("/").pop() || d;
        fieldRow(doc, `  Document ${i + 1}`, filename);
      });
    } else {
      doc.fontSize(9).font("Helvetica").fillColor(GRAY).text("No documents uploaded.");
    }
    doc.moveDown(0.5);

    // ─── Section 7: Authorization ───
    sectionHeader(doc, "7. AUTHORIZATION");
    fieldRow(doc, "Authorized Signer", val(app.authorizedSignerName));
    fieldRow(doc, "Title", val(app.authorizedSignerTitle));
    fieldRow(doc, "Consent Given", app.consentGiven === "true" ? "Yes" : "No");
    doc.moveDown(1);

    // Footer
    drawLine(doc, pageWidth);
    doc.moveDown(0.3);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(GRAY)
      .text("This document is confidential and intended for SmarterSwipe Capital internal use only.", {
        align: "center",
      });
    doc.text(`Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, {
      align: "center",
    });

    doc.end();
  });
}

function sectionHeader(doc: PDFKit.PDFDocument, title: string) {
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#2951D5")
    .text(title);
  doc.moveDown(0.3);
}

function fieldRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  const y = doc.y;
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#0B1120")
    .text(label + ":", 50, y, { width: 150, continued: false });

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#3a3f4b")
    .text(value, 200, y, { width: 362 });

  // Ensure we move below the tallest of the two columns
  if (doc.y < y + 12) {
    doc.y = y + 14;
  }
}

function drawLine(doc: PDFKit.PDFDocument, width: number) {
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(50 + width, doc.y)
    .stroke();
}
