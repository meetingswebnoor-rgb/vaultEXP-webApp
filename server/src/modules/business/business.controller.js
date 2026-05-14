const businessService = require('./business.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const createBusiness = catchAsync(async (req, res) => {
  const business = await businessService.createBusiness(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, business, 'Business created successfully'));
});

const getBusinesses = catchAsync(async (req, res) => {
  const businesses = await businessService.getUserBusinesses(req.user.id);
  res.status(200).json(new ApiResponse(200, { businesses, count: businesses.length }, 'Businesses retrieved successfully'));
});

const getBusinessById = catchAsync(async (req, res) => {
  const business = await businessService.getBusinessDetails(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, business, 'Business details retrieved successfully'));
});

const updateBusiness = catchAsync(async (req, res) => {
  const business = await businessService.updateBusiness(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, business, 'Business updated successfully'));
});

const deleteBusiness = catchAsync(async (req, res) => {
  await businessService.deleteBusiness(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Business deleted successfully'));
});

module.exports = { createBusiness, getBusinesses, getBusinessById, updateBusiness, deleteBusiness };
