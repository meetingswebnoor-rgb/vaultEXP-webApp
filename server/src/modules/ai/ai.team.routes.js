const express = require('express');
const router = express.Router();
const aiTeamController = require('./ai.team.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/diagnostics', aiTeamController.getDiagnostics);
router.post('/summarize', aiTeamController.summarizeDiscussions);
router.post('/report', aiTeamController.generateTeamReport);

module.exports = router;
