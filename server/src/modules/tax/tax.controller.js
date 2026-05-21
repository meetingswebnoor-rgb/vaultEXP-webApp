/**
 * tax.controller.js
 * ─────────────────────────────────────────────────────────────────
 * HTTP request handler layer for Tax Strategic Optimization.
 */

'use strict';

const taxService = require('./tax.service');
const { generateTaxStrategy } = require('../../ai/index');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

exports.getTaxStrategyAdvice = catchAsync(async (req, res) => {
  const result = await generateTaxStrategy(req.user.id);
  if (result.error) {
    return res.status(500).json(new ApiResponse(500, result, 'Failed to generate tax strategizing report'));
  }
  res.status(200).json(new ApiResponse(200, result, 'AI Tax strategy audit completed successfully'));
});

exports.getDeductions = catchAsync(async (req, res) => {
  const center = await taxService.getDeductionCenter(req.user.id);
  res.status(200).json(new ApiResponse(200, center, 'Tax deduction details retrieved successfully'));
});

exports.updateDeductionStatus = catchAsync(async (req, res) => {
  const { isDeductible, taxCategory } = req.body;
  const updated = await taxService.toggleDeductible(req.user.id, req.params.expenseId, isDeductible, taxCategory);
  res.status(200).json(new ApiResponse(200, updated, 'Expense tax deduction status modified successfully'));
});

exports.getQuarterlySummary = catchAsync(async (req, res) => {
  const { year } = req.query;
  const summary = await taxService.getQuarterlySummary(req.user.id, year);
  res.status(200).json(new ApiResponse(200, summary, 'Quarterly tax summary generated.'));
});

exports.runComplianceAudit = catchAsync(async (req, res) => {
  const audit = await taxService.runComplianceAudit(req.user.id);
  res.status(200).json(new ApiResponse(200, audit, 'Compliance audit completed.'));
});
