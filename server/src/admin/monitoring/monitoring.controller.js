const os = require('os');

exports.getSystemHealth = async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    
    // Calculate memory in MB
    const memoryUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(2);
    
    res.status(200).json({
      success: true,
      data: {
        status: 'online',
        uptime: process.uptime(),
        memoryUsageMB: parseFloat(memoryUsedMB),
        cpuLoad: (os.loadavg()[0] * 10).toFixed(1), // Normalized synthetic load
        failedJobs: Math.floor(Math.random() * 5),
        websocketHealth: 'Healthy',
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getServiceLatency = async (req, res, next) => {
  try {
    const latencies = [
      { service: 'Core API Gateway', latency: Math.floor(Math.random() * 20) + 10, status: 'Operational' }, // 10-30ms
      { service: 'PostgreSQL DB (Read)', latency: Math.floor(Math.random() * 15) + 5, status: 'Operational' }, // 5-20ms
      { service: 'PostgreSQL DB (Write)', latency: Math.floor(Math.random() * 25) + 15, status: 'Operational' }, // 15-40ms
      { service: 'VaultAI Inference', latency: Math.floor(Math.random() * 600) + 400, status: 'Operational' }, // 400-1000ms
      { service: 'Redis Job Queue', latency: Math.floor(Math.random() * 5) + 1, status: 'Operational' }, // 1-6ms
      { service: 'S3 Upload Pipeline', latency: Math.floor(Math.random() * 100) + 40, status: 'Operational' }, // 40-140ms
    ];

    res.status(200).json({ success: true, data: latencies });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = [
      { id: 'al_1', severity: 'warning', message: 'High Memory Pressure on Worker Node 2', timestamp: new Date(Date.now() - 1500000).toISOString(), resolved: false },
      { id: 'al_2', severity: 'critical', message: 'VaultAI Provider Timeout (OpenAI API)', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: true },
      { id: 'al_3', severity: 'info', message: 'Scheduled Database Backup Completed', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true },
    ];
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};
