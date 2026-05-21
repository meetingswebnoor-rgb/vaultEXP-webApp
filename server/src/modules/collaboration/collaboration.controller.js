const collaborationService = require('./collaboration.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getComments = catchAsync(async (req, res) => {
  const { resourceType, resourceId } = req.query;
  const comments = await collaborationService.getComments(resourceType, resourceId);
  res.status(200).json(new ApiResponse(200, { comments }, 'Comments retrieved successfully'));
});

const createComment = catchAsync(async (req, res) => {
  const comment = await collaborationService.createComment(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, comment, 'Comment created successfully'));
});

const updateComment = catchAsync(async (req, res) => {
  const comment = await collaborationService.updateComment(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, comment, 'Comment updated successfully'));
});

const deleteComment = catchAsync(async (req, res) => {
  await collaborationService.deleteComment(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'));
});

module.exports = { getComments, createComment, updateComment, deleteComment };
