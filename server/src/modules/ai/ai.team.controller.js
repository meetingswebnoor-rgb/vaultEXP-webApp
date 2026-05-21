const aiTeamService = require('./ai.team.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getDiagnostics = catchAsync(async (req, res) => {
  const diagnostics = await aiTeamService.getDiagnostics(req.user.id);
  res.status(200).json(new ApiResponse(200, { diagnostics }, 'Team diagnostics retrieved'));
});

const summarizeDiscussions = catchAsync(async (req, res) => {
  const { contextType, contextId } = req.body;
  const summary = await aiTeamService.summarizeDiscussions(contextType, contextId);
  res.status(200).json(new ApiResponse(200, { summary }, 'Discussion summarized'));
});

const generateTeamReport = catchAsync(async (req, res) => {
  const report = await aiTeamService.generateTeamReport(req.user.id);
  res.status(200).json(new ApiResponse(200, { report }, 'Team report generated'));
});

module.exports = {
  getDiagnostics,
  summarizeDiscussions,
  generateTeamReport
};
