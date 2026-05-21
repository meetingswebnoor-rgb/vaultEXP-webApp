/**
 * property.routes.js
 * ─────────────────────────────────────────────────────────────────
 * All routes require a valid JWT (protect middleware).
 * Ownership is double-enforced in the service layer via userId filter.
 *
 * Route map:
 *   GET    /api/property/stats     → portfolio-level stats (must be before /:id)
 *   POST   /api/property/create    → create property
 *   GET    /api/property           → list all properties (paginated)
 *   GET    /api/property/:id       → single property + tenants/expenses/docs/alerts
 *   PUT    /api/property/:id       → partial update
 *   DELETE /api/property/:id       → hard delete + cascade
 */
'use strict';

const express          = require('express');
const router           = express.Router();
const controller       = require('./property.controller');
const tenantController = require('./tenant.controller');
const rentController   = require('./rent.controller');
const expenseController= require('./expense.controller');
const documentController= require('./document.controller');
const alertController  = require('./alert.controller');
const { protect }      = require('../../middleware/auth.middleware');

// ── JWT guard on every route ──────────────────────────────────
router.use(protect);

// ── /stats must be before /:id ────────────────────────────────
router.get('/stats', controller.getStats);

// ── Tenant standalone routes — MUST be before /:id ───────────
router
  .route('/tenant/:id')
  .get(tenantController.getTenant)
  .put(tenantController.updateTenant)
  .delete(tenantController.deleteTenant);

// ── Rent standalone routes — MUST be before /:id ─────────────
// PUT /api/property/rent/:recordId
router.put('/rent/:recordId', rentController.updateRentRecord);

// ── Expense standalone routes — MUST be before /:id ──────────
router
  .route('/expense/:id')
  .get(expenseController.getExpense)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

// ── Document standalone routes — MUST be before /:id ─────────
router
  .route('/document/:id')
  .get(documentController.getDocument)
  .put(documentController.updateDocument)
  .delete(documentController.deleteDocument);

// ── Alert standalone routes — MUST be before /:id ────────────
router.put('/alert/:id/status', alertController.updateAlertStatus);
router.delete('/alert/:id', alertController.deleteAlert);

// ── Property CRUD ─────────────────────────────────────────────
router.post('/create', controller.createProperty);
router.get('/',        controller.listProperties);

// ── Tenant list/create — nested under property ────────────────
router
  .route('/:propertyId/tenants')
  .get(tenantController.listTenants)
  .post(tenantController.createTenant);

// ── Expense list/create — nested under property ───────────────
router
  .route('/:propertyId/expenses')
  .get(expenseController.listExpenses)
  .post(expenseController.createExpense);

// ── Document list/create — nested under property ──────────────
router
  .route('/:propertyId/documents')
  .get(documentController.listDocuments)
  .post(documentController.createDocument);

// ── Alerts — nested under property ────────────────────────────
router.get('/:propertyId/alerts', alertController.listAlerts);
router.post('/:propertyId/alerts/generate', alertController.autoGenerateAlerts);

// ── Rent routes — nested under property ───────────────────────
router.get('/:propertyId/rent', rentController.listRentRecords);
router.post('/:propertyId/rent/generate', rentController.generateBulkRecords);
router.post('/:propertyId/tenant/:tenantId/rent', rentController.getOrCreateRecord);

// ── Analytics ────────────────────────────────────────────────
router.get('/:id/analytics', controller.getAnalytics);

// ── AI Context ───────────────────────────────────────────────
router.get('/:id/ai-context', controller.getAIContext);
router.get('/:id/ai-advice', controller.getAIAdvice);

// ── Property Single (Wildcard) MUST be last ───────────────────
router
  .route('/:id')
  .get(controller.getProperty)
  .put(controller.updateProperty)
  .delete(controller.deleteProperty);

module.exports = router;

