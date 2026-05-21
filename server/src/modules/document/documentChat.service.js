const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

/**
 * Handles chatting with specific documents.
 * Employs a retrieval-augmented generation (RAG) approach:
 * 1. Verifies ownership and fetches selected documents.
 * 2. Uses 'extractedText' and 'aiAnalysis' as context.
 * 3. Instructs the AI to answer solely based on the provided context.
 */
exports.chatWithDocuments = async (userId, documentIds, query) => {
  try {
    // 1. Fetch only the requested documents, ensuring they belong to the user
    // to prevent unauthorized cross-tenant data access.
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        userId: userId
      },
      include: {
        aiAnalysis: true
      }
    });

    if (documents.length === 0) {
      throw new Error('No valid documents found or access denied.');
    }

    // 2. Build the context injection string
    // In a future vector-ready architecture, this would be retrieved via similarity search 
    // over Pinecone/PgVector embeddings. For now, we inject the specific requested documents.
    let contextStr = documents.map(doc => `
      --- Document: ${doc.originalName} (ID: ${doc.id}) ---
      AI Summary: ${doc.aiSummary || 'N/A'}
      Key Entities: ${JSON.stringify(doc.aiAnalysis?.extractedEntities || {})}
      Extracted Text:
      ${doc.extractedText ? doc.extractedText.substring(0, 15000) : 'No raw text available.'}
    `).join('\n\n');

    const prompt = `
      You are VaultAI, a highly intelligent and secure financial/legal document assistant.
      Your task is to answer the user's question based strictly on the provided Document Context below.

      Rules:
      1. ONLY use the provided context to answer. If the answer is not in the documents, say "I cannot find this information in the provided documents."
      2. Cite your sources by referring to the Document Name.
      3. Keep answers concise, professional, and directly address the user's query.
      4. If analyzing financial amounts or dates, double-check accuracy.

      ====================================
      DOCUMENT CONTEXT:
      ${contextStr}
      ====================================

      User Question: "${query}"
      
      Response:
    `;

    // 3. Call the AI Model
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('ENTER_YOUR')) {
      console.warn('[AI Chat] GEMINI_API_KEY missing. Using Smart Mock.');
      
      // Simple "Local Intelligence" to actually "read" the document
      const docText = documents.map(d => d.extractedText || '').join(' ').toLowerCase();
      let answer = `[VaultAI Local Engine] I detected your document "${documents[0].originalName}". `;
      
      if (query.toLowerCase().includes('amount') || query.toLowerCase().includes('total') || query.toLowerCase().includes('much')) {
        const amountMatch = docText.match(/(\$|£|€)\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/) || docText.match(/total\s?:?\s?(\d+(\.\d{2})?)/);
        if (amountMatch) {
          answer += `The detected amount is approximately ${amountMatch[0]}.`;
        } else {
          answer += `I couldn't find a specific total amount, but I can see the document text. (Please add GEMINI_API_KEY for advanced analysis).`;
        }
      } else if (query.toLowerCase().includes('date') || query.toLowerCase().includes('when')) {
        const dateMatch = docText.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/) || docText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s\d{1,2},?\s\d{4}/i);
        if (dateMatch) {
          answer += `A date was found: ${dateMatch[0]}.`;
        } else {
          answer += `I couldn't find a clear date, but the document is loaded. (Please add GEMINI_API_KEY for advanced analysis).`;
        }
      } else {
        answer += `I have successfully read the text of your document. To get a detailed AI answer, please configure your GEMINI_API_KEY in the .env file.`;
      }

      return {
        answer,
        citations: documents.map(d => d.originalName)
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return {
      answer: response.text,
      citations: documents.map(d => d.originalName)
    };
  } catch (error) {
    console.error('[AI Chat] Error during document chat:', error);
    throw error;
  }
};
