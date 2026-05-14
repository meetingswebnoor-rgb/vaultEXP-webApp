const aiService = require('./ai.service');

/**
 * AIController — Internal Intelligence API
 */
class AIController {
  /**
   * getContext
   * Returns the current AI context for the authenticated user.
   */
  async getContext(req, res) {
    try {
      const context = await aiService.getUserContext(req.user.id);
      res.status(200).json({
        success: true,
        data: context
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * getBusinessContext
   */
  async getBusinessContext(req, res) {
    try {
      const context = await aiService.getBusinessContext(req.params.businessId);
      res.status(200).json({
        success: true,
        data: context
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AIController();
