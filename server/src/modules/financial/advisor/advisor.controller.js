const advisorService = require('./advisor.service');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const getAdvisorInsights = catchAsync(async (req, res) => {
  const insights = await advisorService.generateInsights(req.user.id);
  res.status(200).json(new ApiResponse(200, insights, 'AI Financial Advisor insights generated.'));
});

module.exports = {
  getAdvisorInsights
};
