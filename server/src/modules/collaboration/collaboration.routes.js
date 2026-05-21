const express = require('express');
const router = express.Router();
const collaborationController = require('./collaboration.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.route('/comments')
  .get(collaborationController.getComments)
  .post(collaborationController.createComment);

router.route('/comments/:id')
  .put(collaborationController.updateComment)
  .delete(collaborationController.deleteComment);

module.exports = router;
