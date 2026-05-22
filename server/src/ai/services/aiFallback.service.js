/**
 * aiFallback.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * VaultEXP AI Fallback Intelligence Engine
 *
 * This service provides intelligent local AI responses when:
 *  - No Gemini/OpenAI API key is configured
 *  - The AI provider is unavailable or times out
 *  - The provider returns an empty or malformed response
 *
 * NEVER returns errors. ALWAYS returns a valid, helpful response.
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * VaultEXP Local Knowledge Base
 * Each entry has: keywords[], response string
 */
const KNOWLEDGE_BASE = [
  // ── VaultEXP Platform ────────────────────────────────────────────────
  {
    keywords: ['what is vaultexp', 'vaultexp', 'platform', 'what is vault', 'about vaultexp', 'tell me about'],
    response: `VaultEXP is an advanced business operating system created by Taliv. It combines finance management, CRM, AI-powered tools, automation workflows, analytics, document intelligence, invoicing, tax strategy, and productivity tools into one unified platform. VaultEXP is designed for entrepreneurs, investors, and business operators who want complete control of their financial and operational ecosystems.`
  },
  {
    keywords: ['taliv', 'who built', 'who created', 'founder', 'made by'],
    response: `VaultEXP is built by Taliv — a team dedicated to building the most powerful business operating system for modern entrepreneurs. Taliv continues to expand VaultEXP with new AI capabilities, integrations, and intelligent automation features.`
  },

  // ── AI & Intelligence ────────────────────────────────────────────────
  {
    keywords: ['can you analyze', 'analyze documents', 'document analysis', 'ai document', 'document intelligence'],
    response: `Basic document assistance is available right now. You can upload documents to your Document Vault, and VaultAI will help you organize, categorize, and summarize them. Taliv is still expanding my advanced AI document intelligence features including automated contract analysis, clause extraction, and compliance checks.`
  },
  {
    keywords: ['ai capabilities', 'what can you do', 'what can ai do', 'ai features', 'help me with', 'how can you help'],
    response: `I can currently help you with VaultEXP navigation and guidance, business performance questions, invoice and expense tracking, CRM contacts and client management, document organization, tax deduction basics, investment portfolio questions, productivity tips, automation suggestions, and financial dashboards. Taliv is continuously expanding my advanced AI intelligence — soon I'll be able to run deeper analysis and predictions.`
  },
  {
    keywords: ['ai not working', 'ai broken', 'ai error', 'why is ai'],
    response: `I'm currently operating in standard intelligence mode. Taliv is still making me smarter with advanced reasoning capabilities. I can currently help with simple VaultEXP, business, productivity, and document questions while Taliv continues improving my intelligence. Try asking me about your invoices, expenses, business performance, or how to use any VaultEXP feature.`
  },

  // ── Invoices ──────────────────────────────────────────────────────────
  {
    keywords: ['invoice', 'invoices', 'billing', 'bill clients', 'send invoice', 'create invoice'],
    response: `VaultEXP's Invoice module lets you create professional invoices, track payment status (paid, pending, overdue), and send them directly to clients. You can organize invoices in folders, categorize them by client or payment status, and track paid/unpaid records using the VaultEXP invoice dashboard. Navigate to the Invoices section from your main dashboard to get started.`
  },
  {
    keywords: ['unpaid invoice', 'overdue invoice', 'outstanding invoice', 'unpaid', 'overdue'],
    response: `To check unpaid or overdue invoices, go to your Invoices dashboard and filter by status. VaultAI monitors your invoice aging and will alert you when payments are overdue. You can send payment reminders directly from the invoice detail view. I recommend reviewing your outstanding invoices weekly to maintain healthy cash flow.`
  },
  {
    keywords: ['organize invoice', 'invoice folder', 'sort invoice', 'manage invoice'],
    response: `You can organize invoices in VaultEXP by client name, date range, payment status, or custom folders. Use the filter options in your Invoice dashboard to sort and group invoices. Creating separate folders for each client or project makes it easy to track billing history and generate financial summaries.`
  },

  // ── Expenses ──────────────────────────────────────────────────────────
  {
    keywords: ['expense', 'expenses', 'spending', 'costs', 'track expense', 'expense tracking'],
    response: `VaultEXP's Expense tracker lets you log business expenses, categorize them by type (office, travel, marketing, etc.), and mark them as tax-deductible. You can connect receipts to expenses and get a clear picture of your spending patterns. Head to the Expenses section to view your expense breakdown and identify areas to optimize costs.`
  },
  {
    keywords: ['tax deductible', 'deduction', 'write off', 'write-off', 'tax expense'],
    response: `In VaultEXP, you can mark expenses as tax-deductible when logging them. Go to your Expenses section and toggle the "Tax Deductible" flag on eligible business expenses. Common deductible expenses include office supplies, software subscriptions, business travel, professional development, and home office costs. Your Tax Strategist module will aggregate all marked deductions for planning.`
  },

  // ── Tax ───────────────────────────────────────────────────────────────
  {
    keywords: ['tax', 'taxes', 'tax strategy', 'tax planning', 'irs', 'tax filing'],
    response: `VaultEXP's Tax Strategist module helps you identify potential deductions, organize tax-relevant documents, and plan for quarterly payments. Basic tax guidance is available now — I can help you understand deduction categories, track your claimed vs. potential write-offs, and organize W-2/1099 documents. For certified tax advice, always consult a licensed CPA. Note: VaultAI provides educational planning guidance, not formal legal tax counsel.`
  },
  {
    keywords: ['quarterly tax', 'estimated tax', 'quarterly payment', 'quarterly filing'],
    response: `Quarterly estimated tax payments are typically due in April, June, September, and January for the following year. VaultEXP can help you track your income and expenses to estimate your quarterly liability. Make sure your tax-deductible expenses are marked in the Expenses module so they're captured in your Tax Strategist summary. Set reminders in VaultEXP to never miss a quarterly deadline.`
  },

  // ── CRM ───────────────────────────────────────────────────────────────
  {
    keywords: ['crm', 'contacts', 'clients', 'customer', 'lead', 'pipeline', 'sales'],
    response: `VaultEXP's CRM module lets you manage contacts, track client interactions, manage your sales pipeline, and monitor deal progress. You can log calls, emails, and meetings, set follow-up reminders, and view your entire client relationship history in one place. Head to the CRM section from your main dashboard to access your contact list and pipeline view.`
  },
  {
    keywords: ['add contact', 'new client', 'add client', 'new contact'],
    response: `To add a new contact or client in VaultEXP, go to the CRM module and click the "Add Contact" button. Fill in their name, email, phone, company, and any relevant tags. You can then associate invoices, notes, and meetings directly to that contact profile, keeping your entire client relationship organized in one place.`
  },

  // ── Documents ─────────────────────────────────────────────────────────
  {
    keywords: ['document', 'documents', 'file', 'upload file', 'upload document', 'vault storage'],
    response: `Your VaultEXP Document Vault lets you securely store, organize, and access all your business documents. Upload contracts, tax files, business licenses, W-2/1099 forms, and any other important files. Documents can be organized into folders, tagged by category, and searched quickly. Navigate to the Documents section to manage your file library.`
  },
  {
    keywords: ['organize files', 'file organization', 'document folder', 'organize document'],
    response: `To organize your files in VaultEXP, create folders by category (e.g., Tax Documents, Contracts, Invoices, Legal) in your Document Vault. Upload files into the appropriate folders and add tags for easy searching. I recommend creating a consistent folder structure so you can always find documents quickly, especially during tax season or audits.`
  },

  // ── Analytics ─────────────────────────────────────────────────────────
  {
    keywords: ['analytics', 'reports', 'dashboard', 'metrics', 'kpi', 'performance'],
    response: `VaultEXP's Analytics module gives you a comprehensive view of your business performance with real-time charts, KPI tracking, revenue trends, expense breakdowns, and growth metrics. You can generate custom reports for specific date ranges and export them as PDFs. Check your Analytics dashboard regularly to spot trends and make data-driven decisions.`
  },
  {
    keywords: ['revenue', 'income', 'profit', 'earnings', 'total revenue'],
    response: `Your revenue data is tracked across your businesses and invoices in VaultEXP. Go to the Analytics or Business dashboard to see total revenue, monthly trends, profit margins, and income by source. You can compare periods to identify growth patterns and seasonality in your revenue streams.`
  },

  // ── Automation ────────────────────────────────────────────────────────
  {
    keywords: ['automation', 'automate', 'workflow', 'automatic', 'trigger'],
    response: `VaultEXP's Automation engine lets you create workflows that run automatically based on triggers. Examples include: automatically sending invoice reminders when payments are overdue, creating tasks when new leads are added to CRM, or sending reports on a schedule. Visit the Automation dashboard to browse templates or build custom workflows without writing any code.`
  },
  {
    keywords: ['reminder', 'reminders', 'schedule reminder', 'set reminder'],
    response: `You can set reminders in VaultEXP for deadlines, follow-ups, tax payments, and anything else important. Use the Reminders section to create alerts for specific dates and times. You can also set recurring reminders for things like monthly reviews, quarterly tax payments, or annual filings. Reminders will notify you through the platform and via email.`
  },

  // ── Business ──────────────────────────────────────────────────────────
  {
    keywords: ['business', 'my business', 'business performance', 'business health', 'company'],
    response: `VaultEXP's Business module lets you manage multiple businesses from a single dashboard. You can track revenue, expenses, profit margins, invoices, and team performance for each business entity. The AI Business Advisor analyzes your financial data and provides actionable recommendations to improve profitability and reduce costs. Visit your Business dashboard for a full overview.`
  },
  {
    keywords: ['profit margin', 'margin', 'profitability', 'net income'],
    response: `Your profit margin is calculated in VaultEXP by comparing your total revenue against total expenses for each business. A healthy profit margin varies by industry, but generally 15-20% or higher is considered solid for most businesses. Check your Business dashboard for your current profit margin and expense breakdown. The AI can suggest cost-saving opportunities when it has your financial data.`
  },

  // ── Properties ────────────────────────────────────────────────────────
  {
    keywords: ['property', 'properties', 'real estate', 'rental', 'tenant', 'lease', 'rent'],
    response: `VaultEXP's Property module helps you manage your real estate portfolio. Track tenant leases, rent payments, maintenance expenses, and property valuations in one place. You can monitor which tenants are overdue on rent, which leases are expiring soon, and calculate your net rental yield. Visit the Property dashboard to see your full real estate portfolio overview.`
  },
  {
    keywords: ['tenant', 'tenants', 'overdue rent', 'rent collection', 'tenant management'],
    response: `In VaultEXP, you can manage all your tenants from the Property module. View lease start/end dates, monthly rent amounts, payment history, and contact information for each tenant. VaultAI monitors for overdue rent and expiring leases, alerting you proactively so you can take action before issues escalate. Click on any property to see its tenant management details.`
  },

  // ── Investments ───────────────────────────────────────────────────────
  {
    keywords: ['investment', 'investments', 'portfolio', 'stock', 'stocks', 'assets', 'roi'],
    response: `VaultEXP's Investment module tracks your entire investment portfolio — stocks, bonds, real estate, crypto, and manual assets. You can monitor unrealized and realized gains, calculate your overall ROI, and view your asset distribution. The AI Investment Intelligence feature analyzes your portfolio diversification and provides recommendations when connected to your investment data.`
  },
  {
    keywords: ['diversification', 'diversify', 'risk', 'portfolio risk', 'rebalance'],
    response: `Portfolio diversification is critical to managing investment risk. VaultEXP tracks your asset allocation across different classes (equities, real estate, fixed income, etc.) and calculates a diversification score. A well-diversified portfolio reduces exposure to any single asset class. Use the Investment dashboard to review your current allocation and identify concentration risks.`
  },

  // ── Wallet / Finance ──────────────────────────────────────────────────
  {
    keywords: ['wallet', 'balance', 'cash', 'liquidity', 'funds', 'account balance'],
    response: `Your VaultEXP Wallet tracks your liquid financial position, including account balances, recent transactions, and cash flow summaries. You can monitor your spending patterns, set budget alerts, and settle outstanding invoices directly from your Wallet dashboard. Keeping your wallet data updated ensures VaultAI has accurate context for financial recommendations.`
  },
  {
    keywords: ['transaction', 'transactions', 'spending history', 'payment history'],
    response: `All your financial transactions are recorded in VaultEXP under the Wallet and Expenses modules. You can filter transactions by date, category, amount, or status. Regular transaction review helps you spot unusual spending patterns and ensures your books stay accurate. VaultAI monitors for unusual expense outliers and will flag anything that's significantly above your normal spending averages.`
  },

  // ── Productivity ──────────────────────────────────────────────────────
  {
    keywords: ['productivity', 'task', 'tasks', 'todo', 'project', 'projects', 'work'],
    response: `VaultEXP includes project and task management tools to keep your team and workflows organized. Create tasks, assign them to team members, set due dates, and track progress. Use the Projects module for larger initiatives and the task system for day-to-day work. Combining VaultEXP's task management with its automation features lets you build powerful productivity workflows.`
  },
  {
    keywords: ['team', 'collaborate', 'collaboration', 'team member', 'staff'],
    response: `VaultEXP's team features let you invite team members, assign roles and permissions, and collaborate on projects, documents, and tasks. Each team member gets access to the modules relevant to their role, maintaining data security. Use the Team section to manage access levels and keep your team aligned on shared goals.`
  },

  // ── Email ─────────────────────────────────────────────────────────────
  {
    keywords: ['email', 'emails', 'send email', 'email client', 'email tool'],
    response: `VaultEXP's email tools help you communicate professionally with clients, teams, and vendors directly from the platform. You can send invoice payment reminders, client follow-ups, and automated emails triggered by your workflows. This keeps all business communication connected to your VaultEXP data for better context and tracking.`
  },

  // ── Dashboard navigation ──────────────────────────────────────────────
  {
    keywords: ['how to use', 'navigate', 'where is', 'find', 'go to', 'access', 'open'],
    response: `VaultEXP's main navigation sidebar gives you quick access to all modules: Dashboard, AI Assistant, CRM, Invoices, Expenses, Documents, Properties, Investments, Tax Strategist, Analytics, Automation, Wallet, Calendar, and Settings. Click any module in the sidebar to navigate directly to it. The main dashboard gives you a consolidated view of key metrics across all your modules.`
  },
  {
    keywords: ['getting started', 'start', 'begin', 'setup', 'onboarding', 'new to'],
    response: `Welcome to VaultEXP! To get started: 1) Complete your profile in Settings. 2) Add your first Business in the Business module. 3) Upload any existing documents to your Document Vault. 4) Log your expenses and invoices. 5) Set up your first automation workflow. VaultAI will begin providing personalized insights as you add more data to your account.`
  },

  // ── Security ──────────────────────────────────────────────────────────
  {
    keywords: ['security', 'secure', 'privacy', 'data protection', 'encryption', 'safe'],
    response: `VaultEXP uses enterprise-grade security to protect your financial and business data. All data is encrypted at rest and in transit. The platform enforces strict tenant isolation, meaning your data is completely separated from other users. Sensitive information like credit card numbers and SSNs are automatically masked in AI responses. You can review your security settings in the Security section of your account.`
  },

  // ── Greetings / General ───────────────────────────────────────────────
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
    response: `Hello! I'm VaultAI, your intelligent business assistant built into VaultEXP. I can help you with your invoices, expenses, business performance, properties, investments, tax planning, CRM, documents, and much more. What would you like to know today?`
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate'],
    response: `You're welcome! I'm here to help you get the most out of VaultEXP. If you have any other questions about your business, finances, or how to use any platform feature, feel free to ask anytime.`
  },
];

