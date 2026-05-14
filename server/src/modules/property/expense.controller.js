'use strict';

const expenseService = require('./expense.service');
const catchAsync     = require('../../utils/catchAsync');
const ApiResponse    = require('../../utils/apiResponse');

// POST /api/property/:propertyId/expenses
exports.createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.create(req.user.id, req.params.propertyId, req.body);
  res.status(201).json(new ApiResponse(201, expense, 'Expense added successfully'));
});

// GET /api/property/:propertyId/expenses
exports.listExpenses = catchAsync(async (req, res) => {
  const expenses = await expenseService.list(req.user.id, req.params.propertyId);
  res.status(200).json(new ApiResponse(200, { expenses, count: expenses.length }, 'Expenses retrieved'));
});

// GET /api/property/expense/:id
exports.getExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getById(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, expense, 'Expense retrieved'));
});

// PUT /api/property/expense/:id
exports.updateExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.update(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, expense, 'Expense updated successfully'));
});

// DELETE /api/property/expense/:id
exports.deleteExpense = catchAsync(async (req, res) => {
  const result = await expenseService.delete(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Expense removed'));
});
