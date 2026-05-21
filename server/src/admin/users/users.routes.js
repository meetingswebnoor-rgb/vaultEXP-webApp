const express = require('express');
const { 
  getAllUsers, 
  updateUserStatus, 
  getUserDetails, 
  verifyUser, 
  updateRole 
} = require('./users.controller');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserDetails);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/verify', verifyUser);
router.patch('/:id/role', updateRole);

module.exports = router;
