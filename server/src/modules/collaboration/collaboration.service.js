const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

const getComments = async (resourceType, resourceId) => {
  const where = {};
  if (resourceType === 'business') where.businessId = resourceId;
  else if (resourceType === 'property') where.propertyId = resourceId;
  else if (resourceType === 'document') where.documentId = resourceId;
  else if (resourceType === 'investment') where.investmentId = resourceId;
  else throw new AppError('Invalid resource type', 400);

  where.parentId = null; // Top-level comments only

  return await prisma.comment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          mentions: true
        },
        orderBy: { createdAt: 'asc' }
      },
      mentions: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const createComment = async (userId, data) => {
  const { content, parentId, businessId, propertyId, documentId, investmentId, mentionIds } = data;
  
  const comment = await prisma.comment.create({
    data: {
      userId,
      content,
      parentId,
      businessId,
      propertyId,
      documentId,
      investmentId,
      mentions: {
        create: mentionIds ? mentionIds.map(id => ({ userId: id })) : []
      }
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: true,
      mentions: true
    }
  });

  return comment;
};

const updateComment = async (userId, commentId, data) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError('Comment not found', 404);
  
  return await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: data.content,
      isResolved: data.isResolved
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  });
};

const deleteComment = async (userId, commentId) => {
  return await prisma.comment.delete({ where: { id: commentId } });
};

module.exports = { getComments, createComment, updateComment, deleteComment };
