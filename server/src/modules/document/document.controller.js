const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const eventBus = require('../../lib/eventBus');

exports.uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || (req.file ? [req.file] : []);

    console.log(`[UPLOAD] Starting upload for user: ${userId}`);
    console.log(`[UPLOAD] Files received:`, files.map(f => ({ name: f.originalname, size: f.size, mime: f.mimetype })));

    if (!files || files.length === 0) {
      console.warn(`[UPLOAD] No files found in request. Check field name (expected "file")`);
      return res.status(400).json({ error: 'No files uploaded or files were rejected. Ensure field name is "file".' });
    }

    const { businessId, propertyId, vaultId, folderId, category, isPrivate } = req.body;
    
    // Sanitize stringified 'null' or 'undefined' values from frontend FormData
    const cleanBusinessId = businessId === 'null' || businessId === 'undefined' ? null : businessId;
    const cleanPropertyId = propertyId === 'null' || propertyId === 'undefined' ? null : propertyId;
    const cleanVaultId    = vaultId === 'null' || vaultId === 'undefined' ? null : vaultId;
    const cleanFolderId   = folderId === 'null' || folderId === 'undefined' ? null : folderId;
    const cleanCategory   = category === 'null' || category === 'undefined' ? null : category;

    console.log(`[UPLOAD] Sanitized Metadata:`, { cleanBusinessId, cleanPropertyId, cleanFolderId, cleanCategory, isPrivate });

    const documentRecords = [];

    for (const file of files) {
      try {
        console.log(`[UPLOAD] Creating Prisma record for: ${file.originalname}`);
        const documentRecord = await prisma.document.create({
          data: {
            userId,
            businessId: cleanBusinessId || null,
            propertyId: cleanPropertyId || null,
            vaultId: cleanVaultId || null,
            folderId: cleanFolderId || null,
            originalName: file.originalname,
            storedName: file.filename,
            fileType: file.mimetype.split('/')[1] || 'other',
            mimeType: file.mimetype,
            fileSize: file.size,
            storagePath: file.path,
            category: cleanCategory || null,
            isPrivate: isPrivate === 'false' || isPrivate === false ? false : true,
            uploadSource: 'web'
          }
        });
        documentRecords.push(documentRecord);
        console.log(`[UPLOAD] Success: ${documentRecord.id}`);

        const { processDocumentAsync } = require('./documentAI.service');
        processDocumentAsync(documentRecord.id, userId, file.path, file.mimetype)
          .then(() => console.log(`[AI] Processing started for ${documentRecord.id}`))
          .catch(err => console.error(`[AI] Failed to start for ${documentRecord.id}:`, err));

        eventBus.emit('document.uploaded', { 
          documentId: documentRecord.id, 
          userId, 
          businessId: cleanBusinessId,
          propertyId: cleanPropertyId,
          category: cleanCategory,
          type: documentRecord.fileType
        });

      } catch (prismaErr) {
        console.error(`[UPLOAD] Prisma creation failed for ${file.originalname}:`, prismaErr);
        throw prismaErr;
      }
    }

    res.status(201).json({
      message: 'Files uploaded successfully.',
      documents: documentRecords
    });
  } catch (error) {
    console.error('[UPLOAD] Fatal Error:', error);
    res.status(500).json({ error: 'An internal server error occurred during file upload.', details: error.message });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q = '', limit = 50, type, folderId } = req.query;

    const queryObj = { userId, isArchived: false };
    
    // Fuzzy search across multiple fields using MySQL contains
    if (q) {
      queryObj.OR = [
        { originalName: { contains: q } },
        { aiSummary: { contains: q } },
        { extractedText: { contains: q } },
        { category: { contains: q } }
      ];
    }
    
    if (type) {
      queryObj.category = type;
    }

    if (folderId) {
      queryObj.folderId = folderId;
    }

    const documents = await prisma.document.findMany({
      where: queryObj,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        aiAnalysis: true,
        business: { select: { name: true } },
        tags: true
      }
    });

    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error in searchDocuments:', error);
    res.status(500).json({ error: 'Failed to search documents.' });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const folders = await prisma.documentFolder.findMany({
      where: { userId: req.user.id, isArchived: false },
      include: {
        _count: { select: { documents: true } }
      }
    });
    res.status(200).json({ folders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folders.' });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, color, parentId } = req.body;
    const userId = req.user.id;

    console.log(`[FOLDER] Creating folder: "${name}" for user ${userId}`);

    if (!name) {
      return res.status(400).json({ error: 'Folder name is required.' });
    }

    const folder = await prisma.documentFolder.create({
      data: {
        name,
        color: color || '#00FF88',
        parentId: parentId || null,
        userId: userId
      }
    });

    console.log(`[FOLDER] Success: ${folder.id}`);
    res.status(201).json({ folder });
  } catch (error) {
    console.error('[FOLDER] Error:', error);
    res.status(500).json({ error: 'Failed to create folder.', details: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[FOLDER] Fetching folders for user: ${userId}`);

    const folders = await prisma.documentFolder.findMany({
      where: { 
        userId,
        isArchived: false
      },
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ folders });
  } catch (error) {
    console.error('[FOLDER] Fetch Error:', error);
    res.status(500).json({ error: 'Failed to retrieve folders.' });
  }
};

exports.archiveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.update({
      where: { id, userId: req.user.id },
      data: { isArchived: true }
    });
    res.status(200).json({ document });
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive document.' });
  }
};

exports.chatWithDocuments = async (req, res) => {
  try {
    const { documentIds, query } = req.body;
    if (!documentIds || !query) {
      return res.status(400).json({ error: 'documentIds array and query string are required.' });
    }

    const { chatWithDocuments } = require('./documentChat.service');
    const result = await chatWithDocuments(req.user.id, documentIds, query);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in chatWithDocuments:', error);
    res.status(500).json({ error: 'AI Chat processing failed.' });
  }
};

exports.generateSignedUrl = (req, res) => {
  try {
    const { generateSignedDownloadToken } = require('../../middleware/documentSecurity.middleware');
    const { token, expiresAt } = generateSignedDownloadToken(req.document.id, req.user.id);
    const downloadUrl = `/api/documents/secure-download?token=${encodeURIComponent(token)}`;
    res.status(200).json({ downloadUrl, expiresAt });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed download URL.' });
  }
};

exports.runCleanup = async (req, res) => {
  try {
    // Restrict to admin users only
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const { runFullCleanup } = require('./documentCleanup.service');
    const report = await runFullCleanup();
    res.status(200).json({ message: 'Cleanup complete.', report });
  } catch (error) {
    console.error('Error running cleanup:', error);
    res.status(500).json({ error: 'Cleanup job failed.' });
  }
};

