/**
 * Plaid Mock Service
 * This provides an abstraction layer for Open Banking connections.
 * In production, this would initialize the Plaid client and exchange public tokens.
 */

const prisma = require('../../../lib/prisma');

class PlaidService {
  /**
   * Simulate exchanging a public token from Plaid Link for an access token.
   */
  async exchangePublicToken(publicToken, userId) {
    // Mock success
    const mockAccessToken = `access-mock-${Math.random().toString(36).substring(7)}`;
    const mockAccountId = `account-mock-${Math.random().toString(36).substring(7)}`;
    
    // In a real app, we would fetch account details from Plaid
    return {
      accessToken: mockAccessToken,
      accountId: mockAccountId,
      bankName: 'Chase Bank (Mock)',
      mask: '1234',
      type: 'checking'
    };
  }

  /**
   * Simulate fetching transactions from Plaid
   */
  async fetchTransactions(accessToken, startDate, endDate) {
    // Generate some mock external transactions
    return [
      { id: 'ext_1', amount: -50.00, name: 'Uber Eats', date: new Date().toISOString(), pending: false },
      { id: 'ext_2', amount: 1500.00, name: 'Stripe Payout', date: new Date(Date.now() - 86400000).toISOString(), pending: false },
      { id: 'ext_3', amount: -12.99, name: 'Netflix', date: new Date(Date.now() - 172800000).toISOString(), pending: false }
    ];
  }
}

module.exports = new PlaidService();
