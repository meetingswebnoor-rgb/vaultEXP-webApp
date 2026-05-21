const prisma = require('../../lib/prisma');
const engine = require('../engine/automation.engine');

class DocumentTrigger {
  /**
   * Triggered instantly when a document is uploaded.
   */
  async evaluateUpload(documentId) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) return;

    // Standard Document Uploaded Trigger
    await engine.handleTrigger('document.uploaded', { 
      documentId: doc.id, 
      fileName: doc.originalName, 
      type: doc.fileType,
      category: doc.category
    });

    // Specialized Routing
    if (['tax-return', 'w2', '1099', 'receipt'].includes(doc.category)) {
      await engine.handleTrigger('document.tax_uploaded', { 
        documentId: doc.id,
        businessId: doc.businessId,
        userId: doc.userId
      });
    }
  }
}

module.exports = new DocumentTrigger();
