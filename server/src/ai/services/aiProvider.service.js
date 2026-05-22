/**
 * aiProvider.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * AI Provider Router
 *
 * Detects which AI providers are configured and routes requests accordingly.
 * Falls back gracefully — NEVER throws, NEVER crashes.
 *
 * Priority order:
 *   1. Google Gemini (if GEMINI_API_KEY is set)
 *   2. OpenAI (if OPENAI_API_KEY is set) — reserved for future
 *   3. Claude (if ANTHROPIC_API_KEY is set) — reserved for future
 *   4. Local Fallback AI (always available)
 * ─────────────────────────────────────────────────────────────────────────
 */

const fallbackService = require('./aiFallback.service');
const responseFormatter = require('./aiResponseFormatter');

// ── Provider detection (safe, no throws) ──────────────────────────────────
const PROVIDERS = {
  hasGemini:    !!process.env.GEMINI_API_KEY,
  hasOpenAI:    !!process.env.OPENAI_API_KEY,
  hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
};

// Log provider status at startup
console.log(`[AIProvider] Gemini: ${PROVIDERS.hasGemini ? '✅ configured' : '⚠️  not configured (fallback active)'}`);
console.log(`[AIProvider] OpenAI: ${PROVIDERS.hasOpenAI ? '✅ configured' : '⚠️  not configured'}`);

// ── Timeout helper ────────────────────────────────────────────────────────
/**
 * Races a promise against a timeout.
 * Resolves with null if the timeout fires first.
 * @param {Promise} promise
 * @param {number} ms
 */
function withTimeout(promise, ms = 10000) {
  const timeout = new Promise(resolve =>
    setTimeout(() => resolve(null), ms)
  );
  return Promise.race([promise, timeout]);
}

class AIProviderService {

  /**
   * Generate an AI response using the best available provider.
   * Automatically falls back to local AI if provider fails.
   *
   * @param {string} systemPrompt - System / context prompt
   * @param {Array}  history      - Conversation history
   * @param {string} userQuery    - The user's message
   * @param {object} context      - Optional user context for better fallbacks
   * @returns {Promise<{ response, suggestedActions, analyticsSummary, source }>}
   */
  async generateResponse(systemPrompt, history, userQuery, context = {}) {
    // ── 1. Try Gemini ──────────────────────────────────────────────────
    if (PROVIDERS.hasGemini) {
      try {
        const geminiProvider = require('../aiProviders/googleGemini');
        const result = await withTimeout(
          geminiProvider.generateResponse(systemPrompt, history, userQuery),
          12000 // 12-second timeout
        );

        if (result && !result.error && !result._fallback) {
          const formatted = responseFormatter.normalize(result, 'gemini');
          if (formatted.response && formatted.response.trim().length > 10) {
            return formatted;
          }
        }
        console.warn('[AIProvider] Gemini returned empty/invalid response — switching to fallback');
      } catch (err) {
        console.warn('[AIProvider] Gemini failed:', err.message, '— switching to fallback');
      }
    }

    // ── 2. Try OpenAI (future support) ────────────────────────────────
    if (PROVIDERS.hasOpenAI) {
      // Reserved for future OpenAI integration
      // try { ... } catch { fall through }
    }

    // ── 3. Try Anthropic/Claude (future support) ───────────────────────
    if (PROVIDERS.hasAnthropic) {
      // Reserved for future Claude integration
      // try { ... } catch { fall through }
    }

    // ── 4. Local Fallback AI — always works ───────────────────────────
    const fallbackResult = fallbackService.generateFallback(userQuery, context);
    return responseFormatter.normalize(fallbackResult, 'fallback');
  }

  /**
   * Returns the active provider name for display purposes.
   */
  getActiveProvider() {
    if (PROVIDERS.hasGemini) return 'Gemini';
    if (PROVIDERS.hasOpenAI) return 'OpenAI';
    if (PROVIDERS.hasAnthropic) return 'Claude';
    return 'VaultAI Local';
  }

  /**
   * Returns provider status information.
   */
  getProviderStatus() {
    return {
      gemini:    PROVIDERS.hasGemini,
      openai:    PROVIDERS.hasOpenAI,
      anthropic: PROVIDERS.hasAnthropic,
      active:    this.getActiveProvider(),
      fallbackAvailable: true
    };
  }
}

module.exports = new AIProviderService();
