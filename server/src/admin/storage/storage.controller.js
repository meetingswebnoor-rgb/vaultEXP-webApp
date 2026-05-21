const prisma = require('../../lib/prisma');

exports.getStorageMetrics = async (req, res, next) => {
  try {
    const [totalSizeResult, documentCount, encryptedCount] = await Promise.all([
      prisma.document.aggregate({ _sum: { fileSize: true } }),
      prisma.document.count(),
      prisma.document.count({ where: { isEncrypted: true } })
    ]);

    // Exact byte count from the database
    const totalBytes = totalSizeResult._sum.fileSize || 0;
    
    // Cost estimation: assume $0.023 per GB per month (standard S3 pricing)
    const gigabytes = totalBytes / (1024 ** 3);
    const estimatedCostUsd = gigabytes * 0.023;

    // Simulated 30-day upload volume bandwidth (MB)
    const today = new Date();
    const timeSeries = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().split('T')[0],
        uploadVolMB: Math.floor(Math.random() * 5000) + 500, // 500MB to 5.5GB daily
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalBytes,
        documentCount,
        encryptedCount,
        estimatedCostUsd,
        aiQueueSize: Math.floor(Math.random() * 50), // Mocked queue size
        timeSeries
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProviders = async (req, res, next) => {
  try {
    // Simulated cloud infrastructure mapping
    const providers = [
      { id: 'aws_s3_main', name: 'AWS S3 (us-east-1)', type: 'Primary Blob Storage', status: 'Active', usageGB: 450.2 },
      { id: 'cf_r2_backup', name: 'Cloudflare R2', type: 'Fallback / Replica', status: 'Standby', usageGB: 450.2 },
      { id: 'cdn_edge', name: 'Cloudfront Edge', type: 'Global CDN', status: 'Active', usageGB: 120.5 }
    ];

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
};
