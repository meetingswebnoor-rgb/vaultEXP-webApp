/**
 * aiResponseFormatter.js
 * ─────────────────────────────────────────────────────────────────────────
 * Normalizes all AI provider responses into a consistent shape.
 *
 * Different providers (Gemini, OpenAI, Fallback) return data in different
 * formats. This formatter ensures the engine always receives:
 *   { response, suggestedActions, analyticsSummary }
 * ─────────────────────────────────────────────────────────────────────────
 */

class AIResponseFormatter {

  /**
   * Normalize a raw provider response into the VaultAI standard format.
   *
   * @param {any} raw - Raw response from any AI provider
   * @param {string} source - 'gemini' | 'openai' | 'fallback'
   * @returns {{ response: string, suggestedActions: any[], analyticsSummary: string|null }}
   */
  normalize(raw, source = 'unknown') {
    try {
      // ── Already correctly shaped ────────────────────────────────────
      if (raw && typeof raw === 'object') {

        // Fallback service format
        if (raw.fallback === true && raw.response) {
          return {
            response: String(raw.response),
            suggestedActions: [],
            analyticsSummary: null,
            source: 'fallback'
          };
        }

        // Standard VaultAI format from Gemini prompt (has 'response' key)
        if (raw.response && typeof raw.response === 'string') {
          return {
            response: raw.response,
            suggestedActions: Array.isArray(raw.suggestedActions) ? raw.suggestedActions : [],
            analyticsSummary: raw.analyticsSummary || null,
            source
          };
        }

        // Some providers return 'answer' key
        if (raw.answer && typeof raw.answer === 'string') {
          return {
            response: raw.answer,
            suggestedActions: [],
            analyticsSummary: null,
            source
          };
        }

        // OpenAI style: choices[0].message.content
        if (raw.choices && Array.isArray(raw.choices) && raw.choices[0]) {
          const content = raw.choices[0]?.message?.content || raw.choices[0]?.text || '';
          return {
            response: content,
            suggestedActions: [],
            analyticsSummary: null,
            source
          };
        }

        // Has a 'text' or 'content' key
        if (raw.text || raw.content) {
          return {
            response: String(raw.text || raw.content),
            suggestedActions: [],
            analyticsSummary: null,
            source
          };
        }
      }

      // ── String response ─────────────────────────────────────────────
      if (typeof raw === 'string' && raw.trim().length > 0) {
        // Try to parse as JSON first (Gemini returns JSON strings)
        try {
          const parsed = JSON.parse(raw);
          return this.normalize(parsed, source);
        } catch {
          // Plain text response
          return {
            response: raw,
            suggestedActions: [],
            analyticsSummary: null,
            source
          };
        }
      }

    } catch (err) {
      console.error('[AIResponseFormatter] Normalization error:', err.message);
    }

    // ── Ultimate fallback ───────────────────────────────────────────────
    return {
      response: `Taliv is still making me smarter. I'll be able to answer advanced queries soon. In the meantime, I can help with VaultEXP navigation, invoices, business performance, and more.`,
      suggestedActions: [],
      analyticsSummary: null,
      source: 'formatter_fallback'
    };
  }

  /**
   * Ensure the response text is a non-empty string.
   * Guards against undefined, null, empty strings returned by providers.
   */
  ensureResponse(text) {
    if (typeof text === 'string' && text.trim().length > 0) {
      return text;
    }
    return `Taliv is still making me smarter. I'll be able to answer advanced queries soon.`;
  }
}

module.exports = new AIResponseFormatter();
