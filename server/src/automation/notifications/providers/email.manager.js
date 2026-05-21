const resendProvider = require('./resend.provider');
const sendgridProvider = require('./sendgrid.provider');

class EmailManager {
  constructor() {
    // Default to Resend, but use SendGrid if explicitly configured
    this.provider = process.env.EMAIL_PROVIDER === 'sendgrid' ? sendgridProvider : resendProvider;
  }

  async sendEmail(options) {
    return await this.provider.send(options);
  }
}

module.exports = new EmailManager();
