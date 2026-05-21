/**
 * documentCleanup.service.js
 * ─────────────────────────────────────────────────────────────────
 * Automated document lifecycle management.
 *
 * Jobs:
 *  1. removeOrphanFiles  — finds files on disk with no DB record
 *  2. detectDuplicates   — finds documents with identical storedName hashes
 *  3. archiveOldFiles    — soft-archives documents older than a threshold
 *  4. storageReport      — returns a usage summary (S3-ready structure)
 */

const fs   = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma     = new PrismaClient();
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');

// ─────────────────────────────────────────────────────────────────────────────
// 1. removeOrphanFiles
//    Scans the upload directory and removes any file that has no matching
//    storedName record in MySQL. Runs safely — only deletes confirmed orphans.
// ─────────────────────────────────────────────────────────────────────────────
async function removeOrphanFiles() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.warn('[Cleanup] Upload directory does not exist. Skipping orphan check.');
      return { removed: 0, errors: 0 };
    }

    // Get all files on disk
    const diskFiles = fs.readdirSync(UPLOAD_DIR);
    if (!diskFiles.length) return { removed: 0, errors: 0 };

    // Get all storedNames registered in MySQL
    const dbRecords = await prisma.document.findMany({
      select: { storedName: true }
    });
    const dbFileSet = new Set(dbRecords.map(r => r.storedName));

    let removed = 0;
    let errors  = 0;

    for (const diskFile of diskFiles) {
      if (!dbFileSet.has(diskFile)) {
        // Not in DB — treat as orphan
        try {
          const fullPath = path.join(UPLOAD_DIR, diskFile);
          fs.unlinkSync(fullPath);
          removed++;
          console.log(`[Cleanup] Removed orphan: ${diskFile}`);
        } catch (err) {
          errors++;
          console.error(`[Cleanup] Failed to remove orphan ${diskFile}:`, err.message);
        }
      }
    }

    console.log(`[Cleanup] Orphan scan complete. Removed: ${removed}, Errors: ${errors}`);
    return { removed, errors };
  } catch (error) {
    console.error('[Cleanup] removeOrphanFiles failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. detectDuplicates
//    Finds documents within the same userId that share an identical originalName
//    and fileSize — strong indicator of duplicate uploads.
// ─────────────────────────────────────────────────────────────────────────────
async function detectDuplicates() {
  try {
    // Group by userId + originalName + fileSize to find collisions
    const allDocs = await prisma.document.findMany({
      where: { isArchived: false },
      select: { id: true, userId: true, originalName: true, fileSize: true, createdAt: true }
    });

    const seen   = new Map();
    const dupes  = [];

    for (const doc of allDocs) {
      const key = `${doc.userId}::${doc.originalName}::${doc.fileSize}`;
      if (seen.has(key)) {
        dupes.push({ original: seen.get(key), duplicate: doc });
      } else {
        seen.set(key, doc);
      }
    }

    console.log(`[Cleanup] Duplicate detection complete. Found: ${dupes.length} duplicate sets.`);
    return dupes;
  } catch (error) {
    console.error('[Cleanup] detectDuplicates failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. archiveOldFiles
//    Soft-archives non-private documents older than `thresholdDays`.
//    Does NOT delete any data. Purely a lifecycle management operation.
// ─────────────────────────────────────────────────────────────────────────────
async function archiveOldFiles(thresholdDays = 365) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const result = await prisma.document.updateMany({
      where: {
        createdAt:  { lt: cutoffDate },
        isArchived: false,
        isPrivate:  false
      },
      data: { isArchived: true }
    });

    console.log(`[Cleanup] Archived ${result.count} old document(s) older than ${thresholdDays} days.`);
    return result.count;
  } catch (error) {
    console.error('[Cleanup] archiveOldFiles failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. storageReport
//    Returns a structured report of storage usage.
//    S3/R2-ready: the same data shape can be fed from AWS S3 ListObjectsV2.
// ─────────────────────────────────────────────────────────────────────────────
async function storageReport() {
  try {
    const [totalDocs, archivedDocs, sizeAgg] = await Promise.all([
      prisma.document.count({ where: { isArchived: false } }),
      prisma.document.count({ where: { isArchived: true } }),
      prisma.document.aggregate({ _sum: { fileSize: true }, where: { isArchived: false } })
    ]);

    const totalBytes = sizeAgg._sum.fileSize || 0;
    const totalMB    = (totalBytes / 1024 / 1024).toFixed(2);

    return {
      activeDocuments:   totalDocs,
      archivedDocuments: archivedDocs,
      totalStorageMB:    parseFloat(totalMB),
      // S3-ready keys for future cloud migration:
      storageDriver:     process.env.STORAGE_DRIVER || 'local',
      bucketName:        process.env.AWS_S3_BUCKET   || null,
      r2Endpoint:        process.env.R2_ENDPOINT      || null
    };
  } catch (error) {
    console.error('[Cleanup] storageReport failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. runFullCleanup
//    Master job — runs all cleanup tasks sequentially. Schedule with cron.
// ─────────────────────────────────────────────────────────────────────────────
async function runFullCleanup() {
  console.log('[Cleanup] ── Starting full document lifecycle cleanup ──');
  const orphan     = await removeOrphanFiles();
  const dupes      = await detectDuplicates();
  const archived   = await archiveOldFiles();
  const report     = await storageReport();
  console.log('[Cleanup] ── Cleanup complete ──', { orphan, dupes: dupes.length, archived });
  return { orphan, duplicates: dupes, archived, report };
}

module.exports = {
  removeOrphanFiles,
  detectDuplicates,
  archiveOldFiles,
  storageReport,
  runFullCleanup
};
