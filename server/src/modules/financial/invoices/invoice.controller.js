const invoiceService = require('./invoice.service');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, { invoice }, 'Invoice created successfully'));
});

const getInvoices = catchAsync(async (req, res) => {
  const invoices = await invoiceService.getInvoices(req.user.id);
  res.status(200).json(new ApiResponse(200, { invoices }, 'Invoices retrieved'));
});

const getInvoiceById = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { invoice }, 'Invoice retrieved'));
});

const downloadPDF = catchAsync(async (req, res) => {
  const pdfBuffer = await invoiceService.generatePDF(req.params.id, req.user.id);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
  res.send(pdfBuffer);
});

const updateStatus = catchAsync(async (req, res) => {
  const invoice = await invoiceService.updateStatus(req.params.id, req.body.status, req.user.id);
  res.status(200).json(new ApiResponse(200, { invoice }, `Invoice marked as ${req.body.status}`));
});

const sendInvoice = catchAsync(async (req, res) => {
  // Mock sending email
  await invoiceService.updateStatus(req.params.id, 'sent', req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Invoice sent successfully'));
});

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  downloadPDF,
  updateStatus,
  sendInvoice
};
