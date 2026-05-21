const { Resend } = require('resend');

class ResendProvider {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
  }

  async send(options) {
    const { to, subject, html, text } = options;
    if (!process.env.RESEND_API_KEY) {
      console.log(`[Resend Mock] Sending email to ${to}: ${subject}`);
      return { id: 'mock_resend_id' };
    }
    const response = await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
      text
    });
    return response;
  }
}

module.exports = new ResendProvider();
