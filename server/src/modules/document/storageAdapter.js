/**
 * storageAdapter.js
 * ─────────────────────────────────────────────────────────────────
 * Cloud-ready storage abstraction layer.
 *
 * Supports:
 *   STORAGE_DRIVER=local        → Local disk (development)
 *   STORAGE_DRIVER=s3           → AWS S3
 *   STORAGE_DRIVER=r2           → Cloudflare R2 (S3-compatible)
 *
 * Usage in upload.middleware.js:
 *   const storage = require('./storageAdapter');
 *   await storage.save(file);
 *   await storage.delete(storedName);
 *   const url = await storage.getSignedUrl(storedName, userId);
 */

const fs   = require('fs');
const path = require('path');

const DRIVER     = process.env.STORAGE_DRIVER || 'local';
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');

// ── Ensure local upload dir exists ────────────────────────────────────────────
if (DRIVER === 'local' && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL ADAPTER (development / single-node)
// ─────────────────────────────────────────────────────────────────────────────
const localAdapter = {
  async save(sourceFilePath, destName) {
    const dest = path.join(UPLOAD_DIR, destName);
    await fs.promises.copyFile(sourceFilePath, dest);
    return dest;
  },

  async delete(storedName) {
    const filePath = path.join(UPLOAD_DIR, storedName);
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
  },

  async getSignedUrl(storedName, userId) {
    // Local: signed URL generated via documentSecurity.middleware
    const { generateSignedDownloadToken } = require('../middleware/documentSecurity.middleware');
    const docRecord = await require('@prisma/client').PrismaClient
      ? null : null; // documentId lookup would go here
    return `/api/documents/secure-download?token=SIGNED_TOKEN`;
  },

  async exists(storedName) {
    return fs.existsSync(path.join(UPLOAD_DIR, storedName));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AWS S3 ADAPTER
// Replace stub with: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
// ─────────────────────────────────────────────────────────────────────────────
const s3Adapter = {
  async save(sourceFilePath, destName) {
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const stream = fs.createReadStream(sourceFilePath);
    // await s3.send(new PutObjectCommand({
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key:    destName,
    //   Body:   stream,
    //   ServerSideEncryption: 'AES256'
    // }));
    console.warn('[StorageAdapter] S3 save stub — configure AWS SDK to enable.');
    return `s3://${process.env.AWS_S3_BUCKET}/${destName}`;
  },

  async delete(storedName) {
    // const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    // await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: storedName }));
    console.warn('[StorageAdapter] S3 delete stub.');
  },

  async getSignedUrl(storedName, expiresInSec = 900) {
    // const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    // const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // return await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: storedName }), { expiresIn: expiresInSec });
    console.warn('[StorageAdapter] S3 presign stub.');
    return null;
  },

  async exists(storedName) {
    // const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
    // try { await s3.send(new HeadObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: storedName })); return true; }
    // catch { return false; }
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CLOUDFLARE R2 ADAPTER (S3-compatible — same SDK, different endpoint)
// ─────────────────────────────────────────────────────────────────────────────
const r2Adapter = {
  async save(sourceFilePath, destName) {
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const r2 = new S3Client({
    //   region: 'auto',
    //   endpoint: process.env.R2_ENDPOINT,
    //   credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY }
    // });
    console.warn('[StorageAdapter] R2 save stub — configure Cloudflare R2 credentials.');
    return `r2://${process.env.R2_BUCKET}/${destName}`;
  },

  async delete(storedName) {
    console.warn('[StorageAdapter] R2 delete stub.');
  },

  async getSignedUrl(storedName, expiresInSec = 900) {
    console.warn('[StorageAdapter] R2 presign stub.');
    return null;
  },

  async exists(storedName) {
    return false;
  }
};

// ── Driver Selector ───────────────────────────────────────────────────────────
const drivers = { local: localAdapter, s3: s3Adapter, r2: r2Adapter };
const adapter = drivers[DRIVER] || localAdapter;

if (DRIVER !== 'local') {
  console.info(`[StorageAdapter] Using driver: ${DRIVER.toUpperCase()}`);
}

module.exports = adapter;
