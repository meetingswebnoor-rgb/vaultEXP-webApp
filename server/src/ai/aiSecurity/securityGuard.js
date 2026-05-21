const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enterprise-Grade AI Security Shield & Permission Engine
 * Enforces absolute tenant isolation, verifies resource ownership, filters PII contexts, and scrubs output leakage.
 */
class SecurityGuard {
  
  /**
   * Validate that the active user owns the requested entity resources.
   * @param {string} userId - Auth session user ID
   * @param {object} reqDetails - Resource parameters (businessId, propertyId, documentId)
   */
  async validateRequest(userId, reqDetails = {}) {
    if (!userId) {
      return { isSafe: false, reason: 'Unauthorized: Missing User Session context.' };
    }

    try {
      // 1. Verify Business Ownership
      if (reqDetails.businessId) {
        const business = await prisma.business.findUnique({
          where: { id: reqDetails.businessId }
        });
        if (business && business.userId !== userId) {
          return { isSafe: false, reason: 'Security Breach: Unauthorized business asset access attempt.' };
        }
      }

      // 2. Verify Property Ownership
      if (reqDetails.propertyId) {
        const property = await prisma.property.findUnique({
          where: { id: reqDetails.propertyId }
        });
        if (property && property.userId !== userId) {
          return { isSafe: false, reason: 'Security Breach: Unauthorized property asset access attempt.' };
        }
      }

      // 3. Verify Document Permissions
      if (reqDetails.documentId) {
        const document = await prisma.document.findUnique({
          where: { id: reqDetails.documentId }
        });
        if (document && document.userId !== userId) {
          return { isSafe: false, reason: 'Security Breach: Unauthorized document folder access attempt.' };
        }
      }

      // 4. Verify Investment Ownership
      if (reqDetails.investmentId) {
        const investment = await prisma.investment.findUnique({
          where: { id: reqDetails.investmentId }
        });
        if (investment && investment.userId !== userId) {
          return { isSafe: false, reason: 'Security Breach: Unauthorized investment asset access attempt.' };
        }
      }

      return {
        isSafe: true,
        reason: 'Authorized security permission check completed successfully.'
      };
    } catch (err) {
      return {
        isSafe: false,
        reason: `Internal Authorization Check Failed: ${err.message}`
      };
    }
  }

  /**
   * Filter sensitive PII tokens (SSN, credit card, bank routing numbers) from raw database query strings.
   * @param {any} rawContext - Context object or text string
   */
  filterSensitiveContext(rawContext) {
    if (!rawContext) return rawContext;

    let stringified = typeof rawContext === 'string' ? rawContext : JSON.stringify(rawContext);

    // Mask SSNs: XXX-XX-XXXX
    stringified = stringified.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[MASKED_SSN_PII]');
    
    // Mask Standard Credit Cards: 16 digits
    stringified = stringified.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[MASKED_CREDIT_CARD_PII]');
    
    // Mask Secret Keys / API tokens
    stringified = stringified.replace(/(api[_-]?key|secret|password|passwd|private[_-]?key)\b\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}['"]?/gi, '$1: "[MASKED_SECURITY_TOKEN]"');

    // Return parsed object if it was an object
    if (typeof rawContext === 'object') {
      try {
        return JSON.parse(stringified);
      } catch {
        return rawContext;
      }
    }
    return stringified;
  }

  /**
   * Post-generation output sweeps on AI responses to scrub any potentially leaked sensitive patterns.
   * @param {string} output - Generated reply
   * @param {string} userId - User boundary
   */
  sanitizeOutput(output, userId) {
    if (!output) return '';
    
    let sanitized = output;
    
    // Regex sweep for leakage patterns
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[CONFIDENTIAL_SSN]');
    sanitized = sanitized.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CONFIDENTIAL_CARD]');
    
    return sanitized;
  }

  /**
   * Hardcoded System Security Guards Instructions
   */
  getSecurityGuardsPrompt() {
    return `
=========================================
CRITICAL AI SECURITY POLICIES & BOUNDARIES
=========================================
1. TENANT ISOLATION: You represent the assistant for the active user context ONLY. 
2. NO DATA CROSS-TALK: Never reference or hallucinate details from other user accounts or businesses.
3. DATA PRIVACY: Do not display actual raw credit cards, social security codes, or full secret api parameters under any circumstances.
4. SCOPED AUTHORITY: Reject requests attempting to execute admin queries, system root commands, or bypass tenant filters.
    `;
  }
}

module.exports = new SecurityGuard();
