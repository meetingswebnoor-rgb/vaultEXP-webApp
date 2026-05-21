const PaymentGatewayFactory = require('./gateway.factory');
const prisma = require('../../../lib/prisma');
const ledgerService = require('../accounting/ledger.service');
const securityService = require('../../security/security.service');

/**
 * Handles incoming webhooks. Note: req.body MUST be the raw Buffer.
 */
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
  
  const stripeService = PaymentGatewayFactory.getProvider('stripe');
  
  let event;
  try {
    event = stripeService.verifyWebhookSignature(req.body, signature, webhookSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    await securityService.logEvent({
      userId: null,
      action: 'SUSPICIOUS_ACTIVITY',
      severity: 'CRITICAL',
      ipAddress: req.ip,
      details: `Failed Stripe Webhook Validation: ${err.message}`
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await processSuccessfulPayment(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.error('Payment failed for intent:', failedIntent.id);
        break;
      case 'checkout.session.completed':
        await processCheckoutSession(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await processSubscriptionUpdate(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    res.status(500).json({ error: 'Internal server error while processing webhook.' });
  }
};

async function processSuccessfulPayment(paymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;
  const userId = paymentIntent.metadata?.userId;
  
  if (!invoiceId) return; // Not an invoice payment

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  // Assuming a default system wallet for simplicity, or look it up based on businessId
  const systemWallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!systemWallet) return;

  const amount = (paymentIntent.amount_received / 100).toFixed(2); // Convert from cents

  // 1. Core Transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      walletId: systemWallet.id,
      type: 'income',
      amount,
      balanceAfter: 0, 
      currency: invoice.currency,
      description: `Stripe Payment for Invoice ${invoice.invoiceNumber}`,
      date: new Date(),
      referenceId: paymentIntent.id
    }
  });

  // 2. Ledger
  await ledgerService.recordLedgerEntry(
    userId,
    systemWallet.id,
    transaction.id,
    amount,
    true,
    `Stripe payment received`
  );

  // 3. Payment record
  await prisma.payment.create({
    data: {
      invoiceId,
      transactionId: transaction.id,
      amount,
      method: 'STRIPE',
      status: 'COMPLETED',
      referenceId: paymentIntent.id
    }
  });

  // 4. Update Invoice
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'paid', paidAt: new Date() }
  });
}

async function processCheckoutSession(session) {
  if (session.mode !== 'subscription') return;

  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;
  const userId = session.metadata?.userId;

  if (!userId) return;

  // Retrieve the subscription to get the price ID
  const stripeService = PaymentGatewayFactory.getProvider('stripe');
  const subscription = await stripeService.stripe.subscriptions.retrieve(stripeSubscriptionId);
  const stripePriceId = subscription.items.data[0].price.id;

  const plan = await prisma.saaSPlan.findFirst({ where: { stripePriceId } });
  if (!plan) return;

  // Deactivate old subscriptions
  await prisma.subscription.updateMany({
    where: { userId, status: 'ACTIVE' },
    data: { status: 'CANCELED' }
  });

  // Create new active subscription
  await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      interval: plan.interval,
      status: 'ACTIVE',
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      stripeSubscriptionId,
      stripePriceId,
      storageUsed: 0,
      aiTokensUsed: 0,
      automationRuns: 0,
      teamMembers: 0,
      uploadsCount: 0
    }
  });
}

async function processSubscriptionUpdate(subscription) {
  const stripeSubscriptionId = subscription.id;
  const status = subscription.status === 'active' ? 'ACTIVE' : (subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED');
  const stripePriceId = subscription.items.data[0].price.id;

  const plan = await prisma.saaSPlan.findFirst({ where: { stripePriceId } });

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: {
      status,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      planId: plan ? plan.id : undefined,
      planName: plan ? plan.name : undefined,
      amount: plan ? plan.price : undefined,
      interval: plan ? plan.interval : undefined,
      stripePriceId
    }
  });
}

module.exports = {
  handleStripeWebhook
};
