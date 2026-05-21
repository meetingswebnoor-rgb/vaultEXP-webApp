const express = require('express');
const router = express.Router();
const workspaceController = require('./workspace.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', workspaceController.getWorkspaces);
router.post('/', workspaceController.createWorkspace);
router.get('/:id', workspaceController.getWorkspace);
router.post('/:id/ai-summary', workspaceController.summarizeWorkspace);
router.get('/:id/analytics', workspaceController.getAnalytics);
router.post('/:id/members', workspaceController.addMember);

module.exports = router;