/**
 * TALIV GROWTH MESSAGES — used when query doesn't match any knowledge base entry
 */
const GROWTH_MESSAGES = [
  `Taliv is still making me smarter. I'll be able to answer advanced queries about this topic soon. In the meantime, I can help with VaultEXP navigation, invoices, expenses, CRM, documents, tax basics, investments, and business performance. What would you like to know?`,
  `I can currently help with simple VaultEXP, business, productivity, and document questions while Taliv continues improving my intelligence. Could you rephrase your question or try asking about a specific VaultEXP module?`,
  `That's a great question! My advanced reasoning for this topic is still being expanded by Taliv. Currently, I can assist you with your invoices, business analytics, CRM contacts, document management, tax deductions, property management, and investment tracking. What can I help you with in those areas?`,
  `Taliv is continuously training me to handle more complex queries. For now, I'm best equipped to help with VaultEXP platform guidance, financial tracking, invoice management, document organization, and business performance questions.`,
];

/**
 * Normalize a query string for matching.
 * @param {string} query
 * @returns {string}
 */
function normalizeQuery(query) {
  return (query || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ');
}

/**
 * Score a knowledge base entry against a query.
 * Returns a number — higher means better match.
 * @param {string[]} keywords
 * @param {string} normalizedQuery
 * @returns {number}
 */
function scoreEntry(keywords, normalizedQuery) {
  let score = 0;
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword)) {
      // Full phrase match — high score
      score += keyword.split(' ').length * 10;
    } else {
      // Partial word match
      const kwWords = keyword.split(' ');
      for (const kw of kwWords) {
        if (queryWords.some(qw => qw.includes(kw) || kw.includes(qw))) {
          score += 2;
        }
      }
    }
  }
  return score;
}

