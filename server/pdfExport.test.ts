import { describe, it, expect } from "vitest";
import { generateApplicationPdf } from "./pdfExport";

// Mock application data matching the schema
const mockApplication = {
  id: 1,
  status: "new" as const,
  submittedAt: new Date("2024-06-15T12:00:00Z"),
  legalBusinessName: "Test Business LLC",
  dba: "Test Biz",
  entityType: "LLC",
  federalTaxId: "12-3456789",
  dateEstablished: "2020-01-15",
  lengthOfOwnership: "4 years",
  typeOfBusiness: "Restaurant",
  businessWebsite: "https://testbiz.com",
  businessPhone: "555-123-4567",
  businessEmail: "info@testbiz.com",
  businessAddress: "123 Main St, Anytown, CA 90210",
  mailingAddress: "PO Box 100, Anytown, CA 90210",
  amountRequested: "$150,000",
  useOfFunds: "Equipment purchase and renovation",
  urgency: "Within 2 weeks",
  existingAdvances: "Yes",
  existingAdvanceDetails: "One existing MCA with $50k remaining",
  ownerFirstName: "John",
  ownerLastName: "Doe",
  ownerTitle: "CEO",
  ownershipPercentage: "100%",
  ownerSsn: "123-45-6789",
  ownerDob: "1985-03-20",
  ownerPhone: "555-987-6543",
  ownerEmail: "john@testbiz.com",
  ownerHomeAddress: "456 Oak Ave, Anytown, CA 90210",
  bankName: "Chase Bank",
  accountType: "Business Checking",
  accountNumber: "1234567890",
  routingNumber: "021000021",
  avgMonthlyRevenue: "$85,000",
  avgMonthlyDeposits: "$90,000",
  debt1Creditor: "ABC Funding",
  debt1Balance: "$50,000",
  debt1Payment: "$2,500/week",
  debt2Creditor: null,
  debt2Balance: null,
  debt2Payment: null,
  debt3Creditor: null,
  debt3Balance: null,
  debt3Payment: null,
  hasLiens: "No",
  liensExplanation: null,
  currentProcessor: "Square",
  merchantId: "MID-12345",
  monthlyCardVolume: "$60,000",
  avgTicketSize: "$45",
  chargebackHistory: "None",
  documents: ["uploads/bank-statement-1.pdf", "uploads/tax-return-2023.pdf"],
  authorizedSignerName: "John Doe",
  authorizedSignerTitle: "CEO",
  consentGiven: "true",
};

