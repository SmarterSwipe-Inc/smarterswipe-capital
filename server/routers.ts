import { COOKIE_NAME, ADMIN_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, smarterswipeAdminProcedure, router } from "./_core/trpc";
import { createApplication, listApplications, getApplicationById, updateApplicationStatus } from "./db";
import { notifyOwner } from "./_core/notification";
import { validateAdminLogin, signAdminSession, seedAdminAccount, isWhitelistedAdmin } from "./adminAuth";
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
        const id = await createApplication({
          ...input,
          documents: input.documents ?? null,
        });

        // Notify the owner about the new application
        const businessName = input.legalBusinessName || input.dba || "Unknown Business";
        const amount = input.amountRequested || "Not specified";
        await notifyOwner({
          title: `New Funding Application: ${businessName}`,
          content: `A new capital application has been submitted.\n\nBusiness: ${businessName}\nAmount Requested: ${amount}\nContact: ${input.ownerFirstName || ""} ${input.ownerLastName || ""}\nEmail: ${input.businessEmail || input.ownerEmail || "N/A"}\nPhone: ${input.businessPhone || input.ownerPhone || "N/A"}\n\nView in your dashboard to review.`,
        }).catch((err) => {
          console.error("[Notification] Failed to notify owner:", err);
        });

        return { success: true, id };
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
