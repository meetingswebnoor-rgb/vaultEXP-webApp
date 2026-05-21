const PaymentGatewayFactory = require('./gateway.factory');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const createPaymentIntent = catchAsync(async (req, res) => {
  const { amount, currency, invoiceId, provider = 'stripe' } = req.body;
  
  const gateway = PaymentGatewayFactory.getProvider(provider);
  
  const intent = await gateway.createPaymentIntent(amount, currency, {
    invoiceId,
    userId: req.user.id
  });

  res.status(200).json(new ApiResponse(200, intent, 'Payment intent created successfully.'));
});

module.exports = {
  createPaymentIntent
};
