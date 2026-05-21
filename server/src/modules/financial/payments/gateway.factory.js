const stripeService = require('./stripe.service');

// Abstract Gateway Factory
class PaymentGatewayFactory {
  static getProvider(providerName = 'stripe') {
    switch (providerName.toLowerCase()) {
      case 'stripe':
        return stripeService;
      case 'paypal':
        // return paypalService;
        throw new Error('PayPal provider not yet implemented.');
      case 'razorpay':
        // return razorpayService;
        throw new Error('Razorpay provider not yet implemented.');
      case 'square':
        // return squareService;
        throw new Error('Square provider not yet implemented.');
      default:
        return stripeService;
    }
  }
}

module.exports = PaymentGatewayFactory;
