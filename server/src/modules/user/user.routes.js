/**
 * User Routes
 */
const { Router } = require('express');
const { UserController } = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/authorize.middleware');

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/settings', UserController.updateSettings);
router.patch('/change-password', UserController.changePassword);
router.delete('/account', UserController.deleteAccount);

// Admin only
router.get('/', authorize('admin'), UserController.listUsers);
router.get('/:id', authorize('admin', 'manager'), UserController.getUserById);
router.patch('/:id/status', authorize('admin'), UserController.updateUserStatus);

module.exports = router;
