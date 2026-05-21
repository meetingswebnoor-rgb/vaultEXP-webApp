const projectService = require('./project.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');
const { logActivity } = require('../../utils/activityLogger');

const getProjects = catchAsync(async (req, res) => {
  const projects = await projectService.getProjects(req.user.id);
  res.status(200).json(new ApiResponse(200, { projects }, 'Projects retrieved successfully'));
});

const getProjectById = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { project }, 'Project retrieved successfully'));
});

const createTask = catchAsync(async (req, res) => {
  const task = await projectService.createTask(req.params.id, req.body);
  
  await logActivity(
    req.user.id,
    'CREATE',
    'TASK',
    task.id,
    `Created new task: "${task.title}"`,
    { projectId: req.params.id, priority: task.priority }
  );

  res.status(201).json(new ApiResponse(201, { task }, 'Task created successfully'));
});

const updateTaskStatus = catchAsync(async (req, res) => {
  const task = await projectService.updateTaskStatus(req.params.taskId, req.body.status);
  
  await logActivity(
    req.user.id,
    'UPDATE',
    'TASK',
    task.id,
    `Updated task "${task.title}" status to ${req.body.status}`,
    { status: req.body.status }
  );

  res.status(200).json(new ApiResponse(200, { task }, 'Task status updated'));
});

const optimizeProjectAI = catchAsync(async (req, res) => {
  const insights = await projectService.optimizeProjectAI(req.params.id);
  res.status(200).json(new ApiResponse(200, { insights }, 'AI insights generated'));
});

module.exports = {
  getProjects,
  getProjectById,
  createTask,
  updateTaskStatus,
  optimizeProjectAI
};
