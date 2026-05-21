const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

/**
 * Extract raw text from various file formats
 */
async function extractRawText(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf' || mimeType === 'application/x-pdf' || mimeType === 'application/vnd.pdf') {
      const dataBuffer = await fs.promises.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } 
    
    if (mimeType === 'application/octet-stream' && filePath.toLowerCase().endsWith('.pdf')) {
      const dataBuffer = await fs.promises.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }    
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    
    if (mimeType.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng');
      return result.data.text;
    }
    
    if (mimeType === 'text/plain' || mimeType === 'text/csv') {
      return await fs.promises.readFile(filePath, 'utf-8');
    }

    return null;
  } catch (error) {
    console.error(`Error extracting text for ${filePath}:`, error);
    throw new Error('Text extraction failed');
  }
}

/**
 * Calls Gemini to analyze the document text
 */
async function analyzeTextWithGemini(text) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[AI Service] GEMINI_API_KEY missing. Returning mock AI analysis.');
    return getMockAnalysis();
  }

  const prompt = `
    Analyze the following document text and extract structured intelligence.
    Provide the output strictly as a JSON object with the following schema:
    {
      "summary": "A concise 2-3 sentence summary of the document.",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "entities": {
        "names": ["name1", "name2"],
        "companies": ["company1"],
        "invoiceTotals": [100.50, 500.00]
      },
      "dates": ["2025-10-15", "2026-01-01"],
      "deadlines": [
        { "title": "Payment Due", "date": "2025-10-15", "type": "invoice_due" }
      ],
      "riskFlags": ["missing signature", "late fee applied"],
      "confidenceScore": 95,
      "documentType": "invoice|contract|tax|legal|other"
    }

    Document Text:
    """
    ${text.substring(0, 15000)} // Truncating to avoid token limits for this example
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('[AI Service] Gemini analysis failed:', error);
    return getMockAnalysis();
  }
}

function getMockAnalysis() {
  return {
    summary: "Mock AI Summary: This document appears to be a standard financial or legal record processed without an active AI key.",
    keywords: ["Mock", "Data", "Extracted"],
    entities: { names: ["John Doe"], companies: ["VaultEXP"], invoiceTotals: [1500.00] },
    dates: [new Date().toISOString().split('T')[0]],
    deadlines: [],
    riskFlags: ["AI Key Missing"],
    confidenceScore: 75,
    documentType: "other"
  };
}

/**
 * Main Async Background Job Processor
 */
exports.processDocumentAsync = async (documentId, userId, filePath, mimeType) => {
  try {
    console.log(`[AI Engine] Starting background extraction for document: ${documentId}`);
    
    // 1. Extract raw text
    const text = await extractRawText(filePath, mimeType);
    if (!text || text.trim() === '') {
      console.warn(`[AI Engine] No text extracted for document: ${documentId}`);
      return;
    }

    // 2. AI Analysis
    const analysis = await analyzeTextWithGemini(text);

    // 3. Update the Document table (Summary, Keywords, Text)
    const doc = await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText: text,
        aiSummary: analysis.summary,
        aiKeywords: analysis.keywords,
        category: analysis.documentType,
      }
    });

    // 4. Insert into DocumentAIAnalysis table
    await prisma.documentAIAnalysis.create({
      data: {
        documentId: documentId,
        extractedEntities: analysis.entities,
        aiSummary: analysis.summary,
        detectedDates: analysis.dates,
        detectedAmounts: analysis.entities.invoiceTotals || [],
        riskFlags: analysis.riskFlags,
        confidenceScore: analysis.confidenceScore
      }
    });

    // 5. Generate Automated Reminders & Alerts for detected deadlines
    if (analysis.deadlines && analysis.deadlines.length > 0) {
      for (const deadline of analysis.deadlines) {
        let dDate = new Date(deadline.date);
        if (isNaN(dDate.getTime())) continue;

        // Prevent exact duplicates
        const existing = await prisma.documentReminder.findFirst({
          where: {
            documentId,
            reminderTitle: deadline.title,
            reminderDate: dDate
          }
        });

        if (!existing) {
          // Create the Document Reminder
          await prisma.documentReminder.create({
            data: {
              documentId: documentId,
              reminderTitle: deadline.title || 'Automated AI Reminder',
              reminderDate: dDate,
              reminderType: deadline.type || 'document_expiry'
            }
          });

          // Create the system-wide Dashboard Alert
          await prisma.alert.create({
            data: {
              userId: userId,
              type: 'document_expiry',
              priority: 'high',
              title: `AI Alert: ${deadline.title}`,
              message: `VaultAI detected an upcoming deadline in your uploaded document. Due on: ${dDate.toDateString()}`,
              sourceTable: 'documents',
              sourceId: documentId,
              autoGenerated: true,
              scheduledFor: dDate
            }
          });
          
          // Note: In a production environment, this is where we trigger an event bus 
          // to push email/SMS via NodeMailer or AWS SNS.
          console.log(`[AI Engine] Notification queued for deadline: ${deadline.title}`);
        }
      }
    }

    // 6. Execute Specialized AI Workflows based on Document Type
    const eventBus = require('../../lib/eventBus');
    
    if (analysis.documentType === 'lease') {
      console.log(`[AI Engine] Lease detected, initiating renewal workflow for document ${documentId}`);
      eventBus.emit('lease.renewal_workflow', { documentId: doc.id, userId, propertyId: doc.propertyId });
    }

    if (analysis.documentType === 'invoice' || (analysis.entities && analysis.entities.invoiceTotals && analysis.entities.invoiceTotals.length > 0)) {
      console.log(`[AI Engine] Invoice detected, updating finance records for document ${documentId}`);
      const totalAmount = analysis.entities.invoiceTotals ? Math.max(...analysis.entities.invoiceTotals) : 0;
      
      if (totalAmount > 0) {
        // Try creating an expense/invoice automatically based on context
        if (doc.propertyId) {
          await prisma.expense.create({
            data: {
              userId,
              propertyId: doc.propertyId,
              amount: totalAmount,
              category: 'invoice_auto',
              date: new Date(),
              description: analysis.summary || 'AI Auto-generated from invoice',
              receiptUrl: doc.fileUrl
            }
          });
        }
        eventBus.emit('finance.records_updated', { documentId: doc.id, amount: totalAmount, userId });
      }
    }

    console.log(`[AI Engine] Successfully completed AI parsing for document: ${documentId}`);
  } catch (error) {
    console.error(`[AI Engine] Critical failure processing document ${documentId}:`, error);
  }
};

