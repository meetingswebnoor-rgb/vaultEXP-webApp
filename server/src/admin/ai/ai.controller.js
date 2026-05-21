const prisma = require('../../lib/prisma');

// Mock in-memory config for MVP
let aiConfig = {
  providers: {
    openai: { enabled: true, model: 'gpt-4o' },
    anthropic: { enabled: true, model: 'claude-3-opus' },
    google: { enabled: false, model: 'gemini-1.5-pro' }
  },
  systemPrompts: {
    defaultMode: 'precise',
  }
};

exports.getAIMetrics = async (req, res, next) => {
  try {
    const aiTokensData = await prisma.subscription.aggregate({
      _sum: { aiTokensUsed: true }
    });

    const totalTokens = aiTokensData._sum.aiTokensUsed || 0;
    
    // Estimate cost: e.g. blended average of $0.01 per 1k tokens
    const estimatedCostUsd = (totalTokens / 1000) * 0.01;

    // Mock 7-day time series data for token burn rate
    const today = new Date();
    const timeSeries = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 50000) + 10000,
        failures: Math.floor(Math.random() * 5)
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalTokens,
        estimatedCostUsd,
        activeModels: Object.values(aiConfig.providers).filter(p => p.enabled).length,
        failureRate: '0.24%',
        timeSeries,
        config: aiConfig
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAIConfig = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: aiConfig });
  } catch (error) {
    next(error);
  }
};

exports.updateAIConfig = async (req, res, next) => {
  try {
    const { providers } = req.body;
    if (providers) {
      aiConfig.providers = { ...aiConfig.providers, ...providers };
    }
    res.status(200).json({ success: true, data: aiConfig });
  } catch (error) {
    next(error);
  }
};
