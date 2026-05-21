const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');
const aiService = require('./ai.service');

const getDiagnostics = async (userId) => {
  // Find overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      dueDate: { lt: new Date() },
      status: { not: 'done' }
    },
    select: { id: true, title: true, dueDate: true, priority: true }
  });

  // Find blocked tasks (For demo, we define "blocked" as tasks that have comments but no status updates recently,
  // or simply tasks with priority 'urgent' that are not done). Let's use urgent & not done.
  const blockedTasks = await prisma.task.findMany({
    where: {
      priority: 'urgent',
      status: { not: 'done' }
    },
    select: { id: true, title: true, status: true }
  });

  return {
    overdueTasks,
    blockedTasks,
    missingFiles: [
      // Mock missing files for demo
      { id: '1', title: 'Q3 Financial Audit.pdf', expectedIn: 'Finance Workspace' },
      { id: '2', title: 'Client Onboarding Contract', expectedIn: 'CRM Deal Pipeline' }
    ]
  };
};

const summarizeDiscussions = async (contextType, contextId) => {
  let textToSummarize = "";

  if (contextType === 'task') {
    const comments = await prisma.taskComment.findMany({
      where: { taskId: contextId },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    if (!comments.length) return "No discussions found for this task.";
    textToSummarize = comments.map(c => `${c.user.name}: ${c.content}`).join('\n');
  } 
  // You could extend this to channel chats, etc.

  const prompt = `You are a team project manager. Summarize the following discussion concisely, highlighting any decisions made and action items:\n\n${textToSummarize}`;
  return await aiService.generateInsight(prompt);
};

const generateTeamReport = async (userId) => {
  const activities = await prisma.activityLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const activeProjects = await prisma.project.count({ where: { status: 'active' } });
  const openTasks = await prisma.task.count({ where: { status: { not: 'done' } } });

  const activitySummary = activities.map(a => `- [${a.module}] ${a.user.name} ${a.action}: ${a.description}`).join('\n');

  const prompt = `You are an AI Chief of Staff. Generate an executive summary report for the team based on the following data.
  Active Projects: ${activeProjects}
  Open Tasks: ${openTasks}
  
  Recent Activity:
  ${activitySummary}
  
  Please provide a brief summary of team momentum, identify any potential bottlenecks based on the activity, and suggest 3 strategic priorities for the coming week.`;

  return await aiService.generateInsight(prompt);
};

module.exports = {
  getDiagnostics,
  summarizeDiscussions,
  generateTeamReport
};
