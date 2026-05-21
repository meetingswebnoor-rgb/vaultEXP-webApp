/**
 * investment.controller.js
 * ─────────────────────────────────────────────────────────────────
 * Thin HTTP layer for Investment module.
 */

'use strict';

const investmentService = require('./investment.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');
const { generateInvestmentIntelligence } = require('../../ai/index');

exports.createInvestment = catchAsync(async (req, res) => {
  const investment = await investmentService.create(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, investment, 'Investment created successfully'));
});

exports.listInvestments = catchAsync(async (req, res) => {
  const investments = await investmentService.list(req.user.id, req.query);
  const analytics = await investmentService.getAnalytics(req.user.id);
  
  res.status(200).json(new ApiResponse(200, { 
    investments, 
    count: investments.length,
    summary: {
      totalValue: analytics.totalCurrentValue,
      totalProfitLoss: analytics.totalProfit
    }
  }, 'Investments retrieved successfully'));
});

exports.getInvestment = catchAsync(async (req, res) => {
  const investment = await investmentService.getById(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, investment, 'Investment retrieved successfully'));
});

exports.updateInvestment = catchAsync(async (req, res) => {
  const investment = await investmentService.update(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, investment, 'Investment updated successfully'));
});

exports.deleteInvestment = catchAsync(async (req, res) => {
  await investmentService.delete(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Investment deleted successfully'));
});

exports.getAnalytics = catchAsync(async (req, res) => {
  const analytics = await investmentService.getAnalytics(req.user.id);
  res.status(200).json(new ApiResponse(200, analytics, 'Investment analytics retrieved successfully'));
});

exports.getAIIntelligence = catchAsync(async (req, res) => {
  const result = await generateInvestmentIntelligence(req.user.id);
  if (result.error) {
    return res.status(500).json(new ApiResponse(500, result, 'Failed to generate investment intelligence'));
  }
  res.status(200).json(new ApiResponse(200, result, 'Investment AI intelligence generated successfully'));
});
