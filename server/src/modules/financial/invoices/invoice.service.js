const prisma = require('../../../lib/prisma');
const { generateInvoicePDF } = require('./invoice.pdf');
const crypto = require('crypto');

const createInvoice = async (userId, data) => {
  const { items, discountAmount = 0, ...invoiceData } = data;
  
  // Auto-generate invoice number if missing
  const invoiceNumber = invoiceData.invoiceNumber || `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  // Calculate totals and taxes line-by-line
  let subtotal = 0;
  let taxAmount = 0;
  
  const processedItems = items.map(item => {
    const qty = parseFloat(item.quantity || 1);
    const price = parseFloat(item.unitPrice || 0);
    const taxRate = parseFloat(item.taxRate || 0);
    
    const amount = qty * price;
    const itemTax = amount * (taxRate / 100);
    
    subtotal += amount;
    taxAmount += itemTax;
    
    return { ...item, amount };
  });

  const totalAmount = subtotal + taxAmount - parseFloat(discountAmount);
  
  return await prisma.invoice.create({
    data: {
      userId,
      ...invoiceData,
      invoiceNumber,
      discountAmount,
      taxAmount,
      subtotal,
      totalAmount,
      status: 'draft',
      items: {
        create: processedItems
      }
    },
    include: { items: true }
  });
};

const getInvoices = async (userId) => {
  return await prisma.invoice.findMany({
    where: { userId },
    include: { items: true, payments: true, client: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

const getInvoiceById = async (id, userId = null) => {
  const where = { id };
  // If userId is provided, ensure they own it OR are the client
  if (userId) {
    where.OR = [ { userId }, { clientId: userId } ];
  }
  
  const invoice = await prisma.invoice.findFirst({
    where,
    include: { items: true, payments: true }
  });
  
  if (!invoice) throw new Error('Invoice not found');
  return invoice;
};

const generatePDF = async (id, userId = null) => {
  const invoice = await getInvoiceById(id, userId);
  return await generateInvoicePDF(invoice);
};

const updateStatus = async (id, status, userId) => {
  return await prisma.invoice.update({
    where: { id, userId },
    data: { status }
  });
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  generatePDF,
  updateStatus
};