class AIFallbackService {
  constructor() {
    this._growthMessageIndex = 0;
  }

  /**
   * Generate an intelligent fallback response for a given query.
   * Searches the local knowledge base first, then returns a Taliv growth message.
   *
   * @param {string} query - The user's question or message
   * @param {object} context - Optional context object from the user's account
   * @returns {{ success: true, fallback: true, response: string, source: string }}
   */
  generateFallback(query, context = {}) {
    try {
      const normalized = normalizeQuery(query);

      if (!normalized || normalized.length < 2) {
        return this._buildResponse(
          `Hello! I'm VaultAI. How can I help you today? You can ask me about your invoices, business performance, CRM, documents, taxes, investments, or anything related to VaultEXP.`
        );
      }

      // Find the best matching knowledge base entry
      let bestScore = 0;
      let bestEntry = null;

      for (const entry of KNOWLEDGE_BASE) {
        const score = scoreEntry(entry.keywords, normalized);
        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
        }
      }

      // Minimum score threshold for a confident match
      if (bestScore >= 4 && bestEntry) {
        return this._buildResponse(bestEntry.response);
      }

      // Enrich response with context if available
      const contextualHint = this._getContextualHint(normalized, context);
      if (contextualHint) {
        return this._buildResponse(contextualHint);
      }

      // Return a Taliv growth message
      return this._buildResponse(this._nextGrowthMessage());

    } catch (err) {
      console.error('[AIFallback] Error generating fallback:', err.message);
      return this._buildResponse(
        `Taliv is still making me smarter. I'll be able to answer advanced queries soon. In the meantime, try asking about your invoices, expenses, business performance, or VaultEXP features.`
      );
    }
  }

  /**
   * Generate a fallback AI insight object (used by generateInsights).
   * @returns {object}
   */
  generateInsightsFallback() {
    return {
      summary: `VaultAI is analyzing your dashboard data. Connect your business, property, and investment modules to receive personalized AI insights. Taliv is continuously expanding my analytical capabilities.`,
      anomalies: [],
      recommendations: [
        {
          actionText: 'Complete your business profile to unlock AI insights',
          actionType: 'View Details',
          route: '/business'
        },
        {
          actionText: 'Upload tax documents to the Document Vault',
          actionType: 'View Details',
          route: '/documents'
        },
        {
          actionText: 'Log your expenses to enable spending analysis',
          actionType: 'View Details',
          route: '/expenses'
        }
      ]
    };
  }

  /**
   * Generate a fallback business advice object.
   * @returns {object}
   */
  generateBusinessAdviceFallback() {
    return {
      healthSummary: `Taliv is still making me smarter for advanced business analysis. Add more financial data — including revenue, expenses, and invoices — to unlock personalized AI business advice. VaultAI will analyze profit margins, cash flow trends, and growth opportunities once your data is populated.`,
      revenueTrends: [
        'Track your monthly revenue in the Invoice module to reveal growth trends',
        'Mark business expenses consistently for accurate profit margin analysis'
      ],
      costSavings: [
        {
          category: 'Expenses',
          suggestion: 'Review and categorize all business expenses to identify tax-deductible items',
          potentialImpact: 'medium'
        }
      ],
      improvements: [
        {
          title: 'Complete Business Profile',
          description: 'Add your business financials to unlock deeper AI analysis and recommendations.'
        },
        {
          title: 'Enable Invoice Tracking',
          description: 'Regular invoice logging helps VaultAI identify revenue trends and payment bottlenecks.'
        }
      ]
    };
  }

  /**
   * Generate a fallback property advice object.
   * @returns {object}
   */
  generatePropertyAdviceFallback() {
    return {
      performanceSummary: `Taliv is still making me smarter for advanced property analysis. Add your property details — including tenant information, rent amounts, and maintenance expenses — to unlock personalized AI property insights.`,
      overdueRentAlerts: [],
      leaseExpirations: [],
      tenantRiskAnalysis: [],
      rentOptimizations: [
        {
          suggestedRent: 0,
          currentRent: 0,
          reasoning: 'Add tenant and rent data to VaultEXP to receive AI-powered rent optimization suggestions.',
          estimatedImpactAnnual: 0
        }
      ]
    };
  }

  /**
   * Generate a fallback investment intelligence object.
   * @returns {object}
   */
  generateInvestmentFallback() {
    return {
      performanceSummary: `Taliv is still making me smarter for advanced investment intelligence. Add your investment portfolio — stocks, bonds, real estate, or other assets — to unlock personalized AI portfolio analysis, diversification scoring, and performance benchmarking.`,
      diversificationAnalysis: {
        status: 'moderately_diversified',
        score: 50,
        feedback: 'Add your investment holdings to VaultEXP to receive an accurate diversification score and personalized rebalancing recommendations.'
      },
      assetClassInsights: [
        {
          type: 'General',
          trend: 'neutral',
          insights: 'Log your investments in the Investment module to unlock AI-powered asset class analysis.'
        }
      ],
      investmentRecommendations: [
        {
          action: 'Add your investment portfolio',
          assetClass: 'All',
          reasoning: 'VaultAI needs your investment data to provide personalized recommendations.',
          riskLevel: 'low'
        }
      ]
    };
  }

  /**
   * Generate a fallback tax strategy object.
   * @returns {object}
   */
  generateTaxStrategyFallback() {
    return {
      taxSummary: `Taliv is still making me smarter for advanced tax strategy analysis. Upload your tax documents (W-2, 1099) and mark your expenses as tax-deductible to unlock personalized AI tax optimization guidance.`,
      legalDisclaimer: `VaultEXP AI is an automated planning assistant and does not provide formal legal, accounting, or certified CPA advice. All suggestions are based on standard IRC guidelines and must be vetted by a certified tax professional.`,
      deductionsIdentified: [
        {
          category: 'General Business',
          amount: 0,
          status: 'potential',
          description: 'Mark your business expenses as tax-deductible in the Expenses module to track your deductions.'
        }
      ],
      opportunities: [
        {
          strategy: 'Document All Business Expenses',
          potentialSavings: 0,
          legalityContext: 'Under IRC Section 162, ordinary and necessary business expenses are deductible.',
          actionSteps: [
            'Log all business expenses in VaultEXP',
            'Mark eligible expenses as tax-deductible',
            'Upload receipts and supporting documents to your Document Vault',
            'Review with a certified CPA before filing'
          ]
        }
      ]
    };
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  /**
   * Build a standardized fallback response object.
   */
  _buildResponse(responseText) {
    return {
      success: true,
      fallback: true,
      response: responseText,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get the next Taliv growth message (round-robins through the list).
   */
  _nextGrowthMessage() {
    const msg = GROWTH_MESSAGES[this._growthMessageIndex % GROWTH_MESSAGES.length];
    this._growthMessageIndex++;
    return msg;
  }

  /**
   * Generate a context-aware response hint based on user account data.
   * @param {string} normalizedQuery
   * @param {object} context
   */
  _getContextualHint(normalizedQuery, context) {
    try {
      // If context has business data
      if (context.businesses && context.businesses.length > 0 && normalizedQuery.includes('business')) {
        const names = context.businesses.slice(0, 3).map(b => b.name).join(', ');
        return `I can see you have ${context.businesses.length} business(es) in VaultEXP: ${names}. For detailed AI analysis of your business performance, try asking "Analyze my business health" or navigate to the Business module for a full breakdown.`;
      }

      // If context has property data
      if (context.properties && context.properties.length > 0 && normalizedQuery.includes('property')) {
        return `I can see you have ${context.properties.length} propert(ies) in your portfolio. For detailed property intelligence, use the Property module to view tenant status, rent collection, and lease expiration dates.`;
      }

      return null;
    } catch {
      return null;
    }
  }
}

module.exports = new AIFallbackService();
