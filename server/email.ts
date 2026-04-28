/**
 * Email helper — sends transactional emails via Resend API
 * https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "SmarterSwipe Capital <applications@smarterswipe.com>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend.
 * Returns { success, id } on success, { success: false, error } on failure.
 * Never throws — callers should handle the boolean result.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(`[Email] Resend API error (${res.status}): ${detail}`);
      return { success: false, error: `Resend API error: ${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, id: data.id };
  } catch (err) {
    console.warn("[Email] Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
