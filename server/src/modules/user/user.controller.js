/**
 * User Controller
 */
const { UserService } = require('./user.service');
const { asyncHandler } = require('../../utils/catchAsync');
const { ApiResponse } = require('../../utils/apiResponse');

class UserControllerClass {
  getProfile = catchAsync(async (req, res) => {
    const profile = await UserService.getProfile(req.user.id);
    res.json(ApiResponse.success('Profile fetched successfully', profile));
  });

  updateProfile = catchAsync(async (req, res) => {
    const { name, avatar } = req.body;
    const user = await UserService.updateProfile(req.user.id, { name, avatar });
    res.json(ApiResponse.success('Profile updated successfully', user));
  });

  updateSettings = catchAsync(async (req, res) => {
    const { theme, layoutPreference, notifications } = req.body;
    const user = await UserService.updateSettings(req.user.id, { 
      theme, 
      layoutPreference, 
      notifications 
    });
    res.json(ApiResponse.success('Settings updated successfully', user));
  });

  changePassword = catchAsync(async (req, res) => {
    await UserService.changePassword(req.user.id, req.body);
    res.json(ApiResponse.success('Password changed successfully'));
  });

  deleteAccount = catchAsync(async (req, res) => {
    await UserService.deleteAccount(req.user.id);
    res.status(204).send();
  });

  listUsers = catchAsync(async (req, res) => {
    const result = await UserService.list(req.query);
    res.json(ApiResponse.paginated('Users fetched', result.data, result.meta));
  });

  getUserById = catchAsync(async (req, res) => {
    const user = await UserService.getById(req.params.id);
    res.json(ApiResponse.success('User fetched', user));
  });

  updateUserStatus = catchAsync(async (req, res) => {
    const user = await UserService.updateStatus(req.params.id, req.body.status);
    res.json(ApiResponse.success('User status updated', user));
  });
}

const UserController = new UserControllerClass();
module.exports = { UserController };
