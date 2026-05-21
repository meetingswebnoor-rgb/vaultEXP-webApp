const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const teamController = require('./teams/team.controller');
const invitationController = require('./invitations/invitation.controller');
const { requireTeamRole } = require('./permissions/permission.guard');
const workspaceController = require('./workspaces/workspace.controller');

const router = express.Router();

// All team routes require base authentication (integrates with existing Auth architecture)
router.use(protect);

// Teams
router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);

// Invitations (Require 'owner' or 'admin' role)
router.post('/:teamId/invites', requireTeamRole(['owner', 'admin']), invitationController.inviteMember);

// Workspaces
router.post('/:teamId/workspaces', requireTeamRole(['owner', 'admin']), workspaceController.createWorkspace);
router.get('/:teamId/workspaces', requireTeamRole(['owner', 'admin', 'manager', 'accountant', 'property_manager', 'viewer', 'client']), workspaceController.getWorkspaces);

// Roles & Permissions (Role Editor)
const roleController = require('./permissions/role.controller');
const { requirePermission } = require('./permissions/rbac.middleware');
const { PERMISSIONS } = require('./permissions/rbac.matrix');

router.get('/permissions/matrix', roleController.getPermissionMatrix);
router.put('/:teamId/members/:memberId/role', requirePermission(PERMISSIONS.TEAM_MANAGE), roleController.updateMemberRole);

module.exports = router;
