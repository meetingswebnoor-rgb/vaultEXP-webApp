const express = require('express');
const { getClientDashboard, aiClientQuery, getClientInvoices, getClientSubscriptions, getClientReports, getClientDocuments, uploadClientDocument, getClientAgreements, signClientAgreement, getClientWorkflows, processClientWorkflow, getClientChannels, getClientMessages, sendClientMessage, scheduleClientMeeting, getClientAnalytics } = require('./client.controller');
const { requireClientIsolation } = require('../../middleware/permissions.middleware');
const { auditAction } = require('../../middleware/audit.middleware');
const { detectSuspiciousActivity } = require('../../middleware/security.middleware');

const router = express.Router();

// Enforce that only users with the 'client' role can access this namespace, and strictly isolate them.
router.use(requireClientIsolation);

router.get('/dashboard', getClientDashboard);
router.post('/ai/chat', detectSuspiciousActivity(10, 60000, 'CRITICAL'), auditAction('AI', 'QUERY'), aiClientQuery);

router.get('/invoices', getClientInvoices);
router.get('/subscriptions', getClientSubscriptions);
router.get('/reports', getClientReports);

router.get('/documents', getClientDocuments);
router.post('/documents/upload', auditAction('DOCUMENT', 'UPLOAD'), uploadClientDocument);
router.get('/agreements', getClientAgreements);
router.post('/agreements/:id/sign', auditAction('AGREEMENT', 'SIGN'), signClientAgreement);

router.get('/workflows', getClientWorkflows);
router.post('/workflows/:id/process', auditAction('WORKFLOW', 'PROCESS'), processClientWorkflow);

router.get('/channels', getClientChannels);
router.get('/channels/:channelId/messages', getClientMessages);
router.post('/channels/:channelId/messages', sendClientMessage);
router.post('/meetings', scheduleClientMeeting);

router.get('/analytics', getClientAnalytics);

module.exports = router;
