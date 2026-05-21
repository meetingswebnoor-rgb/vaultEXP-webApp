const chatService = require('./chat.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getUserChannels = catchAsync(async (req, res) => {
  const channels = await chatService.getUserChannels(req.user.id);
  res.status(200).json(new ApiResponse(200, { channels }, 'Channels retrieved successfully'));
});

const getChannelMessages = catchAsync(async (req, res) => {
  const messages = await chatService.getChannelMessages(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { messages }, 'Messages retrieved successfully'));
});

const createDirectMessage = catchAsync(async (req, res) => {
  const dm = await chatService.createDirectMessage(req.user.id, req.body.targetUserId);
  res.status(201).json(new ApiResponse(201, { channel: dm }, 'Direct message created'));
});

module.exports = {
  getUserChannels,
  getChannelMessages,
  createDirectMessage
};
