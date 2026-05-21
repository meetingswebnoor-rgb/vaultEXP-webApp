const Stripe = require('stripe');

// For enterprise grade, this should use keys from DB per business, 
// but we'll use env for platform-wide logic in this architecture template.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

class StripeService {
  /**
   * Create a PaymentIntent. 
   * The frontend uses the returned client_secret to complete payment securely via Stripe Elements.
   */
  async createPaymentIntent(amount, currency = 'USD', metadata = {}) {
    try {
      // Stripe expects amounts in cents for USD
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata,
        // automatic_payment_methods: { enabled: true },
      });
      
      return {
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id
      };
    } catch (error) {
      console.error('[StripeService] Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Validate incoming webhook signatures.
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    try {
      const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
      return event;
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}

module.exports = new StripeService();
