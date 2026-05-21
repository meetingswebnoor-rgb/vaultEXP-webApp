const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/:id/tasks', projectController.createTask);
router.put('/tasks/:taskId/status', projectController.updateTaskStatus);
router.post('/:id/ai-optimize', projectController.optimizeProjectAI);

module.exports = router;
