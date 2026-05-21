const plaidService = require('./plaid.service');
const reconciliationService = require('./reconciliation.service');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const prisma = require('../../../lib/prisma');

const connectBankAccount = catchAsync(async (req, res) => {
  const { publicToken } = req.body;
  
  // 1. Exchange public token via Plaid abstraction
  const accountInfo = await plaidService.exchangePublicToken(publicToken, req.user.id);
  
  // 2. Create a Vault Wallet mapped to this external account
  const wallet = await prisma.wallet.create({
    data: {
      userId: req.user.id,
      name: accountInfo.bankName,
      type: accountInfo.type,
      currency: 'USD',
      balance: 0,
      accountNumber: `****${accountInfo.mask}`,
      bankName: accountInfo.bankName
    }
  });

  res.status(201).json(new ApiResponse(201, { wallet }, 'Bank account successfully connected.'));
});

const getReconciliationReport = catchAsync(async (req, res) => {
  const report = await reconciliationService.generateReconciliationReport(req.user.id, req.params.walletId);
  res.status(200).json(new ApiResponse(200, { report }, 'Reconciliation report generated'));
});

const autoReconcile = catchAsync(async (req, res) => {
  const result = await reconciliationService.autoReconcile(req.user.id, req.params.walletId);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = {
  connectBankAccount,
  getReconciliationReport,
  autoReconcile
};
