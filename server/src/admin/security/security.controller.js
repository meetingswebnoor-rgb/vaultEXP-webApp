const prisma = require('../../lib/prisma');

exports.getSecurityMetrics = async (req, res, next) => {
  try {
    // Generate simulated 24h threat telemetry
    const metrics = {
      activeThreats: Math.floor(Math.random() * 5),
      failedLogins24h: Math.floor(Math.random() * 150) + 20,
      suspiciousIpsBlocked: 12,
      apiAbuseRate: '0.04%',
      threatTrend: '+12%',
    };

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.getThreats = async (req, res, next) => {
  try {
    const threats = await prisma.securityLog.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.status(200).json({ success: true, data: threats });
  } catch (error) {
    next(error);
  }
};
