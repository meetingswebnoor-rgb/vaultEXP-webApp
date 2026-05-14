const cloudinary = require('cloudinary').v2;
const { appConfig } = require('../config/app.config');

// Config check to make sure cloudinary will work if env vars are present
// Since app.config might not have cloudinary, we'll just fall back to process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to cloudinary using an upload stream
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Cloudinary folder
 * @param {String} resourceType - 'auto', 'image', 'raw', etc.
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = 'vaultexp/documents', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Mock upload if Cloudinary is not configured, useful for local dev
      console.warn('Cloudinary is not configured. Mocking upload.');
      return resolve({
        secure_url: `https://mock-storage.com/${folder}/mock-file-${Date.now()}`,
        bytes: buffer.length,
        format: 'mock',
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes a file from cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return true;
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary
};
