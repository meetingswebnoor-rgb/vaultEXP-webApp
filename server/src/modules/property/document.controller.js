'use strict';

const documentService = require('./document.service');
const catchAsync      = require('../../utils/catchAsync');
const ApiResponse     = require('../../utils/apiResponse');

// POST /api/property/:propertyId/documents
exports.createDocument = catchAsync(async (req, res) => {
  const doc = await documentService.create(req.user.id, req.params.propertyId, req.body);
  res.status(201).json(new ApiResponse(201, doc, 'Document added successfully'));
});

// GET /api/property/:propertyId/documents
exports.listDocuments = catchAsync(async (req, res) => {
  const documents = await documentService.list(req.user.id, req.params.propertyId);
  res.status(200).json(new ApiResponse(200, { documents, count: documents.length }, 'Documents retrieved'));
});

// GET /api/property/document/:id
exports.getDocument = catchAsync(async (req, res) => {
  const doc = await documentService.getById(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, doc, 'Document retrieved'));
});

// PUT /api/property/document/:id
exports.updateDocument = catchAsync(async (req, res) => {
  const doc = await documentService.update(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, doc, 'Document updated successfully'));
});

// DELETE /api/property/document/:id
exports.deleteDocument = catchAsync(async (req, res) => {
  const result = await documentService.delete(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Document removed'));
});
