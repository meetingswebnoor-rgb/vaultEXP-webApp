const journalService = require('./journal.service');
const reportService = require('./report.service');
const ledgerService = require('./ledger.service');
const exportService = require('./export.service');
const reportAiService = require('./report.ai');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const createJournalEntry = catchAsync(async (req, res) => {
  const transaction = await journalService.createJournalEntry(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, { transaction }, 'Journal entry successfully balanced and recorded.'));
});

const getLedger = catchAsync(async (req, res) => {
  // Can fetch for specific wallet or all. Let's just fetch for one for now.
  const ledger = await ledgerService.getLedger(req.user.id, req.params.walletId);
  res.status(200).json(new ApiResponse(200, { ledger }, 'Ledger retrieved.'));
});

const getFinancialReports = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const [pnl, balanceSheet, cashFlow] = await Promise.all([
    reportService.generatePnL(req.user.id, startDate, endDate),
    reportService.generateBalanceSheet(req.user.id),
    reportService.generateCashFlow(req.user.id, startDate, endDate)
  ]);

  const aiSummary = reportAiService.generateExecutiveSummary(pnl, balanceSheet, cashFlow);

  res.status(200).json(new ApiResponse(200, { 
    reports: {
      pnl,
      balanceSheet,
      cashFlow,
      aiSummary
    }
  }, 'Reports generated successfully.'));
});

const exportReport = catchAsync(async (req, res) => {
  const { type, format } = req.query; // type: pnl, balanceSheet. format: csv, pdf, xlsx
  
  // 1. Fetch the raw data
  let data = {};
  if (type === 'pnl') {
    data = await reportService.generatePnL(req.user.id);
  } else if (type === 'balanceSheet') {
    data = await reportService.generateBalanceSheet(req.user.id);
  } else {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid report type.'));
  }

  // 2. Generate the requested format buffer
  let fileBuffer;
  let contentType;
  let extension;

  switch (format) {
    case 'csv':
      fileBuffer = exportService.generateCSV(type, data);
      contentType = 'text/csv';
      extension = 'csv';
      break;
    case 'pdf':
      fileBuffer = exportService.generatePDF(type, data);
      contentType = 'application/pdf';
      extension = 'pdf';
      break;
    case 'xlsx':
      fileBuffer = exportService.generateXLSX(type, data);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
      break;
    default:
      return res.status(400).json(new ApiResponse(400, null, 'Invalid format. Use csv, pdf, or xlsx.'));
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.${extension}`);
  res.send(fileBuffer);
});

module.exports = {
  createJournalEntry,
  getLedger,
  getFinancialReports,
  exportReport
};
