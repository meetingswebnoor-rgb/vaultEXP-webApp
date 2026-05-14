/**
 * wallet.controller.js (modules/wallet)
 * ─────────────────────────────────────────────────────────────────
 * Thin HTTP layer for Wallet module.
 */

'use strict';

const walletService = require('./wallet.service');
const asyncHandler = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

exports.createWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.createWallet(req.user.id, req.body);
  sendSuccess(res, 201, 'Wallet created successfully', wallet);
});

exports.getWallets = catchAsync(async (req, res) => {
  const result = await walletService.getWallets(req.user.id);
  sendSuccess(res, 200, 'Wallets retrieved', result);
});

exports.getWalletById = catchAsync(async (req, res) => {
  const wallet = await walletService.getWalletById(req.user.id, req.params.id);
  sendSuccess(res, 200, 'Wallet retrieved', wallet);
});

exports.updateWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.updateWallet(req.user.id, req.params.id, req.body);
  sendSuccess(res, 200, 'Wallet updated', wallet);
});

exports.deleteWallet = catchAsync(async (req, res) => {
  await walletService.deleteWallet(req.user.id, req.params.id);
  sendSuccess(res, 200, 'Wallet deleted', {});
});

exports.addTransaction = catchAsync(async (req, res) => {
  const result = await walletService.addTransaction(req.user.id, req.params.id, req.body);
  sendSuccess(res, 201, 'Transaction added', result);
});

exports.updateTransaction = catchAsync(async (req, res) => {
  const result = await walletService.updateTransaction(req.user.id, req.params.id, req.params.txId, req.body);
  sendSuccess(res, 200, 'Transaction updated', result);
});

exports.deleteTransaction = catchAsync(async (req, res) => {
  const result = await walletService.deleteTransaction(req.user.id, req.params.id, req.params.txId);
  sendSuccess(res, 200, 'Transaction deleted', result);
});

exports.getWalletAnalytics = catchAsync(async (req, res) => {
  const analytics = await walletService.getAnalytics(req.user.id);
  sendSuccess(res, 200, 'Wallet analytics retrieved', analytics);
});
