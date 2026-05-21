const subscriptionService = require('./subscription.service');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const createSubscription = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.createSubscription(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, { subscription }, 'Subscription created successfully.'));
});

const getSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await subscriptionService.getSubscriptions(req.user.id);
  res.status(200).json(new ApiResponse(200, { subscriptions }, 'Subscriptions retrieved.'));
});

// For Client Portal
const getClientSubscriptions = catchAsync(async (req, res) => {
  // Assuming the client's businessId is passed, or derived from their login in a real app
  const { businessId } = req.query;
  const subscriptions = await subscriptionService.getClientSubscriptions(businessId);
  res.status(200).json(new ApiResponse(200, { subscriptions }, 'Client subscriptions retrieved.'));
});

const processRenewals = catchAsync(async (req, res) => {
  // In production this would be triggered by an internal cron with a secret key
  const result = await subscriptionService.processRenewals(req.user.id);
  res.status(200).json(new ApiResponse(200, result, `Processed ${result.processedCount} renewals.`));
});

const cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, { subscription }, 'Subscription canceled.'));
});

module.exports = {
  createSubscription,
  getSubscriptions,
  getClientSubscriptions,
  processRenewals,
  cancelSubscription
};
