const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const NodeCache = require('node-cache');

/**
 * AI Memory Store
 * Manages user-specific conversation history to provide context-aware responses.
 * Implements Session Memory, Persistent Memory, and Context Memory.
 */
class MemoryStore {
  constructor() {
    // Session Memory (In-memory cache): Stores recent chat history. Expires after 1 hour of inactivity.
    // This prevents sensitive financial data from being stored long-term unencrypted.
    this.sessionCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
  }
  
  /**
   * Retrieve short-term session history for a user
   * @param {string} userId 
   * @param {number} limit 
   * @returns {Array} Array of message objects { role, content }
   */
  async getHistory(userId, limit = 10) {
    const history = this.sessionCache.get(`session_${userId}`) || [];
    // Only return the last `limit` messages
    return history.slice(-limit);
  }

  /**
   * Save a new interaction to the user's short-term session memory
   * @param {string} userId 
   * @param {string} userMessage 
   * @param {string} aiResponse 
   */
  async saveInteraction(userId, userMessage, aiResponse) {
    let history = this.sessionCache.get(`session_${userId}`) || [];
    
    // We do NOT store sensitive raw financial payloads, just the conversational flow.
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: aiResponse });

    // Keep session memory capped at last 50 messages to prevent memory bloat
    if (history.length > 50) {
      history = history.slice(-50);
    }

    this.sessionCache.set(`session_${userId}`, history);
    
    // Asynchronously update persistent memory with preferences derived from the query
    this.updatePersistentMemory(userId, userMessage).catch(console.error);
    
    return true;
  }

  /**
   * Clear user's session memory context
   * @param {string} userId 
   */
  async clearHistory(userId) {
    this.sessionCache.del(`session_${userId}`);
    return true;
  }

  /**
   * Fetch user's persistent memory (AI profile, preferences, businesses, properties)
   * @param {string} userId 
   */
  async getPersistentMemory(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { aiProfile: true, currency: true, timezone: true }
      });
      return user ? user : {};
    } catch (error) {
      console.error('Error fetching persistent memory:', error);
      return {};
    }
  }

  /**
   * Dynamically updates the user's persistent AI profile based on their interactions
   * @param {string} userId 
   * @param {string} userMessage 
   */
  async updatePersistentMemory(userId, userMessage) {
    try {
      // Very basic keyword heuristic to update persistent preferences.
      // In a production system, this could be another background LLM call to extract facts.
      const lowerQuery = userMessage.toLowerCase();
      let updatesNeeded = false;
      
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { aiProfile: true } });
      const currentProfile = (user && user.aiProfile) ? user.aiProfile : { favoriteActions: [], interests: [] };
      
      if (lowerQuery.includes('property') || lowerQuery.includes('rent')) {
        if (!currentProfile.interests.includes('real_estate')) {
          currentProfile.interests.push('real_estate');
          updatesNeeded = true;
        }
      }
      if (lowerQuery.includes('invoice') || lowerQuery.includes('business')) {
        if (!currentProfile.interests.includes('business_management')) {
          currentProfile.interests.push('business_management');
          updatesNeeded = true;
        }
      }

      if (updatesNeeded) {
        await prisma.user.update({
          where: { id: userId },
          data: { aiProfile: currentProfile }
        });
      }
    } catch (error) {
      console.error('Error updating persistent memory:', error);
    }
  }
}

module.exports = new MemoryStore();
