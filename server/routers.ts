import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { createApplication, listApplications, getApplicationById, updateApplicationStatus } from "./db";
import { notifyOwner } from "./_core/notification";
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

    /** Admin: list all applications */
    list: adminProcedure
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

    /** Admin: get a single application by ID */
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getApplicationById(input.id);
      }),

    /** Admin: update application status */
    updateStatus: adminProcedure
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