describe("PDF Export", () => {
  it("should generate a valid PDF buffer from application data", async () => {
    const pdfBuffer = await generateApplicationPdf(mockApplication);

    // Verify it's a Buffer
    expect(pdfBuffer).toBeInstanceOf(Buffer);

    // Verify it starts with PDF magic bytes (%PDF-)
    expect(pdfBuffer.slice(0, 5).toString("ascii")).toBe("%PDF-");

    // Verify it has reasonable size (a full application PDF should be several KB)
    expect(pdfBuffer.length).toBeGreaterThan(2000);
  });

  it("should NOT include full SSN in the generated PDF", async () => {
    const pdfBuffer = await generateApplicationPdf(mockApplication);
    // Convert entire buffer to string to search for raw text content
    // PDFKit uses content streams that may be uncompressed in this version
    const pdfString = pdfBuffer.toString("binary");

    // The full SSN digits should NOT appear consecutively in the PDF
    // Check for the raw digits without dashes
    expect(pdfString).not.toContain("123456789");
    // Also check with the original format
    expect(pdfString).not.toContain("123-45-6789");
  });

  it("should NOT include full account number in the generated PDF", async () => {
    const pdfBuffer = await generateApplicationPdf(mockApplication);
    const pdfString = pdfBuffer.toString("binary");

    // Full account number should NOT appear
    expect(pdfString).not.toContain("1234567890");
  });

  it("should NOT include full routing number in the generated PDF", async () => {
    const pdfBuffer = await generateApplicationPdf(mockApplication);
    const pdfString = pdfBuffer.toString("binary");

    // Full routing number should NOT appear
    expect(pdfString).not.toContain("021000021");
  });

  it("should handle application with minimal data (all null fields)", async () => {
    const minimalApp = {
      id: 2,
      status: "new" as const,
      submittedAt: new Date("2024-06-15T12:00:00Z"),
      legalBusinessName: null,
      dba: null,
      entityType: null,
      federalTaxId: null,
      dateEstablished: null,
      lengthOfOwnership: null,
      typeOfBusiness: null,
      businessWebsite: null,
      businessPhone: null,
      businessEmail: null,
      businessAddress: null,
      mailingAddress: null,
      amountRequested: null,
      useOfFunds: null,
      urgency: null,
      existingAdvances: null,
      existingAdvanceDetails: null,
      ownerFirstName: null,
      ownerLastName: null,
      ownerTitle: null,
      ownershipPercentage: null,
      ownerSsn: null,
      ownerDob: null,
      ownerPhone: null,
      ownerEmail: null,
      ownerHomeAddress: null,
      bankName: null,
      accountType: null,
      accountNumber: null,
      routingNumber: null,
      avgMonthlyRevenue: null,
      avgMonthlyDeposits: null,
      debt1Creditor: null,
      debt1Balance: null,
      debt1Payment: null,
      debt2Creditor: null,
      debt2Balance: null,
      debt2Payment: null,
      debt3Creditor: null,
      debt3Balance: null,
      debt3Payment: null,
      hasLiens: null,
      liensExplanation: null,
      currentProcessor: null,
      merchantId: null,
      monthlyCardVolume: null,
      avgTicketSize: null,
      chargebackHistory: null,
      documents: null,
      authorizedSignerName: null,
      authorizedSignerTitle: null,
      consentGiven: null,
    };

    const pdfBuffer = await generateApplicationPdf(minimalApp);

    // Should still generate a valid PDF without crashing
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.slice(0, 5).toString("ascii")).toBe("%PDF-");
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it("should generate a larger PDF for a full application vs minimal one", async () => {
    const fullPdf = await generateApplicationPdf(mockApplication);
    const minimalPdf = await generateApplicationPdf({
      id: 3,
      status: "new" as const,
      submittedAt: new Date(),
      legalBusinessName: null,
      dba: null,
      entityType: null,
      federalTaxId: null,
      dateEstablished: null,
      lengthOfOwnership: null,
      typeOfBusiness: null,
      businessWebsite: null,
      businessPhone: null,
      businessEmail: null,
      businessAddress: null,
      mailingAddress: null,
      amountRequested: null,
      useOfFunds: null,
      urgency: null,
      existingAdvances: null,
      existingAdvanceDetails: null,
      ownerFirstName: null,
      ownerLastName: null,
      ownerTitle: null,
      ownershipPercentage: null,
      ownerSsn: null,
      ownerDob: null,
      ownerPhone: null,
      ownerEmail: null,
      ownerHomeAddress: null,
      bankName: null,
      accountType: null,
      accountNumber: null,
      routingNumber: null,
      avgMonthlyRevenue: null,
      avgMonthlyDeposits: null,
      debt1Creditor: null,
      debt1Balance: null,
      debt1Payment: null,
      debt2Creditor: null,
      debt2Balance: null,
      debt2Payment: null,
      debt3Creditor: null,
      debt3Balance: null,
      debt3Payment: null,
      hasLiens: null,
      liensExplanation: null,
      currentProcessor: null,
      merchantId: null,
      monthlyCardVolume: null,
      avgTicketSize: null,
      chargebackHistory: null,
      documents: null,
      authorizedSignerName: null,
      authorizedSignerTitle: null,
      consentGiven: null,
    });

    // Full application should produce a larger PDF than minimal one
    expect(fullPdf.length).toBeGreaterThan(minimalPdf.length);
  });
});
