'use strict';

const alertService  = require('./alert.service');
const catchAsync    = require('../../utils/catchAsync');
const ApiResponse   = require('../../utils/apiResponse');

// GET /api/property/:propertyId/alerts
exports.listAlerts = catchAsync(async (req, res) => {
  const alerts = await alertService.list(req.user.id, req.params.propertyId);
  res.status(200).json(new ApiResponse(200, { alerts, count: alerts.length }, 'Alerts retrieved'));
});

// POST /api/property/:propertyId/alerts/generate
exports.autoGenerateAlerts = catchAsync(async (req, res) => {
  const result = await alertService.autoGenerate(req.user.id, req.params.propertyId);
  res.status(200).json(new ApiResponse(200, result, 'Alerts auto-generated'));
});

// PUT /api/property/alert/:id/status
exports.updateAlertStatus = catchAsync(async (req, res) => {
  const alert = await alertService.updateStatus(req.user.id, req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, alert, 'Alert status updated'));
});

// DELETE /api/property/alert/:id
exports.deleteAlert = catchAsync(async (req, res) => {
  const result = await alertService.delete(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Alert removed'));
});
