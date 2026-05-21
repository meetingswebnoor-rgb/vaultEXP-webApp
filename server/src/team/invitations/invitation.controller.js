const prisma = require('../../lib/prisma');

exports.inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role } = req.body;
    
    // Generate secure invite token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId,
        email,
        role: role || 'member',
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Fire event for email engine
    const eventBus = require('../../automation/engine/event.listener');
    eventBus.emit('team.invitation_created', { email, teamId, token });

    res.status(201).json({ success: true, message: 'Invitation sent.' });
  } catch (error) {
    console.error('[Invitation Controller] Create Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
