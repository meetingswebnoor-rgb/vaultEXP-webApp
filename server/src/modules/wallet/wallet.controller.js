/**
 * wallet.controller.js (modules/wallet)
 * ─────────────────────────────────────────────────────────────────
 * Thin HTTP layer for Wallet module.
 */

'use strict';

const walletService = require('./wallet.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

exports.createWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.createWallet(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, wallet, 'Wallet created successfully'));
});

exports.getWallets = catchAsync(async (req, res) => {
  const result = await walletService.getWallets(req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Wallets retrieved'));
});

exports.getWalletById = catchAsync(async (req, res) => {
  const wallet = await walletService.getWalletById(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, wallet, 'Wallet retrieved'));
});

exports.updateWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.updateWallet(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, wallet, 'Wallet updated'));
});

exports.deleteWallet = catchAsync(async (req, res) => {
  await walletService.deleteWallet(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, {}, 'Wallet deleted'));
});

exports.addTransaction = catchAsync(async (req, res) => {
  const result = await walletService.addTransaction(req.user.id, req.params.id, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Transaction added'));
});

exports.updateTransaction = catchAsync(async (req, res) => {
  const result = await walletService.updateTransaction(req.user.id, req.params.id, req.params.txId, req.body);
  res.status(200).json(new ApiResponse(200, result, 'Transaction updated'));
});

exports.deleteTransaction = catchAsync(async (req, res) => {
  const result = await walletService.deleteTransaction(req.user.id, req.params.id, req.params.txId);
  res.status(200).json(new ApiResponse(200, result, 'Transaction deleted'));
});

exports.getWalletAnalytics = catchAsync(async (req, res) => {
  const analytics = await walletService.getAnalytics(req.user.id);
  res.status(200).json(new ApiResponse(200, analytics, 'Wallet analytics retrieved'));
});
