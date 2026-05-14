'use strict';

const tenantService = require('./tenant.service');
const catchAsync    = require('../../utils/catchAsync');
const ApiResponse   = require('../../utils/apiResponse');

// POST /api/property/:propertyId/tenants
exports.createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.create(req.user.id, req.params.propertyId, req.body);
  res.status(201).json(new ApiResponse(201, tenant, 'Tenant added successfully'));
});

// GET /api/property/:propertyId/tenants
exports.listTenants = catchAsync(async (req, res) => {
  const tenants = await tenantService.list(req.user.id, req.params.propertyId);
  res.status(200).json(new ApiResponse(200, { tenants, count: tenants.length }, 'Tenants retrieved'));
});

// GET /api/tenants/:id
exports.getTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.getById(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, tenant, 'Tenant retrieved'));
});

// PUT /api/tenants/:id
exports.updateTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.update(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, tenant, 'Tenant updated successfully'));
});

// DELETE /api/tenants/:id
exports.deleteTenant = catchAsync(async (req, res) => {
  const result = await tenantService.delete(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, `Tenant "${result.name}" removed`));
});
