/**
 * Branded email templates for SmarterSwipe Capital
 */

/**
 * Build the confirmation email HTML sent to applicants after successful submission.
 */
export function applicationConfirmationEmail(params: {
  businessName: string;
  ownerName: string;
  amountRequested: string;
}): { subject: string; html: string } {
  const subject = `Application Received — ${params.businessName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#0B1120;padding:32px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">SMARTERSWIPE</span>
              <span style="font-size:22px;font-weight:300;color:#7c8db5;letter-spacing:0.5px;"> CAPITAL</span>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding:40px 40px 0 40px;text-align:center;">
              <div style="width:64px;height:64px;border-radius:50%;background-color:#e8f5e9;display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;">
                <span style="font-size:32px;line-height:64px;">&#10003;</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#0B1120;text-align:center;">
                Application Received
              </h1>
              <p style="margin:0 0 24px 0;font-size:16px;line-height:26px;color:#4b5563;text-align:center;">
                Hi ${escapeHtml(params.ownerName)},
              </p>
              <p style="margin:0 0 24px 0;font-size:16px;line-height:26px;color:#4b5563;">
                Thank you for submitting your funding application for <strong style="color:#0B1120;">${escapeHtml(params.businessName)}</strong>. We've received your request and our team is reviewing your information.
              </p>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fc;border-radius:8px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 0 12px 0;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
                          Application Summary
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:14px;color:#6b7280;padding:4px 0;">Business Name</td>
                              <td style="font-size:14px;color:#0B1120;font-weight:600;text-align:right;padding:4px 0;">${escapeHtml(params.businessName)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:14px;color:#6b7280;padding:4px 0;">Amount Requested</td>
                              <td style="font-size:14px;color:#0B1120;font-weight:600;text-align:right;padding:4px 0;">${escapeHtml(params.amountRequested)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:14px;color:#6b7280;padding:4px 0;">Status</td>
                              <td style="font-size:14px;font-weight:600;text-align:right;padding:4px 0;">
                                <span style="background-color:#dbeafe;color:#2951D5;padding:3px 10px;border-radius:12px;font-size:12px;">Under Review</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#0B1120;">
                What Happens Next?
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:24px;color:#4b5563;">
                    <strong style="color:#2951D5;">1.</strong>&nbsp; Our team reviews your application and documents
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:24px;color:#4b5563;">
                    <strong style="color:#2951D5;">2.</strong>&nbsp; We may reach out for additional information if needed
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:24px;color:#4b5563;">
                    <strong style="color:#2951D5;">3.</strong>&nbsp; You'll receive a pre-offer within 24 hours
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="margin:0 0 16px 0;font-size:15px;color:#6b7280;">
                Have questions? Reply to this email or contact us directly.
              </p>
              <a href="https://smarterswipe.com" style="display:inline-block;background-color:#2951D5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                Visit SmarterSwipe
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fc;padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;line-height:20px;color:#9ca3af;text-align:center;">
                SmarterSwipe Capital &mdash; Helping businesses access smarter funding.<br />
                This is an automated confirmation. Please do not reply unless you have questions.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/** Escape HTML special characters to prevent injection in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
