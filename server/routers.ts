import { COOKIE_NAME, ADMIN_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, smarterswipeAdminProcedure, router } from "./_core/trpc";
import { createApplication, listApplications, getApplicationById, updateApplicationStatus, getAdminByEmail, updateAdminPasswordHash } from "./db";
import { notifyOwner } from "./_core/notification";
import { sendEmail } from "./email";
import { applicationConfirmationEmail } from "./emailTemplates";
import { validateAdminLogin, signAdminSession, seedAdminAccount, isWhitelistedAdmin, hashPassword } from "./adminAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /** Admin authentication — custom email/password, separate from Manus OAuth */
  adminAuth: router({
    /** Check current admin session */
    me: publicProcedure.query(({ ctx }) => {
      return ctx.adminSession ?? null;
    }),

    /** Admin login with email + password */
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const result = await validateAdminLogin(input.email, input.password);
        if (!result.success) {
          return { success: false as const, error: result.error };
        }

        const token = await signAdminSession(result.admin);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        return { success: true as const, admin: result.admin };
      }),

    /** Admin logout — clear the admin session cookie */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    /** Change password — requires current admin session and current password */
    changePassword: smarterswipeAdminProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1, "Current password is required"),
          newPassword: z.string().min(8, "New password must be at least 8 characters"),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const email = ctx.adminSession!.email;

        // Fetch the admin record to verify current password
        const admin = await getAdminByEmail(email);
        if (!admin) {
          return { success: false as const, error: "Admin account not found." };
        }

        // Verify current password
        const valid = await bcrypt.compare(input.currentPassword, admin.passwordHash);
        if (!valid) {
          return { success: false as const, error: "Current password is incorrect." };
        }

        // Hash and save new password
        const newHash = await hashPassword(input.newPassword);
        await updateAdminPasswordHash(email, newHash);

        return { success: true as const };
      }),

    /** Set up an admin account — only existing admins can create new accounts */
    setup: smarterswipeAdminProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8, "Password must be at least 8 characters"),
          name: z.string().min(1),
        }),
      )
      .mutation(async ({ input }) => {
        if (!isWhitelistedAdmin(input.email)) {
          return { success: false as const, error: "This email is not authorized for admin access." };
        }

        try {
          await seedAdminAccount(input.email, input.password, input.name);
          return { success: true as const };
        } catch (err) {
          console.error("[AdminAuth] Setup failed:", err);
          return { success: false as const, error: "Failed to set up account." };
        }
      }),
  }),

  application: router({
    /** Public: submit a new funding application */
    submit: publicProcedure
      .input(
        z.object({
          // Step 1: Business Information
          legalBusinessName: z.string().optional(),
          dba: z.string().optional(),
          entityType: z.string().optional(),
          federalTaxId: z.string().optional(),
          dateEstablished: z.string().optional(),
          lengthOfOwnership: z.string().optional(),
          typeOfBusiness: z.string().optional(),
          businessWebsite: z.string().optional(),
          businessPhone: z.string().optional(),
          businessEmail: z.string().optional(),
          businessAddress: z.string().optional(),
          mailingAddress: z.string().optional(),

          // Step 2: Funding Request
          amountRequested: z.string().optional(),
          useOfFunds: z.string().optional(),
          urgency: z.string().optional(),
          existingAdvances: z.string().optional(),
          existingAdvanceDetails: z.string().optional(),

          // Step 3: Owner / Principal Information
          ownerFirstName: z.string().optional(),
          ownerLastName: z.string().optional(),
          ownerTitle: z.string().optional(),
          ownershipPercentage: z.string().optional(),
          ownerSsn: z.string().optional(),
          ownerDob: z.string().optional(),
          ownerPhone: z.string().optional(),
          ownerEmail: z.string().optional(),
          ownerHomeAddress: z.string().optional(),

          // Step 4: Financial & Banking
          bankName: z.string().optional(),
          accountType: z.string().optional(),
          accountNumber: z.string().optional(),
          routingNumber: z.string().optional(),
          avgMonthlyRevenue: z.string().optional(),
          avgMonthlyDeposits: z.string().optional(),

          // Debt / Lien Details
          debt1Creditor: z.string().optional(),
          debt1Balance: z.string().optional(),
          debt1Payment: z.string().optional(),
          debt2Creditor: z.string().optional(),
          debt2Balance: z.string().optional(),
          debt2Payment: z.string().optional(),
          debt3Creditor: z.string().optional(),
          debt3Balance: z.string().optional(),
          debt3Payment: z.string().optional(),
          hasLiens: z.string().optional(),
          liensExplanation: z.string().optional(),

          // Step 5: Merchant / Processing Info
          currentProcessor: z.string().optional(),
          merchantId: z.string().optional(),
          monthlyCardVolume: z.string().optional(),
          avgTicketSize: z.string().optional(),
          chargebackHistory: z.string().optional(),

          // Step 6: Document Uploads (array of file keys/URLs)
          documents: z.array(z.string()).optional(),

          // Step 7: Authorization
          authorizedSignerName: z.string().optional(),
          authorizedSignerTitle: z.string().optional(),
          consentGiven: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          // Truncate varchar fields to their max lengths to prevent DB errors
          const truncate = (val: string | undefined, maxLen: number): string | undefined => {
            if (!val) return val;
            return val.length > maxLen ? val.slice(0, maxLen) : val;
          };

          const sanitizedInput = {
            legalBusinessName: truncate(input.legalBusinessName, 255),
            dba: truncate(input.dba, 255),
            entityType: truncate(input.entityType, 64),
            federalTaxId: truncate(input.federalTaxId, 32),
            dateEstablished: truncate(input.dateEstablished, 16),
            lengthOfOwnership: truncate(input.lengthOfOwnership, 64),
            typeOfBusiness: truncate(input.typeOfBusiness, 255),
            businessWebsite: truncate(input.businessWebsite, 512),
            businessPhone: truncate(input.businessPhone, 32),
            businessEmail: truncate(input.businessEmail, 320),
            businessAddress: input.businessAddress, // text — no limit
            mailingAddress: input.mailingAddress, // text — no limit
            amountRequested: truncate(input.amountRequested, 64),
            useOfFunds: input.useOfFunds, // text — no limit
            urgency: truncate(input.urgency, 64),
            existingAdvances: truncate(input.existingAdvances, 16),
            existingAdvanceDetails: input.existingAdvanceDetails, // text — no limit
            ownerFirstName: truncate(input.ownerFirstName, 128),
            ownerLastName: truncate(input.ownerLastName, 128),
            ownerTitle: truncate(input.ownerTitle, 128),
            ownershipPercentage: truncate(input.ownershipPercentage, 16),
            ownerSsn: truncate(input.ownerSsn, 16),
            ownerDob: truncate(input.ownerDob, 16),
            ownerPhone: truncate(input.ownerPhone, 32),
            ownerEmail: truncate(input.ownerEmail, 320),
            ownerHomeAddress: input.ownerHomeAddress, // text — no limit
            bankName: truncate(input.bankName, 255),
            accountType: truncate(input.accountType, 32),
            accountNumber: truncate(input.accountNumber, 64),
            routingNumber: truncate(input.routingNumber, 32),
            avgMonthlyRevenue: truncate(input.avgMonthlyRevenue, 64),
            avgMonthlyDeposits: truncate(input.avgMonthlyDeposits, 64),
            debt1Creditor: truncate(input.debt1Creditor, 255),
            debt1Balance: truncate(input.debt1Balance, 64),
            debt1Payment: truncate(input.debt1Payment, 64),
            debt2Creditor: truncate(input.debt2Creditor, 255),
            debt2Balance: truncate(input.debt2Balance, 64),
            debt2Payment: truncate(input.debt2Payment, 64),
            debt3Creditor: truncate(input.debt3Creditor, 255),
            debt3Balance: truncate(input.debt3Balance, 64),
            debt3Payment: truncate(input.debt3Payment, 64),
            hasLiens: truncate(input.hasLiens, 16),
            liensExplanation: input.liensExplanation, // text — no limit
            currentProcessor: truncate(input.currentProcessor, 255),
            merchantId: truncate(input.merchantId, 128),
            monthlyCardVolume: truncate(input.monthlyCardVolume, 64),
            avgTicketSize: truncate(input.avgTicketSize, 64),
            chargebackHistory: truncate(input.chargebackHistory, 255),
            authorizedSignerName: truncate(input.authorizedSignerName, 255),
            authorizedSignerTitle: truncate(input.authorizedSignerTitle, 128),
            consentGiven: truncate(input.consentGiven, 8),
            documents: input.documents ?? null,
          };

          const id = await createApplication(sanitizedInput);

          // Notify the owner about the new application
          const businessName = input.legalBusinessName || input.dba || "Unknown Business";
          const amount = input.amountRequested || "Not specified";
          const ownerName = [input.ownerFirstName, input.ownerLastName].filter(Boolean).join(" ") || "Applicant";
          const applicantEmail = input.ownerEmail || input.businessEmail;

          await notifyOwner({
            title: `New Funding Application: ${businessName}`,
            content: `A new capital application has been submitted.\n\nBusiness: ${businessName}\nAmount Requested: ${amount}\nContact: ${ownerName}\nEmail: ${applicantEmail || "N/A"}\nPhone: ${input.businessPhone || input.ownerPhone || "N/A"}\n\nView in your dashboard to review.`,
          }).catch((err) => {
            console.error("[Notification] Failed to notify owner:", err);
          });

          // Send confirmation email to the applicant (best-effort, does not block submission)
          let emailSent = false;
          if (applicantEmail) {
            try {
              const { subject, html } = applicationConfirmationEmail({
                businessName,
                ownerName,
                amountRequested: amount,
              });
              const emailResult = await sendEmail({
                to: applicantEmail,
                subject,
                html,
                replyTo: "applications@smarterswipe.com",
              });
              emailSent = emailResult.success;
              if (!emailResult.success) {
                console.warn(`[Email] Confirmation email failed for ${applicantEmail}: ${emailResult.error}`);
              }
            } catch (err) {
              console.error("[Email] Unexpected error sending confirmation:", err);
            }
          }

          return { success: true, id, emailSent };
        } catch (err: unknown) {
          console.error("[Application] Submit failed:", err);
          // Never expose raw SQL errors to the client
          return { success: false, id: null, emailSent: false, error: "We encountered an issue submitting your application. Please try again or contact support." };
        }
      }),

    /** Admin: list all applications (restricted to admin session) */
    list: smarterswipeAdminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).optional(),
      )
      .query(async ({ input }) => {
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        return listApplications(limit, offset);
      }),

    /** Admin: get a single application by ID (restricted to admin session) */
    getById: smarterswipeAdminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getApplicationById(input.id);
      }),

    /** Admin: update application status (restricted to admin session) */
    updateStatus: smarterswipeAdminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "reviewing", "approved", "declined", "funded"]),
        }),
      )
      .mutation(async ({ input }) => {
        await updateApplicationStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
