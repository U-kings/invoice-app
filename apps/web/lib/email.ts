import { BrevoClient } from "@getbrevo/brevo"

interface SendVerificationEmailArgs {
  to: string
  firstName: string
  verificationUrl: string
}

export async function sendVerificationEmail({
  to,
  firstName,
  verificationUrl,
}: SendVerificationEmailArgs): Promise<{
  success: boolean
  data?: any
  error?: any
}> {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY

    if (!brevoApiKey) {
      console.error(
        "BREVO_CONFIG_ERROR: BREVO_API_KEY environment variable is missing."
      )
      return { success: false, error: "Email configuration error." }
    }

    console.log("DEBUG: Current Key Prefix ->", brevoApiKey?.substring(0, 12))
    console.log("DEBUG: Current Key Length ->", brevoApiKey?.length)

    // 1. 🚀 FIXED FOR V6: Initialize the new BrevoClient instance directly with your key
    const client = new BrevoClient({
      apiKey: brevoApiKey.trim(),
    })

    // 2. Dispatch via the unified namespace chain matching version 6 definitions
    const response = await client.transactionalEmails.sendTransacEmail({
      subject: "Verify your account",
      sender: {
        name: "Invoice Flow",
        email: "kingsleyigbokwe909@gmail.com", // ⚠️ Remember this must be verified in Brevo
      },
      to: [{ email: to }],
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
    })

    // The response object natively contains messageId details
    return { success: true, data: response }
  } catch (err: any) {
    // Catch-block error parser updated to catch v6 structured errors securely
    const errorDetails = err.body || err
    console.error("Brevo SDK delivery failed:", errorDetails)
    
    return { success: false, error: errorDetails }
  }
}
