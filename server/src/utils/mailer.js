/**
 * server/src/utils/mailer.js
 * ─────────────────────────────────────────────────────────────────
 * Reusable email service using nodemailer.
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `VaultEXP <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`[MAILER] Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`[MAILER] Error sending email to ${to}:`, error.message);
    throw new Error('Failed to send email');
  }
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #05050A; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1f2937;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00FF88; margin: 0; font-size: 28px; letter-spacing: -0.5px;">VaultEXP</h1>
      </div>
      <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="color: #9CA3AF; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        We received a request to reset the password for your VaultEXP account. Click the button below to securely set a new password. This link will expire in 1 hour.
      </p>
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #00FF88; color: #05050A; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 8px; font-size: 16px;">Reset Password</a>
      </div>
      <p style="color: #6B7280; font-size: 14px; line-height: 1.5; border-top: 1px solid #1f2937; padding-top: 20px;">
        If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
      </p>
    </div>
  `;
  return sendEmail({ to, subject: 'VaultEXP - Password Reset Request', html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
};
