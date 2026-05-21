const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

const getDashboardStats = async (clientId) => {
  // Finds the host associated with this client
  const link = await prisma.clientPortalLink.findFirst({
    where: { clientUserId: clientId, status: 'active' },
    include: { hostUser: true }
  });

  if (!link) {
    throw new AppError('No active portal association found for this client.', 404);
  }

  const unreadMessages = await prisma.portalMessage.count({
    where: { receiverId: clientId, isRead: false }
  });

  const pendingAgreements = await prisma.portalAgreement.count({
    where: { clientUserId: clientId, status: 'pending' }
  });

  const pendingInvoices = await prisma.invoice.count({
    where: { clientId: clientId, status: 'pending' }
  });

  return {
    host: link.hostUser,
    stats: { unreadMessages, pendingAgreements, pendingInvoices }
  };
};

const getMessages = async (clientId) => {
  return await prisma.portalMessage.findMany({
    where: {
      OR: [
        { senderId: clientId },
        { receiverId: clientId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { name: true, email: true, avatar: true } } }
  });
};

const sendMessage = async (senderId, receiverId, content) => {
  return await prisma.portalMessage.create({
    data: { senderId, receiverId, content }
  });
};

const getAgreements = async (clientId) => {
  return await prisma.portalAgreement.findMany({
    where: { clientUserId: clientId },
    orderBy: { createdAt: 'desc' }
  });
};

const signAgreement = async (clientId, agreementId, signatureText, ipAddress) => {
  const agreement = await prisma.portalAgreement.findFirst({
    where: { id: agreementId, clientUserId: clientId }
  });

  if (!agreement) {
    throw new AppError('Agreement not found', 404);
  }

  if (agreement.status === 'signed') {
    throw new AppError('Agreement is already signed', 400);
  }

  return await prisma.portalAgreement.update({
    where: { id: agreementId },
    data: {
      status: 'signed',
      signatureText,
      signedIp: ipAddress,
      signedAt: new Date()
    }
  });
};

const getInvoices = async (clientId) => {
  return await prisma.invoice.findMany({
    where: { clientId: clientId },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  getDashboardStats,
  getMessages,
  sendMessage,
  getAgreements,
  signAgreement,
  getInvoices
};
