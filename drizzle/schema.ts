import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean as mysqlBoolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Applications table — stores SmarterSwipe Capital funding applications.
 * Covers every field from the multi-step form.
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),

  /* ── Step 1: Business Information ── */
  legalBusinessName: varchar("legalBusinessName", { length: 255 }),
  dba: varchar("dba", { length: 255 }),
  entityType: varchar("entityType", { length: 64 }),
  federalTaxId: varchar("federalTaxId", { length: 32 }),
  dateEstablished: varchar("dateEstablished", { length: 16 }),
  lengthOfOwnership: varchar("lengthOfOwnership", { length: 64 }),
  typeOfBusiness: varchar("typeOfBusiness", { length: 255 }),
  businessWebsite: varchar("businessWebsite", { length: 512 }),
  businessPhone: varchar("businessPhone", { length: 32 }),
  businessEmail: varchar("businessEmail", { length: 320 }),
  businessAddress: text("businessAddress"),
  mailingAddress: text("mailingAddress"),

  /* ── Step 2: Funding Request ── */
  amountRequested: varchar("amountRequested", { length: 64 }),
  useOfFunds: text("useOfFunds"),
  urgency: varchar("urgency", { length: 64 }),
  existingAdvances: varchar("existingAdvances", { length: 16 }),
  existingAdvanceDetails: text("existingAdvanceDetails"),

  /* ── Step 3: Owner / Principal Information ── */
  ownerFirstName: varchar("ownerFirstName", { length: 128 }),
  ownerLastName: varchar("ownerLastName", { length: 128 }),
  ownerTitle: varchar("ownerTitle", { length: 128 }),
  ownershipPercentage: varchar("ownershipPercentage", { length: 16 }),
  ownerSsn: varchar("ownerSsn", { length: 16 }),
  ownerDob: varchar("ownerDob", { length: 16 }),
  ownerPhone: varchar("ownerPhone", { length: 32 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerHomeAddress: text("ownerHomeAddress"),

  /* ── Step 4: Financial & Banking ── */
  bankName: varchar("bankName", { length: 255 }),
  accountType: varchar("accountType", { length: 32 }),
  accountNumber: varchar("accountNumber", { length: 64 }),
  routingNumber: varchar("routingNumber", { length: 32 }),
  avgMonthlyRevenue: varchar("avgMonthlyRevenue", { length: 64 }),
  avgMonthlyDeposits: varchar("avgMonthlyDeposits", { length: 64 }),

  /* ── Debt / Lien Details ── */
  debt1Creditor: varchar("debt1Creditor", { length: 255 }),
  debt1Balance: varchar("debt1Balance", { length: 64 }),
  debt1Payment: varchar("debt1Payment", { length: 64 }),
  debt2Creditor: varchar("debt2Creditor", { length: 255 }),
  debt2Balance: varchar("debt2Balance", { length: 64 }),
  debt2Payment: varchar("debt2Payment", { length: 64 }),
  debt3Creditor: varchar("debt3Creditor", { length: 255 }),
  debt3Balance: varchar("debt3Balance", { length: 64 }),
  debt3Payment: varchar("debt3Payment", { length: 64 }),
  hasLiens: varchar("hasLiens", { length: 16 }),
  liensExplanation: text("liensExplanation"),

  /* ── Step 5: Merchant / Processing Info ── */
  currentProcessor: varchar("currentProcessor", { length: 255 }),
  merchantId: varchar("merchantId", { length: 128 }),
  monthlyCardVolume: varchar("monthlyCardVolume", { length: 64 }),
  avgTicketSize: varchar("avgTicketSize", { length: 64 }),
  chargebackHistory: varchar("chargebackHistory", { length: 255 }),

  /* ── Step 6: Document Uploads (stored as JSON array of file keys) ── */
  documents: json("documents"),

  /* ── Step 7: Authorization ── */
  authorizedSignerName: varchar("authorizedSignerName", { length: 255 }),
  authorizedSignerTitle: varchar("authorizedSignerTitle", { length: 128 }),
  consentGiven: varchar("consentGiven", { length: 8 }).default("false"),

  /* ── Metadata ── */
  status: mysqlEnum("status", ["new", "reviewing", "approved", "declined", "funded"])
    .default("new")
    .notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Admin credentials — separate auth for the admin dashboard.
 * Only whitelisted emails can log in.
 */
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;
