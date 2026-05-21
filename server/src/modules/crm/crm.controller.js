const crmService = require('./crm.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getContacts = catchAsync(async (req, res) => {
  const contacts = await crmService.getContacts(req.user.id);
  res.status(200).json(new ApiResponse(200, { contacts }, 'Contacts retrieved successfully'));
});

const createContact = catchAsync(async (req, res) => {
  const contact = await crmService.createContact(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, contact, 'Contact created successfully'));
});

const getDeals = catchAsync(async (req, res) => {
  const deals = await crmService.getDeals(req.user.id);
  res.status(200).json(new ApiResponse(200, { deals }, 'Deals retrieved successfully'));
});

const createDeal = catchAsync(async (req, res) => {
  const deal = await crmService.createDeal(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, deal, 'Deal created successfully'));
});

const getPipelines = catchAsync(async (req, res) => {
  const pipelines = await crmService.getPipelines(req.user.id);
  res.status(200).json(new ApiResponse(200, { pipelines }, 'Pipelines retrieved successfully'));
});

const createPipeline = catchAsync(async (req, res) => {
  const pipeline = await crmService.createPipeline(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, pipeline, 'Pipeline created successfully'));
});

const getActivities = catchAsync(async (req, res) => {
  const activities = await crmService.getActivities(req.user.id);
  res.status(200).json(new ApiResponse(200, { activities }, 'Activities retrieved successfully'));
});

const createActivity = catchAsync(async (req, res) => {
  const activity = await crmService.createActivity(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, activity, 'Activity created successfully'));
});

const aiSummarizeContact = catchAsync(async (req, res) => {
  const { contactId } = req.body;
  const result = await crmService.aiSummarizeContact(req.user.id, contactId);
  res.status(200).json(new ApiResponse(200, result, 'AI summary generated successfully'));
});

module.exports = {
  getContacts,
  createContact,
  getDeals,
  createDeal,
  getPipelines,
  createPipeline,
  getActivities,
  createActivity,
  aiSummarizeContact
};
