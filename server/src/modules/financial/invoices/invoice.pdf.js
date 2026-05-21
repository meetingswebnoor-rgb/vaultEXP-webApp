const PDFDocument = require('pdfkit');

/**
 * Generate a PDF invoice as a buffer.
 */
const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- HEADER ---
      doc
        .fillColor('#00FF88') // Vault Green
        .fontSize(24)
        .text('VaultEXP', 50, 45, { align: 'right' })
        .fillColor('#ffffff') // Reset for standard text but pdfkit bg is white, so use black/gray
        .fillColor('#333333');

      doc
        .fontSize(10)
        .text('Enterprise Billing System', 200, 65, { align: 'right' })
        .moveDown();

      // --- INVOICE INFO ---
      doc
        .fontSize(20)
        .fillColor('#111111')
        .text('INVOICE', 50, 100);

      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 125)
        .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 140)
        .text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt'}`, 50, 155);

      // --- CLIENT INFO ---
      doc
        .fontSize(12)
        .fillColor('#111111')
        .text('Billed To:', 300, 100)
        .fontSize(10)
        .fillColor('#666666')
        .text(invoice.clientName, 300, 115)
        .text(invoice.clientEmail || '', 300, 130)
        .text(invoice.clientAddress || '', 300, 145);

      // --- ITEMS TABLE HEADER ---
      const tableTop = 220;
      doc
        .fontSize(10)
        .fillColor('#111111')
        .text('Description', 50, tableTop)
        .text('Qty', 300, tableTop)
        .text('Unit Price', 380, tableTop)
        .text('Amount', 450, tableTop);
        
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .strokeColor('#cccccc')
        .stroke();

      // --- ITEMS ---
      let currentY = tableTop + 25;
      invoice.items.forEach(item => {
        doc
          .fillColor('#333333')
          .text(item.description, 50, currentY, { width: 240 })
          .text(item.quantity.toString(), 300, currentY)
          .text(`$${parseFloat(item.unitPrice).toFixed(2)}`, 380, currentY)
          .text(`$${parseFloat(item.amount).toFixed(2)}`, 450, currentY);
        
        currentY += 20;
      });

      doc
        .moveTo(50, currentY + 10)
        .lineTo(550, currentY + 10)
        .strokeColor('#cccccc')
        .stroke();

      // --- TOTALS ---
      currentY += 25;
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Subtotal:', 380, currentY)
        .fillColor('#111111')
        .text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, 450, currentY);

      if (parseFloat(invoice.taxAmount) > 0) {
        currentY += 15;
        doc
          .fillColor('#666666')
          .text('Tax:', 380, currentY)
          .fillColor('#111111')
          .text(`$${parseFloat(invoice.taxAmount).toFixed(2)}`, 450, currentY);
      }
      
      if (parseFloat(invoice.discountAmount) > 0) {
        currentY += 15;
        doc
          .fillColor('#666666')
          .text('Discount:', 380, currentY)
          .fillColor('#111111')
          .text(`-$${parseFloat(invoice.discountAmount).toFixed(2)}`, 450, currentY);
      }

      currentY += 20;
      doc
        .fontSize(14)
        .fillColor('#00FF88') // Accent
        .text('Total:', 380, currentY)
        .fillColor('#111111')
        .text(`$${parseFloat(invoice.totalAmount).toFixed(2)}`, 450, currentY);

      // --- FOOTER ---
      doc
        .fontSize(10)
        .fillColor('#999999')
        .text('Thank you for your business!', 50, 700, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF
};
