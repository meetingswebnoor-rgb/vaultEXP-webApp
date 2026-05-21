const securityService = require('./security.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getLogs = catchAsync(async (req, res) => {
  // In a real scenario, we might restrict this to Admins only
  const filters = {};
  if (req.query.severity) filters.severity = req.query.severity;
  if (req.query.action) filters.action = req.query.action;

  const logs = await securityService.getLogs(filters);
  res.status(200).json(new ApiResponse(200, { logs }, 'Security logs retrieved'));
});

const analyzeLogs = catchAsync(async (req, res) => {
  const analysis = await securityService.analyzeLogs();
  res.status(200).json(new ApiResponse(200, { analysis }, 'AI security scan complete'));
});

// Demo endpoint to mock a suspicious login
const triggerDemoLogin = catchAsync(async (req, res) => {
  await securityService.logEvent({
    userId: req.user.id,
    action: 'LOGIN',
    ipAddress: '192.168.1.99', // Mock IP
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    severity: 'WARNING',
    details: 'Login from new unrecognized device.'
  });
  
  await securityService.logEvent({
    userId: req.user.id,
    action: 'FILE_DOWNLOAD',
    ipAddress: '192.168.1.99',
    userAgent: 'Mozilla/5.0...',
    severity: 'CRITICAL',
    details: 'Bulk download of 50 sensitive CRM contacts initiated.'
  });

  res.status(200).json(new ApiResponse(200, null, 'Demo suspicious events injected'));
});

module.exports = {
  getLogs,
  analyzeLogs,
  triggerDemoLogin
};
