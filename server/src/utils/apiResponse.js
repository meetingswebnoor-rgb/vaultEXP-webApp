/**
 * Unified API Response utility.
 * Supports both { ApiResponse } (named) and default imports.
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(message, data) {
    return new ApiResponse(200, data, message);
  }

  static created(message, data) {
    return new ApiResponse(201, data, message);
  }

  static paginated(message, data, meta) {
    const r = new ApiResponse(200, data, message);
    r.meta = meta;
    return r;
  }
}

module.exports = ApiResponse;
module.exports.ApiResponse = ApiResponse;
