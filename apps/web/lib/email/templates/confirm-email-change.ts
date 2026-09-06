type ConfirmEmailChangeTemplateProps = {
  firstName: string
  newEmail: string
  verificationUrl: string
}

export function confirmEmailChangeTemplate({
  firstName,
  newEmail,
  verificationUrl,
}: ConfirmEmailChangeTemplateProps) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirm your new email address</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f5f7f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2937;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background-color: #f5f7f9; margin: 0; padding: 40px 20px;"
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  max-width: 560px;
                  background-color: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  border: 1px solid #e5e7eb;
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    style="
                      padding: 28px 32px;
                      border-bottom: 1px solid #eef0f2;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td>
                          <span
                            style="
                              display: inline-block;
                              width: 38px;
                              height: 38px;
                              line-height: 38px;
                              text-align: center;
                              background-color: #2eafb4;
                              color: #ffffff;
                              border-radius: 10px;
                              font-size: 16px;
                              font-weight: 700;
                              margin-right: 10px;
                              vertical-align: middle;
                            "
                          >
                            IF
                          </span>

                          <span
                            style="
                              font-size: 20px;
                              font-weight: 700;
                              color: #111827;
                              vertical-align: middle;
                            "
                          >
                            Invoice Flow
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px 32px;">

                    <div
                      style="
                        width: 48px;
                        height: 48px;
                        line-height: 48px;
                        text-align: center;
                        background-color: #e8f7f7;
                        border-radius: 50%;
                        color: #2eafb4;
                        font-size: 22px;
                        margin-bottom: 22px;
                      "
                    >
                      ✓
                    </div>

                    <h1
                      style="
                        margin: 0 0 14px;
                        font-size: 26px;
                        line-height: 1.3;
                        color: #111827;
                      "
                    >
                      Confirm your new email address
                    </h1>

                    <p
                      style="
                        margin: 0 0 20px;
                        font-size: 15px;
                        line-height: 1.7;
                        color: #4b5563;
                      "
                    >
                      Hi ${firstName},
                    </p>

                    <p
                      style="
                        margin: 0 0 20px;
                        font-size: 15px;
                        line-height: 1.7;
                        color: #4b5563;
                      "
                    >
                      You recently requested to change the email address
                      associated with your Invoice Flow account.
                    </p>

                    <!-- New email -->
                    <div
                      style="
                        margin: 24px 0;
                        padding: 16px 18px;
                        background-color: #f8fafc;
                        border: 1px solid #e5e7eb;
                        border-radius: 10px;
                      "
                    >
                      <p
                        style="
                          margin: 0 0 6px;
                          font-size: 12px;
                          font-weight: 600;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          color: #6b7280;
                        "
                      >
                        New email address
                      </p>

                      <p
                        style="
                          margin: 0;
                          font-size: 16px;
                          font-weight: 600;
                          color: #111827;
                          word-break: break-word;
                        "
                      >
                        ${newEmail}
                      </p>
                    </div>

                    <p
                      style="
                        margin: 0 0 28px;
                        font-size: 15px;
                        line-height: 1.7;
                        color: #4b5563;
                      "
                    >
                      Click the button below to confirm this change.
                      For your security, this link expires in
                      <strong style="color: #111827;">30 minutes</strong>.
                    </p>

                    <!-- Button -->
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="${verificationUrl}"
                            style="
                              display: inline-block;
                              width: 100%;
                              max-width: 320px;
                              box-sizing: border-box;
                              padding: 14px 24px;
                              background-color: #2eafb4;
                              color: #ffffff;
                              text-decoration: none;
                              font-size: 15px;
                              font-weight: 700;
                              text-align: center;
                              border-radius: 8px;
                            "
                          >
                            Confirm new email address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Security notice -->
                    <div
                      style="
                        margin-top: 30px;
                        padding: 16px 18px;
                        background-color: #fffbeb;
                        border: 1px solid #fde68a;
                        border-radius: 10px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #92400e;
                        "
                      >
                        <strong>Didn't request this change?</strong><br />
                        You can safely ignore this email. Your current email
                        address will remain unchanged.
                      </p>
                    </div>

                    <!-- Fallback URL -->
                    <p
                      style="
                        margin: 28px 0 0;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #9ca3af;
                      "
                    >
                      If the button above doesn't work, copy and paste this
                      link into your browser:
                    </p>

                    <p
                      style="
                        margin: 6px 0 0;
                        font-size: 12px;
                        line-height: 1.6;
                        word-break: break-all;
                      "
                    >
                      <a
                        href="${verificationUrl}"
                        style="
                          color: #2eafb4;
                          text-decoration: underline;
                        "
                      >
                        ${verificationUrl}
                      </a>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    style="
                      padding: 24px 32px;
                      background-color: #f8fafc;
                      border-top: 1px solid #eef0f2;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        text-align: center;
                        color: #6b7280;
                      "
                    >
                      This is an automated security email from Invoice Flow.
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        text-align: center;
                        color: #9ca3af;
                      "
                    >
                      © ${new Date().getFullYear()} Invoice Flow.
                      All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

              <p
                style="
                  margin: 20px 0 0;
                  font-size: 11px;
                  color: #9ca3af;
                  text-align: center;
                "
              >
                Please do not reply to this email.
              </p>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}