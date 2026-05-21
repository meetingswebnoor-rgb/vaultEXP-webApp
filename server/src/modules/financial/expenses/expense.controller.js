const expenseService = require('./expense.service');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, { expense }, 'Expense created successfully.'));
});

const getExpenses = catchAsync(async (req, res) => {
  const expenses = await expenseService.getExpenses(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, { expenses }, 'Expenses retrieved.'));
});

const getAiInsights = catchAsync(async (req, res) => {
  const insights = await expenseService.getAiInsights(req.user.id);
  res.status(200).json(new ApiResponse(200, insights, 'Expense intelligence generated.'));
});

const updateTaxStatus = catchAsync(async (req, res) => {
  const { isTaxDeductible, taxCategory } = req.body;
  const expense = await expenseService.updateTaxStatus(req.user.id, req.params.id, isTaxDeductible, taxCategory);
  res.status(200).json(new ApiResponse(200, { expense }, 'Tax status updated.'));
});

module.exports = {
  createExpense,
  getExpenses,
  getAiInsights,
  updateTaxStatus
};
