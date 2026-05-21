const prisma = require('../../lib/prisma');
const aiService = require('../ai/ai.service');

/**
 * Log a security event.
 */
const logEvent = async ({ userId, action, ipAddress, userAgent, severity = 'INFO', details }) => {
  try {
    return await prisma.securityLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        severity,
        details
      }
    });
  } catch (error) {
    console.error('[Security Service] Failed to log event:', error);
    // Don't throw, we don't want to crash the main request if logging fails
  }
};

const getLogs = async (filters = {}) => {
  return await prisma.securityLog.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    take: 100, // For performance
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

/**
 * AI-powered suspicious activity detection
 * Scans the last 24 hours of logs.
 */
const analyzeLogs = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const recentLogs = await prisma.securityLog.findMany({
    where: { createdAt: { gte: yesterday } },
    take: 100, // Limit to prevent massive payloads
    orderBy: { createdAt: 'desc' }
  });

  if (recentLogs.length === 0) {
    return "No recent logs to analyze.";
  }

  // Construct a text payload for the AI
  const payload = recentLogs.map(l => `[${l.createdAt.toISOString()}] ${l.action} (IP: ${l.ipAddress || 'unknown'}, User: ${l.userId || 'none'}) - ${l.details}`).join('\n');

  const prompt = `You are a cybersecurity AI. Review the following system logs from the last 24 hours. Identify any patterns that seem highly suspicious (e.g., multiple failed logins from the same IP, unusual bulk file downloads, or rapid permission changes). Summarize your findings in 3 concise bullet points. If everything looks normal, explicitly state that no threats were detected.

Logs:
${payload}`;

  const analysis = await aiService.generateInsight(prompt);

  // Log the AI's analysis
  await logEvent({
    userId: null,
    action: 'SUSPICIOUS_ACTIVITY',
    severity: 'WARNING',
    details: `AI Scan Completed: ${analysis}`
  });

  return analysis;
};

module.exports = {
  logEvent,
  getLogs,
  analyzeLogs
};
