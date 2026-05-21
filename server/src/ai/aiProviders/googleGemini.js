const { GoogleGenAI } = require('@google/genai');

/**
 * AI Provider Adapter for Google Gemini
 */
class GeminiProvider {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Generate a response using the Gemini model
   * @param {string} systemPrompt 
   * @param {Array} history 
   * @param {string} userQuery 
   */
  async generateResponse(systemPrompt, history, userQuery) {
    try {
      // Build conversation history format for GenAI
      const contents = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Add the new user query
      contents.push({
        role: 'user',
        parts: [{ text: userQuery }]
      });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Keep it analytical and deterministic
          responseMimeType: 'application/json', // Force JSON output as requested in prompt
        }
      });

      const output = response.text;
      return JSON.parse(output);
      
    } catch (error) {
      console.error('Gemini Provider Error:', error);
      throw new Error('Failed to generate AI response from provider.');
    }
  }
}

module.exports = new GeminiProvider();
