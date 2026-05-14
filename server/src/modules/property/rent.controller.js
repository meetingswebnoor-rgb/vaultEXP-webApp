'use strict';

const rentService = require('./rent.service');
const catchAsync  = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

// GET /api/property/:propertyId/rent
exports.listRentRecords = catchAsync(async (req, res) => {
  const records = await rentService.list(req.user.id, req.params.propertyId, req.query);
  res.status(200).json(new ApiResponse(200, records, 'Rent records retrieved'));
});

// POST /api/property/:propertyId/rent/generate
exports.generateBulkRecords = catchAsync(async (req, res) => {
  const { month } = req.body;
  if (!month) {
    return res.status(400).json(new ApiResponse(400, null, 'Month (YYYY-MM) is required'));
  }
  const records = await rentService.generateBulkForMonth(req.user.id, req.params.propertyId, month);
  res.status(201).json(new ApiResponse(201, records, `Generated ${records.length} records for ${month}`));
});

// POST /api/property/:propertyId/tenant/:tenantId/rent
exports.getOrCreateRecord = catchAsync(async (req, res) => {
  const { month } = req.body;
  if (!month) {
    return res.status(400).json(new ApiResponse(400, null, 'Month (YYYY-MM) is required'));
  }
  const record = await rentService.getOrCreateMonthlyRecord(
    req.user.id, req.params.propertyId, req.params.tenantId, month
  );
  res.status(200).json(new ApiResponse(200, record, 'Rent record retrieved/created'));
});

// PUT /api/property/rent/:recordId
exports.updateRentRecord = catchAsync(async (req, res) => {
  const record = await rentService.update(req.user.id, req.params.recordId, req.body);
  res.status(200).json(new ApiResponse(200, record, 'Rent record updated'));
});
