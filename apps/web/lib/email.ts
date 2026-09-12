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
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      console.error("BREVO_CONFIG_ERROR: BREVO_API_KEY environment variable is missing.");
      return { success: false, error: "Email configuration error." };
    }

    // Trigger automated mail delivery via Brevo Transactional API
    const response = await fetch("https://brevo.com", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: "Invoice Flow", 
          email: "your-verified-email@domain.com" // 👈 Swap this with your verified sender email in Brevo
        },
        to: [{ email: to }],
        subject: "Verify your account",
        htmlContent: `
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
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Brevo API error:", responseData);
      return { success: false, error: responseData };
    }

    // Return the response data containing Brevo's messageId on success
    return { success: true, data: responseData };
  } catch (err) {
    console.error("Failed to send email catch-block:", err);
    return { success: false, error: err };
  }
}
