export function getForgotPasswordTemplate(
  firstName: string,
  verificationCode: string,
): {
  text: string;
  html: string;
} {
  const text = `Dear ${firstName},

  We received a request to reset your password for your Crustco account. Please use the verification code below to proceed:

  Verification Code: ${verificationCode}

  If you did not request a password reset, please ignore this email or contact support.

  Best regards,
  Crustco Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Dear ${firstName},</p>
        <p>We received a request to reset your password for your <strong>Crustco</strong> account. Please use the verification code below to proceed:</p>
        <div style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold;">
          ${verificationCode}
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
        <p style="font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} Crustco. All rights reserved.</p>
      </div>
    </div>`;

  return { text, html };
}
