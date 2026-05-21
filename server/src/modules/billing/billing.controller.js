const billingService = require('./billing.service');

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await billingService.getPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentSubscription = async (req, res, next) => {
  try {
    const subscription = await billingService.getCurrentSubscription(req.user.id);
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { priceId } = req.body;
    const sessionUrl = await billingService.createCheckoutSession(req.user, priceId);
    res.status(200).json({ success: true, data: { url: sessionUrl } });
  } catch (error) {
    next(error);
  }
};

exports.createPortalSession = async (req, res, next) => {
  try {
    const sessionUrl = await billingService.createPortalSession(req.user.id);
    res.status(200).json({ success: true, data: { url: sessionUrl } });
  } catch (error) {
    next(error);
  }
};
