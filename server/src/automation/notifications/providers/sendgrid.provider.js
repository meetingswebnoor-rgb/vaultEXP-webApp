const sgMail = require('@sendgrid/mail');

class SendgridProvider {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async send(options) {
    const { to, subject, html, text } = options;
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`[SendGrid Mock] Sending email to ${to}: ${subject}`);
      return [{ statusCode: 202, body: 'mock' }];
    }
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@vaultexp.com',
      subject,
      text,
      html,
    };
    const response = await sgMail.send(msg);
    return response;
  }
}

module.exports = new SendgridProvider();
