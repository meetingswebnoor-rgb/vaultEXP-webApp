const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');
const aiService = require('../ai/ai.service');

const getProjects = async (userId) => {
  // Fallback for user workspaces (you would verify actual team/workspace membership)
  // For demonstration, we fetch projects linked to workspaces the user is in.
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { workspace: { members: { some: { userId } } } },
        // Also include projects explicitly where they might have tasks assigned
        { tasks: { some: { assignments: { some: { userId } } } } }
      ]
    },
    include: {
      tasks: {
        select: { id: true, status: true }
      },
      workspace: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return projects;
};

const getProjectById = async (projectId, userId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        include: {
          assignments: { include: { user: { select: { id: true, name: true, avatar: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      },
      workspace: { select: { id: true, name: true } }
    }
  });

  if (!project) throw new AppError('Project not found', 404);
  return project;
};

const createTask = async (projectId, taskData) => {
  return await prisma.task.create({
    data: {
      projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      type: taskData.type || 'general',
      assignments: taskData.assigneeId ? {
        create: [{ userId: taskData.assigneeId }]
      } : undefined
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, avatar: true } } } }
    }
  });
};

const updateTaskStatus = async (taskId, status) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: { status }
  });
};

const optimizeProjectAI = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: true }
  });

  if (!project) throw new AppError('Project not found', 404);

  const taskList = project.tasks.map(t => `- [${t.status}] ${t.title} (Priority: ${t.priority})`).join('\n');
  const prompt = `Act as an expert project manager. Review the following tasks for the project "${project.name}" and provide 3 concrete suggestions for optimizing the workflow, identifying critical bottlenecks, and suggesting priority adjustments.\n\nTasks:\n${taskList}`;

  const insight = await aiService.generateInsight(prompt);
  return insight;
};

module.exports = {
  getProjects,
  getProjectById,
  createTask,
  updateTaskStatus,
  optimizeProjectAI
};
