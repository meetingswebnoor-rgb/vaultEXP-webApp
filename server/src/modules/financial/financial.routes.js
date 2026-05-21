const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const { FinancialAuditService } = require('./financial.audit.service');

// We would import controllers here
const invoiceController = require('./invoices/invoice.controller');
const paymentIntentController = require('./payments/paymentIntent.controller');
const bankingController = require('./banking/banking.controller');
const transactionController = require('./transactions/transaction.controller');
const accountingController = require('./accounting/accounting.controller');
const subscriptionController = require('./billing/subscription.controller');
const expenseController = require('./expenses/expense.controller');
const advisorController = require('./advisor/advisor.controller');
const auditController = require('./financial.audit.controller');
// const paymentController = require('./payments/payment.controller');
// const reportController = require('./reports/report.controller');

router.use(protect);
router.use(FinancialAuditService.financialAuditMiddleware());

// Financial Audit Routes (Admin Only)
router.get('/audit/logs', restrictTo('ADMIN', 'SUPER_ADMIN'), auditController.getAuditLogs);
router.get('/audit/risk', restrictTo('ADMIN', 'SUPER_ADMIN'), auditController.runRiskScan);
router.get('/audit/stats', restrictTo('ADMIN', 'SUPER_ADMIN'), auditController.getAuditStats);

// Unified Financial API structure (Endpoints mapped to services)
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'Financial OS Active', user: req.user.id });
});

// Invoice Routes
router.post('/invoices', invoiceController.createInvoice);
router.get('/invoices', invoiceController.getInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.get('/invoices/:id/pdf', invoiceController.downloadPDF);
router.patch('/invoices/:id/status', invoiceController.updateStatus);
router.post('/invoices/:id/send', invoiceController.sendInvoice);

// Payment Gateway Routes
router.post('/payments/intent', paymentIntentController.createPaymentIntent);

// Banking & Reconciliation Routes
router.post('/banking/connect', bankingController.connectBankAccount);
router.get('/banking/:walletId/reconciliation', bankingController.getReconciliationReport);
router.post('/banking/:walletId/reconcile', bankingController.autoReconcile);

// Intelligent Transaction Ecosystem
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/ai-insights', transactionController.getAiInsights);
router.patch('/transactions/:id/category', transactionController.updateCategory);

// Accounting & Ledger
router.post('/accounting/journal', accountingController.createJournalEntry);
router.get('/accounting/ledger/:walletId', accountingController.getLedger);
router.get('/accounting/reports', accountingController.getFinancialReports);
router.get('/accounting/reports/export', accountingController.exportReport);

// Subscriptions & Billing
router.post('/subscriptions', subscriptionController.createSubscription);
router.get('/subscriptions', subscriptionController.getSubscriptions);
router.get('/subscriptions/client', subscriptionController.getClientSubscriptions);
router.post('/subscriptions/process-renewals', subscriptionController.processRenewals);
router.post('/subscriptions/:id/cancel', subscriptionController.cancelSubscription);

// Expenses & Intelligence
router.post('/expenses', expenseController.createExpense);
router.get('/expenses', expenseController.getExpenses);
router.get('/expenses/ai-insights', expenseController.getAiInsights);
router.patch('/expenses/:id/tax-status', expenseController.updateTaxStatus);

// AI Advisor
router.get('/advisor/insights', advisorController.getAdvisorInsights);

module.exports = router;
