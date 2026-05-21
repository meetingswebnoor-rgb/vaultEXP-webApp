const transactionService = require('./transaction.service');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const getTransactions = catchAsync(async (req, res) => {
  const transactions = await transactionService.getTransactions(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, { transactions }, 'Transactions retrieved successfully'));
});

const getAiInsights = catchAsync(async (req, res) => {
  const insights = await transactionService.getAiInsights(req.user.id);
  res.status(200).json(new ApiResponse(200, insights, 'AI insights generated successfully'));
});

const updateCategory = catchAsync(async (req, res) => {
  const { category } = req.body;
  const transaction = await transactionService.updateCategory(req.user.id, req.params.id, category);
  res.status(200).json(new ApiResponse(200, { transaction }, 'Transaction categorized successfully'));
});

module.exports = {
  getTransactions,
  getAiInsights,
  updateCategory
};
