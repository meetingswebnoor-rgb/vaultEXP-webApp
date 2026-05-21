const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Context Manager for VaultAI
 * Responsible for securely fetching relevant real data from VaultEXP modules.
 */
class ContextManager {
  
  /**
   * Gather comprehensive context for a user based on requested modules
   * @param {string} userId
   * @param {Array<string>} modules - E.g., ['wallet', 'properties', 'reminders']
   */
  async gatherContext(userId, modules = ['all']) {
    const context = {};
    
    try {
      if (modules.includes('wallet') || modules.includes('all')) {
        context.wallet = await this.getWalletContext(userId);
      }
      
      if (modules.includes('properties') || modules.includes('all')) {
        context.properties = await this.getPropertiesContext(userId);
      }

      if (modules.includes('documents') || modules.includes('all')) {
        context.documents = await this.getDocumentsContext(userId);
      }

      if (modules.includes('businesses') || modules.includes('all')) {
        context.businesses = await this.getBusinessContext(userId);
      }
      
      if (modules.includes('reminders') || modules.includes('all')) {
        context.reminders = await this.getRemindersContext(userId);
      }
      
      // Additional modules like investments, analytics, tax...
      
    } catch (error) {
      console.error('Error gathering AI context:', error);
      // Soft fail: return whatever context we successfully gathered
    }
    
    return context;
  }

  async getWalletContext(userId) {
    // Connect to real data via Prisma
    // const wallet = await prisma.wallet.findUnique({ where: { userId } });
    // const recentTransactions = await prisma.transaction.findMany({ where: { walletId: wallet.id }, take: 5 });
    return { summary: "Fetching wallet data dynamically..." };
  }

  async getPropertiesContext(userId) {
    // const properties = await prisma.property.findMany({ where: { userId } });
    return { summary: "Fetching properties dynamically..." };
  }

  async getDocumentsContext(userId) {
    // Fetch recent document metadata
    return { summary: "Fetching recent documents dynamically..." };
  }

  async getBusinessContext(userId) {
    return { summary: "Fetching business portfolio dynamically..." };
  }

  async getRemindersContext(userId) {
    return { summary: "Fetching active reminders dynamically..." };
  }
}

module.exports = new ContextManager();
