exports.getDeliveryMetrics = async (req, res, next) => {
  try {
    // Generate simulated 30-day time-series data for outbound traffic
    const today = new Date();
    const timeSeries = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().split('T')[0],
        emails: Math.floor(Math.random() * 5000) + 1000,
        pushes: Math.floor(Math.random() * 8000) + 2000,
      };
    });

    const metrics = {
      totalSent: 425689,
      deliveryRate: 99.8,
      openRate: 42.5,
      failedDeliveries: 342,
      activeBounces: 89,
      timeSeries
    };

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = [
      { id: 'tpl_1', name: 'Welcome Onboarding', provider: 'Resend', status: 'active', lastUpdated: new Date().toISOString() },
      { id: 'tpl_2', name: 'Invoice Receipt', provider: 'SendGrid', status: 'active', lastUpdated: new Date().toISOString() },
      { id: 'tpl_3', name: 'Password Reset', provider: 'Resend', status: 'active', lastUpdated: new Date().toISOString() },
      { id: 'tpl_4', name: 'Account Suspension', provider: 'SendGrid', status: 'inactive', lastUpdated: new Date().toISOString() },
      { id: 'tpl_5', name: 'New Device Login (Push)', provider: 'Firebase', status: 'active', lastUpdated: new Date().toISOString() }
    ];

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

exports.triggerTestNotification = async (req, res, next) => {
  try {
    const { provider, type } = req.body;
    
    // Simulate latency for API call to provider
    await new Promise(resolve => setTimeout(resolve, 800));

    res.status(200).json({ 
      success: true, 
      message: `Test ${type} successfully routed via ${provider}` 
    });
  } catch (error) {
    next(error);
  }
};
