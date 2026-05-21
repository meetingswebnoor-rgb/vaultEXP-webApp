const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');
const aiService = require('../ai/ai.service');

const getUserWorkspaces = async (userId) => {
  return await prisma.workspace.findMany({
    where: {
      members: { some: { userId } }
    },
    include: {
      team: { select: { id: true, name: true, logoUrl: true } },
      members: { select: { role: true, user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { documents: true } }
    }
  });
};

const getWorkspaceDetails = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });

  if (!member) throw new AppError('Access denied', 403);

  return await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      team: true,
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } }
      },
      documents: {
        where: { folderId: null },
        orderBy: { createdAt: 'desc' },
        include: { tags: true }
      },
      documentFolders: {
        where: { parentId: null },
        include: {
          _count: { select: { documents: true } }
        }
      }
    }
  });
};

const generateWorkspaceSummary = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });

  if (!member) throw new AppError('Access denied', 403);

  const docs = await prisma.document.findMany({
    where: { workspaceId, mimeType: { in: ['text/plain', 'application/pdf', 'text/markdown'] } },
    select: { originalName: true, contentUrl: true }
  });

  if (docs.length === 0) return "No text documents found in workspace to summarize.";

  // Note: in a real environment we would fetch the contents from storage,
  // For now, we simulate the AI context build:
  const context = docs.map(d => `File: ${d.originalName}`).join('\n');
  const prompt = `Summarize the overall purpose and contents of this workspace based on these files:\n${context}`;

  const summary = await aiService.generateInsight(prompt);
  return summary;
};

const createWorkspace = async (userId, data) => {
  const { name, description, teamId } = data;
  if (!teamId) throw new AppError('Team ID is required to provision a workspace', 400);
  
  // Verify user is owner/admin of the team
  const teamMember = await prisma.teamMember.findFirst({
    where: { teamId, userId, role: { in: ['admin', 'owner'] } }
  });
  if (!teamMember) throw new AppError('Only team admins can provision workspaces', 403);

  const workspace = await prisma.workspace.create({
    data: {
      name,
      description,
      teamId,
      members: {
        create: {
          userId,
          role: 'admin'
        }
      }
    }
  });
  return workspace;
};

const getAnalytics = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });
  if (!member) throw new AppError('Access denied', 403);

  const activeUsers = await prisma.workspaceMember.count({ where: { workspaceId } });
  const totalDocuments = await prisma.document.count({ where: { workspaceId } });
  const totalProjects = await prisma.project.count({ where: { workspaceId } });

  return {
    activeUsers,
    totalDocuments,
    totalProjects,
    status: 'optimal'
  };
};

const addMember = async (workspaceId, inviterId, email, role = 'viewer') => {
  const inviter = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: inviterId } }
  });
  if (!inviter || !['admin', 'owner'].includes(inviter.role)) {
    throw new AppError('Only admins can add members to workspace', 403);
  }

  const userToAdd = await prisma.user.findUnique({ where: { email } });
  if (!userToAdd) throw new AppError('User not found. Invite them to the platform first.', 404);

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: userToAdd.id,
      role
    }
  });

  return member;
};

module.exports = {
  getUserWorkspaces,
  getWorkspaceDetails,
  generateWorkspaceSummary,
  createWorkspace,
  getAnalytics,
  addMember
};
