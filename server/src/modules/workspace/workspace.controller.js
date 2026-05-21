const workspaceService = require('./workspace.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getWorkspaces = catchAsync(async (req, res) => {
  const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
  res.status(200).json(new ApiResponse(200, { workspaces }, 'Workspaces retrieved'));
});

const getWorkspace = catchAsync(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceDetails(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace retrieved'));
});

const summarizeWorkspace = catchAsync(async (req, res) => {
  const summary = await workspaceService.generateWorkspaceSummary(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { summary }, 'Workspace summarized'));
});

const createWorkspace = catchAsync(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, { workspace }, 'Workspace created'));
});

const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await workspaceService.getAnalytics(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { analytics }, 'Workspace analytics retrieved'));
});

const addMember = catchAsync(async (req, res) => {
  const member = await workspaceService.addMember(req.params.id, req.user.id, req.body.email, req.body.role);
  res.status(201).json(new ApiResponse(201, { member }, 'Member added'));
});

module.exports = {
  getWorkspaces,
  getWorkspace,
  summarizeWorkspace,
  createWorkspace,
  getAnalytics,
  addMember
};
