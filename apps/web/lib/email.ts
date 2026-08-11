import { Resend } from "resend";

// Ensure you add RESEND_API_KEY to your local .env file
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailArgs {
  to: string;
  firstName: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  to,
  firstName,
  verificationUrl,
}: SendVerificationEmailArgs): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // Replace with your verified custom domain later
      to: [to],
      subject: "Verify your account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome, ${firstName}!</h2>
          <p>Thank you for creating an account. Please click the button below to confirm your email address and activate your account:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
               Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email catch-block:", err);
    return { success: false, error: err };
  }
}
