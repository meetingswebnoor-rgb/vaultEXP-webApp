const activityService = require('./activity.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getActivities = catchAsync(async (req, res) => {
  const activities = await activityService.getActivities(req.query);
  res.status(200).json(new ApiResponse(200, { activities }, 'Activity logs retrieved'));
});

module.exports = {
  getActivities
};
