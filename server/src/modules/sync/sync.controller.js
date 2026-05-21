const syncService = require('./sync.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const pullSync = catchAsync(async (req, res) => {
  const { lastPulledAt } = req.query;
  const syncData = await syncService.pullSync(req.user.id, lastPulledAt);
  
  res.status(200).json(new ApiResponse(200, syncData, 'Pull sync successful.'));
});

const pushSync = catchAsync(async (req, res) => {
  const { changes } = req.body;
  const result = await syncService.pushSync(req.user.id, changes);
  
  res.status(200).json(new ApiResponse(200, result, 'Push sync successful.'));
});

module.exports = {
  pullSync,
  pushSync
};
