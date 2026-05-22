/**
 * googleGemini.js
 * ─────────────────────────────────────────────────────────────────────────
 * AI Provider Adapter for Google Gemini
 *
 * SAFE VERSION — never throws, never crashes.
 * Returns a structured fallback object instead of throwing on failure.
 * The AIProviderService handles routing to fallback automatically.
 * ─────────────────────────────────────────────────────────────────────────
 */

const GEMINI_TIMEOUT_MS = 12000; // 12 seconds

/**
 * Race a promise against a timeout.
 * Returns null on timeout.
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(null), ms))
  ]);
}

class GeminiProvider {
  constructor() {
    this.ai = null;
    this._initialized = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this._initialized = true;
        console.log('[Gemini] Provider initialized ✅');
      } catch (err) {
        console.warn('[Gemini] Failed to initialize GoogleGenAI:', err.message);
        this.ai = null;
      }
    } else {
      console.warn('[Gemini] GEMINI_API_KEY not set — provider disabled, fallback active.');
    }
  }

  /**
   * Generate a response using Gemini.
   *
   * SAFE: Never throws. Returns { _fallback: true } on any failure.
   * The AIProviderService handles falling back to local AI when this is returned.
   *
   * @param {string} systemPrompt
   * @param {Array}  history
   * @param {string} userQuery
   * @returns {Promise<object>}
   */
  async generateResponse(systemPrompt, history, userQuery) {
    if (!this.ai || !this._initialized) {
      return { _fallback: true, reason: 'no_api_key' };
    }

    try {
      // Build conversation history
      const contents = (history || []).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(msg.content || '') }]
      }));

      // Add the user query
      contents.push({
        role: 'user',
        parts: [{ text: String(userQuery || '') }]
      });

      const responsePromise = this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
          responseMimeType: 'application/json',
        }
      });

      const response = await withTimeout(responsePromise, GEMINI_TIMEOUT_MS);

      if (!response) {
        console.warn('[Gemini] Request timed out after', GEMINI_TIMEOUT_MS, 'ms');
        return { _fallback: true, reason: 'timeout' };
      }

      // Extract text safely
      const outputText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!outputText || typeof outputText !== 'string' || outputText.trim().length === 0) {
        console.warn('[Gemini] Empty response text received');
        return { _fallback: true, reason: 'empty_response' };
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(outputText);
        return parsed;
      } catch {
        // Gemini returned plain text instead of JSON — wrap it
        return { response: outputText, suggestedActions: [], analyticsSummary: null };
      }

    } catch (err) {
      // Log safely without exposing keys
      const safeMsg = (err.message || '').replace(process.env.GEMINI_API_KEY || '', '[REDACTED]');
      console.warn('[Gemini] API error:', safeMsg);
      return { _fallback: true, reason: 'api_error', message: safeMsg };
    }
  }
}

module.exports = new GeminiProvider();
