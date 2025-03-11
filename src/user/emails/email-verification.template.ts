export function getVerificationEmailTemplate(verificationCode: string): {
  text: string;
  html: string;
} {
  const text = `Dear User,

  Thank you for signing up with Crustco. To complete your registration, please verify your email address by entering the verification code below:

  Verification Code: ${verificationCode}

  If you did not request this, please ignore this email.

  Best regards,
  Crustco Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Dear User,</p>
        <p>Thank you for signing up with <strong>Crustco</strong>. To complete your registration, please verify your email address by entering the verification code below:</p>
        <div style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold;">
          ${verificationCode}
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
        <p style="font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} Crustco. All rights reserved.</p>
      </div>
    </div>`;

  return { text, html };
}
