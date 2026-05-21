const { FinancialAuditService } = require('./financial.audit.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getAuditLogs = catchAsync(async (req, res) => {
  const { severity, action, since } = req.query;
  const logs = await FinancialAuditService.getFinancialAuditLogs(req.user.id, { severity, action, since });
  res.status(200).json(new ApiResponse(200, { logs }, 'Financial audit logs retrieved.'));
});

const runRiskScan = catchAsync(async (req, res) => {
  const result = await FinancialAuditService.runRiskScan(req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Financial risk scan completed.'));
});

const getAuditStats = catchAsync(async (req, res) => {
  const stats = await FinancialAuditService.getAuditStats(req.user.id);
  res.status(200).json(new ApiResponse(200, stats, 'Audit statistics retrieved.'));
});

module.exports = { getAuditLogs, runRiskScan, getAuditStats };
