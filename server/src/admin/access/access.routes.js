const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const accessController = require('./access.controller');

const router = express.Router();

// Only SUPER_ADMIN can manage access control
router.use(protect, restrictTo('SUPER_ADMIN'));

router.get('/users', accessController.getAllUsers);
router.patch('/:id/approve', accessController.approveUser);
router.patch('/:id/role', accessController.changeUserRole);
router.patch('/:id/status', accessController.changeUserStatus);

module.exports = router;
