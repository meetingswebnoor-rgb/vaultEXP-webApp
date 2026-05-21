/**
 * property.controller.js
 * ─────────────────────────────────────────────────────────────────
 * Thin HTTP layer — validates shape of the request, calls the service,
 * shapes the response.  Zero business logic lives here.
 */
'use strict';

const propertyService = require('./property.service');
const catchAsync      = require('../../utils/catchAsync');
const ApiResponse     = require('../../utils/apiResponse');
const { generatePropertyAdvice } = require('../../ai/index');

// ── POST /api/property/create ─────────────────────────────────
exports.createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.create(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, property, 'Property created successfully'));
});

// ── GET /api/property ─────────────────────────────────────────
exports.listProperties = catchAsync(async (req, res) => {
  const result = await propertyService.list(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Properties retrieved successfully'));
});

// ── GET /api/property/:id ─────────────────────────────────────
exports.getProperty = catchAsync(async (req, res) => {
  const property = await propertyService.getById(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, property, 'Property retrieved successfully'));
});

// ── PUT /api/property/:id ─────────────────────────────────────
exports.updateProperty = catchAsync(async (req, res) => {
  const property = await propertyService.update(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, property, 'Property updated successfully'));
});

// ── DELETE /api/property/:id ──────────────────────────────────
exports.deleteProperty = catchAsync(async (req, res) => {
  const result = await propertyService.delete(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, `Property "${result.name}" deleted`));
});

// ── GET /api/property/:id/ai-context ──────────────────────────
exports.getAIContext = catchAsync(async (req, res) => {
  const context = await propertyService.getPropertyContext(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, context, 'AI context generated'));
});

// ── GET /api/property/:id/analytics ──────────────────────────
exports.getAnalytics = catchAsync(async (req, res) => {
  const analytics = await propertyService.getAnalytics(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics retrieved'));
});

// ── GET /api/property/stats ───────────────────────────────────
// Portfolio-level stats for the dashboard (no :id param)
exports.getStats = catchAsync(async (req, res) => {
  const stats = await propertyService.getStats(req.user.id);
  res.status(200).json(new ApiResponse(200, stats, 'Property stats retrieved'));
});

// ── GET /api/property/:id/ai-advice ───────────────────────────
exports.getAIAdvice = catchAsync(async (req, res) => {
  const result = await generatePropertyAdvice(req.user.id, req.params.id);
  if (result.error) {
    return res.status(500).json(new ApiResponse(500, result, 'Failed to generate AI advice'));
  }
  res.status(200).json(new ApiResponse(200, result, 'AI property advice generated successfully'));
});
