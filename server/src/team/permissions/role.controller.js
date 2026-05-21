const prisma = require('../../lib/prisma');
const { ROLES, RoleMatrix, PERMISSIONS } = require('./rbac.matrix');

/**
 * Update the role of a team member.
 */
exports.updateMemberRole = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { newRole } = req.body;

    if (!Object.values(ROLES).includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    // Prevent transferring owner without special flow
    if (newRole === ROLES.OWNER) {
      return res.status(400).json({ success: false, message: 'Cannot assign Owner role directly. Use ownership transfer flow.' });
    }

    const updatedMember = await prisma.teamMember.update({
      where: {
        id: memberId
      },
      data: {
        role: newRole
      }
    });

    res.status(200).json({ success: true, data: updatedMember, message: 'Role updated successfully.' });
  } catch (error) {
    console.error('[Role Controller] Update Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Returns the permission matrix so the frontend can build dynamic UI.
 */
exports.getPermissionMatrix = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        roles: Object.values(ROLES),
        permissions: Object.values(PERMISSIONS),
        matrix: RoleMatrix
      }
    });
  } catch (error) {
    console.error('[Role Controller] Matrix Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
