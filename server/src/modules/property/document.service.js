/**
 * document.service.js (property module)
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Property Documents via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');
const eventBus = require('../../lib/eventBus');

class DocumentService {
  async _assertPropertyOwner(propertyId, userId) {
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });
    if (!prop || prop.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }
  }

  async create(userId, propertyId, body) {
    await this._assertPropertyOwner(propertyId, userId);

    if (!body.name)    throw new AppError('Document name is required', 422);
    if (!body.fileUrl) throw new AppError('fileUrl is required', 422);
    if (!body.type)    throw new AppError('Document type is required', 422);

    const doc = await prisma.document.create({
      data: {
        userId,
        propertyId,
        tenantId: body.tenantId,
        context: 'property',
        name: body.name,
        fileUrl: body.fileUrl,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes ? parseInt(body.sizeBytes, 10) : null,
        type: body.type || 'other',
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isPrivate: body.isPrivate !== false,
        tags: body.tags || null,
        category: body.notes || body.category,
      },
    });

    eventBus.emit('document.uploaded', { documentId: doc.id, propertyId, userId, category: doc.category, fileType: doc.type });

    return doc;
  }

  async list(userId, propertyId) {
    await this._assertPropertyOwner(propertyId, userId);
    return await prisma.document.findMany({
      where: { propertyId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId, documentId) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc || doc.userId !== userId) {
      throw new AppError('Document not found', 404);
    }
    return doc;
  }

  async update(userId, documentId, body) {
    const existing = await this.getById(userId, documentId);

    const updateData = { ...body };
    delete updateData.id;
    delete updateData.propertyId;
    delete updateData.businessId;
    delete updateData.userId;
    delete updateData.context;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.sizeBytes) updateData.sizeBytes = parseInt(updateData.sizeBytes, 10);
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt);
    if (updateData.notes !== undefined) {
      updateData.category = updateData.notes;
      delete updateData.notes;
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });


    return updated;
  }

  async delete(userId, documentId) {
    await this.getById(userId, documentId);

    await prisma.document.delete({
      where: { id: documentId },
    });


    return { deleted: true };
  }
}

module.exports = new DocumentService();
