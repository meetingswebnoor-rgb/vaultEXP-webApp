const portalService = require('./portal.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getDashboardStats = catchAsync(async (req, res) => {
  const data = await portalService.getDashboardStats(req.user.id);
  res.status(200).json(new ApiResponse(200, data, 'Dashboard stats retrieved successfully'));
});

const getMessages = catchAsync(async (req, res) => {
  const messages = await portalService.getMessages(req.user.id);
  res.status(200).json(new ApiResponse(200, { messages }, 'Messages retrieved successfully'));
});

const sendMessage = catchAsync(async (req, res) => {
  const { receiverId, content } = req.body;
  const message = await portalService.sendMessage(req.user.id, receiverId, content);
  res.status(201).json(new ApiResponse(201, message, 'Message sent successfully'));
});

const getAgreements = catchAsync(async (req, res) => {
  const agreements = await portalService.getAgreements(req.user.id);
  res.status(200).json(new ApiResponse(200, { agreements }, 'Agreements retrieved successfully'));
});

const signAgreement = catchAsync(async (req, res) => {
  const { signatureText } = req.body;
  const agreementId = req.params.id;
  const ipAddress = req.ip; // simplistic IP retrieval
  
  const agreement = await portalService.signAgreement(req.user.id, agreementId, signatureText, ipAddress);
  res.status(200).json(new ApiResponse(200, agreement, 'Agreement signed successfully'));
});

const getInvoices = catchAsync(async (req, res) => {
  const invoices = await portalService.getInvoices(req.user.id);
  res.status(200).json(new ApiResponse(200, { invoices }, 'Invoices retrieved successfully'));
});

module.exports = {
  getDashboardStats,
  getMessages,
  sendMessage,
  getAgreements,
  signAgreement,
  getInvoices
};
