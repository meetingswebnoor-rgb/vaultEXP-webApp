const prisma = require('../../lib/prisma');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

exports.getPlans = async () => {
  const plans = await prisma.saaSPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });
  return plans;
};

exports.getCurrentSubscription = async (userId) => {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true }
  });
  return sub;
};

exports.createCheckoutSession = async (user, priceId) => {
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    // If no real stripe, we mock it for development purposes
    if (!process.env.STRIPE_SECRET_KEY) {
      return `http://localhost:3000/settings/billing?mock_checkout=success&priceId=${priceId}`;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id }
    });
    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId }
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return `http://localhost:3000/settings/billing?mock_checkout=success&priceId=${priceId}`;
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing?success=true`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
    metadata: {
      userId: user.id
    }
  });

  return session.url;
};

exports.createPortalSession = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) {
    throw new Error('No active billing customer found.');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return `http://localhost:3000/settings/billing?mock_portal=true`;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing`,
  });

  return session.url;
};
