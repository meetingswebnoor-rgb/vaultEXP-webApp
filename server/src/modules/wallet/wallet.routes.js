/**
 * wallet.routes.js
 * ─────────────────────────────────────────────────────────────────
 * Mongoose / MongoDB REMOVED — delegates to wallet.controller.js.
 */
const express = require('express');
const router  = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const walletCtrl = require('./wallet.controller');

router.use(protect);

router.get('/',                               walletCtrl.getWallets);
router.get('/analytics',                      walletCtrl.getWalletAnalytics);
router.post('/',                              walletCtrl.createWallet);
router.get('/:id',                            walletCtrl.getWalletById);
router.put('/:id',                            walletCtrl.updateWallet);
router.delete('/:id',                         walletCtrl.deleteWallet);
router.post('/:id/transactions',              walletCtrl.addTransaction);
router.put('/:id/transactions/:txId',         walletCtrl.updateTransaction);
router.delete('/:id/transactions/:txId',      walletCtrl.deleteTransaction);

module.exports = router;
