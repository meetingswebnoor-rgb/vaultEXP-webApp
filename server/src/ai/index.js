const vaultAI = require('./aiEngine/engine');

/**
 * VaultAI Centralized Export
 * Provides the main entry point to the AI ecosystem for the rest of the backend.
 */
module.exports = {
  vaultAI,
  processUserQuery: (userId, query, modules, workspaceId = null) => vaultAI.processQuery(userId, query, modules, workspaceId),
  generateInsights: (userId) => vaultAI.generateInsights(userId),
  generateBusinessAdvice: (userId, businessId) => vaultAI.generateBusinessAdvice(userId, businessId),
  generatePropertyAdvice: (userId, propertyId) => vaultAI.generatePropertyAdvice(userId, propertyId),
  generateInvestmentIntelligence: (userId) => vaultAI.generateInvestmentIntelligence(userId),
  generateTaxStrategy: (userId) => vaultAI.generateTaxStrategy(userId),
};
